import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { linkService } from "./lawyer-secretary-links.service.js";
import { LinkInput, EndLinkInput } from "./lawyer-secretary-links.schema.js";

export const linkController = {
  async create(req: Request, res: Response) {
    const input = req.body as LinkInput;

    const result = await linkService.create(input);

    return res.status(StatusCodes.CREATED).json(result);
  },

  async list(_req: Request, res: Response) {
    const links = await linkService.list();

    return res.status(StatusCodes.OK).json(links);
  },

  async endLink(req: Request, res: Response) {
    const input = req.params as EndLinkInput;

    await linkService.endLink(input);

    return res.status(StatusCodes.NO_CONTENT).send();
  }
};
