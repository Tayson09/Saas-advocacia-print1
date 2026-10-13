import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { setupService } from "./setup.service.js";

export const setupController = {
  async registerAdmin(req: Request, res: Response) {
    const admin = await setupService.registerAdmin(req.body, req.ip);
    res.status(StatusCodes.CREATED).json(admin);
  },

  async status(_req: Request, res: Response) {
    const registrationOpen = await setupService.isRegistrationOpen();
    res.status(StatusCodes.OK).json({ registrationOpen });
  },
};