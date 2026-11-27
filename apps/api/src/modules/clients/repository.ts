import { DbClient, defaultDb } from "../../lib/db.js";
import { CreateClientInput } from "./schema.js";

export const ClientRepository = {
  async create(
    input: CreateClientInput,
    officeId: string,
    db: DbClient = defaultDb,
  ) {
    const commonData = {
      officeId,
      type: input.type,
      name: input.name,
      document: input.document,
      email: input.email,
      phone: input.phone,

      addresses: input.addresses
        ? {
            create: input.addresses.map((address) => ({
              type: address.type,
              zipCode: address.zipCode,
              street: address.street,
              number: address.number,
              complement: address.complement,
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state,
              isPrimary: address.isPrimary,
            })),
          }
        : undefined,
    };

    if (input.type === "INDIVIDUAL") {
      return db.client.create({
        data: {
          ...commonData,

          individualData: {
            create: input.individualData ?? {},
          },
        },
        include: {
          individualData: true,
          addresses: true,
        },
      });
    }

    return db.client.create({
      data: {
        ...commonData,

        companyData: {
          create: input.companyData ?? {},
        },
      },
      include: {
        companyData: true,
        addresses: true,
      },
    });
  },

  async findByDocument(
    document: string,
    officeId: string,
    db: DbClient = defaultDb,
  ) {
    return db.client.findUnique({
      where: {
        officeId_document: {
          officeId,
          document,
        },
      },
    });
  },
};
