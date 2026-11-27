import { ClientService } from "./service.js";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { CreateClientInput } from "./schema.js";

export const ClientController = {
  async create(req: Request, res: Response) {
    const input = req.body as CreateClientInput;
    const officeId = res.locals.officeId as string;

    const clients = await ClientService.create(input, officeId);

    return res.status(StatusCodes.CREATED).json(clients);
  },
};
