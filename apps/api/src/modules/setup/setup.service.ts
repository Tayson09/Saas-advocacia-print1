// src/modules/setup/setup.service.ts
import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { RegistrationClosedError } from "../../helpers/errors/registration-closed-error.js";
import { setupRepository } from "./setup.repository.js";
import { userRepository } from "../user/user.repositories.js";
import { auditRepository } from "../audit/audit.repository.js";
import type { RegisterAdminInput } from "./setup.schema.js";

export const setupService = {
  async isRegistrationOpen() {
    return !(await setupRepository.isCompleted());
  },

  async registerAdmin(input: RegisterAdminInput, ip?: string) {
    if (!(await this.isRegistrationOpen())) {
      throw new RegistrationClosedError();
    }

    const passwordHash = await argon2.hash(input.password); // RN05

    return prisma.$transaction(async (tx) => {
      await setupRepository.markCompleted(tx); // P2002 se outra requisição chegou antes

      const admin = await userRepository.create(
        {
          name: input.name,
          email: input.email,
          passwordHash,
          role: UserRole.ADMIN,
        },
        tx
      );

      await auditRepository.log(
        { action: "ADMIN_REGISTERED", userId: admin.id, ip }, // RN06
        tx
      );

      return admin;
    });
  },
};