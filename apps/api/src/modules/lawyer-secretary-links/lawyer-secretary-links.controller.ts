import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { linkService } from "./lawyer-secretary-links.service.js";
import { LinkInput } from "./lawyer-secretary-links.schema.js";

export const linkController = {
  async create(req: Request, res: Response) {
    const input = req.body as LinkInput;

    const result = await linkService.create(input);

    return res.status(StatusCodes.CREATED).json(result);
  },
};
