import { DbClient, defaultDb } from "../../lib/db.js";
import { LinkInput } from "./lawyer-secretary-links.schema.js";

export const linkRepository = {
  create(data: LinkInput, db: DbClient = defaultDb) {
    return db.lawyerSecretaryLink.create({ data });
  }
}