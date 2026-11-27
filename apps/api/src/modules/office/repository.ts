import { Office } from "../../generated/prisma/client.js";
import { DbClient, defaultDb } from "../../lib/db.js";
import type { CreateOfficeInput } from "./schema.js";

export const officeRepository = {
  async create(data: CreateOfficeInput, db: DbClient = defaultDb): Promise<Office> {
    return db.office.create({
      data,
    });
  },
};
