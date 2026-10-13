import { DbClient, defaultDb } from "../../lib/db.js";

export const auditRepository = {
  log(
    data: { action: string; userId?: string; ip?: string },
    db: DbClient = defaultDb
  ) {
    return db.auditLog.create({ data });
  },
};