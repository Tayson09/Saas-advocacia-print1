import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service.js";

export const AuthController = {
  async login(req: Request, res: Response) {
    const user = await AuthService.login(req.body);
    res.status(StatusCodes.OK).json(user);
  },

  async refresh(req: Request, res: Response) {
    res.status(StatusCodes.OK).json(await AuthService.refresh(req.body, req.ip));
  }
};