import { DbClient, defaultDb } from "../../lib/db.js";
import type {
  LinkInput,
  EndLinkInput,
  UpdateBodyLinkInput,
  UpdateParamsLinkInput,
  CancelParamsLinkInput,
  CancelBodyLinkInput,
} from "./lawyer-secretary-links.schema.js";

export const linkRepository = {
  findById(id: string, db: DbClient = defaultDb) {
    return db.lawyerSecretaryLink.findUnique({
      where: {
        id,
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
    const { count } = await db.lawyerSecretaryLink.updateMany({
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

  async updateLink(
    { id }: UpdateParamsLinkInput,
    data: UpdateBodyLinkInput,
    today: Date,
    db: DbClient = defaultDb,
  ) {
    const { count } = await db.lawyerSecretaryLink.updateMany({
      where: {
        id,
        canceledAt: null,
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      data,
    });
    return count;
  },

  async cancelLink(
    params: CancelParamsLinkInput,
    today: Date,
    input: CancelBodyLinkInput,
    canceledById: string,
    db: DbClient = defaultDb,
  ) {
    const { count } = await db.lawyerSecretaryLink.updateMany({
      where: {
        id: params.id,
        canceledAt: null,
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      data: {
        canceledAt: today,
        cancellationReason: input.reason,
        canceledById,
      },
    });

    return count;
  },
};
