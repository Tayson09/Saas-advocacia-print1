import { DbClient, defaultDb } from "../../lib/db.js";
import type { UserRole } from "../../generated/prisma/enums.js";

export type CreateUserData = {
name: string;
email: string;
role: UserRole;
passwordHash: string;
passwordSetupCompletedAt?: Date | null;
isActive?: boolean;
};

const publicUserSelect = {
id: true,
name: true,
email: true,
role: true,
isActive: true,
passwordSetupCompletedAt: true,
createdAt: true,
} as const;

export const userRepository = {
  create(data: CreateUserData, db: DbClient = defaultDb) {
    return db.user.create({
      data,
      select: publicUserSelect, // nunca devolve passwordHash (RNF02)
    });
  },

  // lista usuários ativos, opcionalmente filtrando por perfil, ordenados por nome
  list(role: UserRole | undefined, db: DbClient = defaultDb) {
    return db.user.findMany({
      where: {
        isActive: true,
        ...(role ? { role } : {}),
      },
      select: publicUserSelect, // nunca devolve passwordHash (RNF02)
      orderBy: { name: "asc" },
    });
  },

  findById: (id: string, db: DbClient = defaultDb) =>
    db.user.findUnique({ where: { id }, select: publicUserSelect }),

  findByEmailWithPassword: (email: string, db: DbClient = defaultDb) =>
    db.user.findUnique({ where: { email } }),

  findByEmail(email: string, db: DbClient = defaultDb) {
    return db.user.findUnique({
      where: { email },
      select: {
      id: true,
      email: true,
      },
    });
  },

  findForAuthorization: (id: string, db: DbClient = defaultDb) => {
    return db.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });
  },

  findPasswordSetupByHash(tokenHash: string, db: DbClient = defaultDb) {
    return db.passwordSetupToken.findUnique({ where: { tokenHash }, include: { user: true } });
  },

  consumePasswordSetupToken(id: string, db: DbClient = defaultDb) {
    return db.passwordSetupToken.updateMany({
      where: {
        id,
        usedAt: null,
        expiresAt: {gt: new Date()},
      },
      data: {
        usedAt: new Date(),
      },
    });
  },

  createPasswordResetToken(
    data: { userId: string; tokenHash: string; expiresAt: Date },
    db: DbClient = defaultDb
  ) {
    return db.passwordResetToken.create({ data });
  },

  // invalida tokens de reset ainda válidos do usuário (só o mais recente deve valer)
  invalidatePasswordResetTokens(userId: string, db: DbClient = defaultDb) {
    return db.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },

  findPasswordResetByHash(tokenHash: string, db: DbClient = defaultDb) {
    return db.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });
  },

  consumePasswordResetToken(id: string, db: DbClient = defaultDb) {
    return db.passwordResetToken.updateMany({
      where: {
        id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        usedAt: new Date(),
      },
    });
  }
};