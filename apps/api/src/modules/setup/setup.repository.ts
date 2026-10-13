import { DbClient, defaultDb } from "../../lib/db.js";

export const setupRepository = {
  async isCompleted(db: DbClient = defaultDb) {
    const setup = await db.systemSetup.findUnique({ where: { id: 1 } });
    return setup !== null;
  },

  markCompleted: (db: DbClient = defaultDb) =>
    db.systemSetup.create({ data: { id: 1 } }),
};