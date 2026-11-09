import type { Request, Response, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service.js";
import { CreateUserInput } from "./user.service.js";

export const UserController = {
  async create(req: Request, res: Response) {

    const adminId = res.locals.userId as string;
    const input = req.body as CreateUserInput;

    const result = await UserService.create(input, adminId, req.ip);

    return res.status(StatusCodes.CREATED).json({user: result.user, emailSent: result.emailSent});
  },

  async completePasswordSetup(req: Request, res: Response) {
    await UserService.completePasswordSetup(req.body);

    return res.status(StatusCodes.OK).json({ message: "Senha configurada com sucesso!" });
  }
}