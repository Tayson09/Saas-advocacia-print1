import crypto from "node:crypto";
import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import { userRepository } from "./user.repositories.js";
import { auditRepository } from "../audit/audit.repository.js";
import { AppError } from "../../helpers/errors/app-error.js";
import { StatusCodes } from "http-status-codes";
import type { UserRole } from "../../generated/prisma/enums.js";
import { CompletePasswordSetupInput, completePasswordSetupSchema } from "./user.schema.js";

const PASSWORD_SETUP_TOKEN = 60 * 60 * 1000 // 1HORA

type NewUserRole = Extract<UserRole, "LAWYER" | "SECRETARY">;

export type CreateUserInput = {
  name: string;
  email: string;
  role: NewUserRole;
};

function invalidSetupToken(): AppError {
  throw new AppError("Token de configuração inválido ou expirado", StatusCodes.BAD_REQUEST, "INVALID_PASSWORD_SETUP_TOKEN");
}

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
  },

  async completePasswordSetup(input: CompletePasswordSetupInput) {
    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");
    const setupToken = await userRepository.findPasswordSetupByHash(tokenHash);

    if (!setupToken || setupToken.usedAt || setupToken.expiresAt <= new Date()) throw invalidSetupToken();

    const passwordHash = await argon2.hash(input.password);

    await prisma.$transaction(async (tx) => {
      const consumed = await userRepository.consumePasswordSetupToken(setupToken.id, tx);
      
      if (consumed.count !== 1) throw invalidSetupToken();

      const updated = await tx.user.updateMany({
        where: {
          id: setupToken.userId,
          isActive: true,
          passwordSetupCompletedAt: null,
        },
        data: {
          passwordHash,
          passwordSetupCompletedAt: new Date(),
        },
      });

      if (updated.count !== 1) throw invalidSetupToken();
    })
  }
}