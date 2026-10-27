import crypto from "node:crypto";
import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import { userRepository } from "./user.repositories.js";
import { auditRepository } from "../audit/audit.repository.js";
import { AppError } from "../../helpers/errors/app-error.js";
import { StatusCodes } from "http-status-codes";
import type { UserRole } from "../../generated/prisma/enums.js";

const PASSWORD_SETUP_TOKEN = 60 * 60 * 1000 // 1HORA

type NewUserRole = Extract<UserRole, "LAWYER" | "SECRETARY">;

export type CreateUserInput = {
  name: string;
  email: string;
  role: NewUserRole;
};

export const UserService = {
  async create(input: CreateUserInput, adminId: string, ip?: string) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) throw new AppError("Este e-mail já está cadastrado", StatusCodes.CONFLICT, "EMAIL_ALREADY_EXISTS");

    const temporarySecret = crypto.randomBytes(32).toString("hex");
    const passwordHash = await argon2.hash(temporarySecret);

    const setupToken = crypto.randomBytes(32).toString("base64url");

    const tokenHash = crypto.createHash("sha256").update(setupToken).digest("hex");

    const expiresAt = new Date(Date.now() + PASSWORD_SETUP_TOKEN);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await userRepository.create(
        {
          name: input.name,
          email: input.email,
          role: input.role,
          passwordHash,
          passwordSetupCompletedAt: null,
          isActive: true,
        }, tx
      );

      await tx.passwordSetupToken.create(
        {
          data: { userId: createdUser.id, tokenHash, expiresAt }
        }
      );

      await auditRepository.log(
        {
          action: "USER_REGISTERED",
          userId: adminId,
          ip,
        }, tx
      );

      return createdUser
    });

    return {user, setupToken, expiresAt};
  }
}