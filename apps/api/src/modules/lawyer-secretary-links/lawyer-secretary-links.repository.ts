import { DbClient, defaultDb } from "../../lib/db.js";
import type { LinkInput } from "./lawyer-secretary-links.schema.js";

export const linkRepository = {
  create(data: LinkInput, db: DbClient = defaultDb) {
    return db.lawyerSecretaryLink.create({ data });
  },

  list(db: DbClient = defaultDb) {
    const links = db.lawyerSecretaryLink.findMany({
      include: {
        lawyer: {
          select: { name: true, email: true },
        },
        secretary: {
          select: { name: true, email: true },
        },
      },
    });

    return links;
  },
};
