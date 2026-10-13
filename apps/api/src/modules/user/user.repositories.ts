// src/modules/users/user.repository.ts
import { DbClient, defaultDb } from "../../lib/db.js";
import type { UserRole } from "../../generated/prisma/enums.js";
import { RegisterAdminInput } from "../setup/setup.schema.js";

export type CreateUserData = Omit<RegisterAdminInput, "password"> & {
  passwordHash: string;
  role: UserRole;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

export const userRepository = {
  create(data: CreateUserData, db: DbClient = defaultDb) {
    return db.user.create({
      data,
      select: publicUserSelect, // nunca devolve passwordHash (RNF02)
    });
  },

  findById: (id: string, db: DbClient = defaultDb) =>
    db.user.findUnique({ where: { id }, select: publicUserSelect }),

  findByEmailWithPassword: (email: string, db: DbClient = defaultDb) =>
    db.user.findUnique({ where: { email } }),
};