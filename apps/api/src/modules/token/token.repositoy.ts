import { DbClient, defaultDb } from "../../lib/db.js";

export const TokenRepository = {
  createRefreshToken(data: {
    userId: string;
    familyId: string;
    tokenHash: string;
    expiresAt: Date;
    sessionExpiresAt: Date;
  }, db: DbClient = defaultDb) {
    return db.refreshToken.create({ data });
  },

  findByHash(tokenHash: string, db: DbClient = defaultDb) {
    return db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, role: true, isActive: true, name: true } } },
    });
  },

  // Consome só se ainda válido. true = ESTA chamada consumiu (atômico).
  async markAsUsed(id: string, now: Date, db: DbClient = defaultDb) {
    const { count } = await db.refreshToken.updateMany({
      where: { id, usedAt: null, revokedAt: null, expiresAt: { gt: now }, sessionExpiresAt: { gt: now } },
      data: { usedAt: now },
    });
    return count === 1;
  },

  setReplacedBy: (id: string, replacedByTokenId: string, db: DbClient = defaultDb) =>
    db.refreshToken.update({ where: { id }, data: { replacedByTokenId } }),

  revokeFamily: (familyId: string, db: DbClient = defaultDb) =>
    db.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
}