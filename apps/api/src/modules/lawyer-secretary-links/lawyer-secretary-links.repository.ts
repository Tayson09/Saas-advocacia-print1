import { DbClient, defaultDb } from "../../lib/db.js";
import type {
  LinkInput,
  EndLinkInput,
} from "./lawyer-secretary-links.schema.js";

export const linkRepository = {
  findById(id: string, db: DbClient = defaultDb) {
    return db.lawyerSecretaryLink.findUnique({
      where: {
        id
      },
    });
  },

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

  async endLink(data: EndLinkInput, date: Date, db: DbClient = defaultDb) {
    const { count }= await db.lawyerSecretaryLink.updateMany({
      where: {
        id: data.id,
        endDate: null,
        canceledAt: null,
      },
      data: {
        endDate: date,
      },
    });

    return count;
  },
};
