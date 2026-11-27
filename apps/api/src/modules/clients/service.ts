import { StatusCodes } from "http-status-codes";
import { AppError } from "../../helpers/errors/app-error.js";
import { ClientRepository } from "./repository.js";
import { CreateClientInput } from "./schema.js";

export const ClientService = {
  async create(input: CreateClientInput, officeId: string) {
    const existingClient = await ClientRepository.findByDocument(
      input.document,
      officeId,
    );

    if (existingClient) {
      throw new AppError(
        "Já existe um cliente cadastrado com este CPF/CNPJ.",
        StatusCodes.CONFLICT,
        "CLIENT_ALREADY_EXISTS",
      );
    }

    return ClientRepository.create(input, officeId);
  },
};
