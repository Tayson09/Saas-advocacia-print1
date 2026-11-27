// src/modules/setup/setup.service.ts
import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { RegistrationClosedError } from "../../helpers/errors/registration-closed-error.js";
import { setupRepository } from "./setup.repository.js";
import { userRepository } from "../user/user.repositories.js";
import { auditRepository } from "../audit/audit.repository.js";
import type { RegisterAdminInput } from "./setup.schema.js";
import { officeRepository } from "../office/repository.js";

export const setupService = {
  async isRegistrationOpen() {
    return !(await setupRepository.isCompleted());
  },

  async registerAdmin(input: RegisterAdminInput, ip?: string) {
    if (!(await this.isRegistrationOpen())) {
      throw new RegistrationClosedError();
    }

    const passwordHash = await argon2.hash(input.password);

    return prisma.$transaction(async (tx) => {
      await setupRepository.markCompleted(tx);

      // 1. Cria o escritório
      const office = await officeRepository.create(
        {
          cnpj: input.office.cnpj,
          name: input.office.name,
          tradeName: input.office.tradeName,
        },
        tx,
      );

      // 2. Cria o administrador associado ao escritório
      const admin = await userRepository.create(
        {
          name: input.name,
          email: input.email,
          passwordHash,
          role: UserRole.ADMIN,
          officeId: office.id,
        },
        tx,
      );

      // 3. Registra a auditoria
      await auditRepository.log(
        {
          action: "ADMIN_REGISTERED",
          userId: admin.id,
          ip,
        },
        tx,
      );

      return admin;
    });
  },
};
