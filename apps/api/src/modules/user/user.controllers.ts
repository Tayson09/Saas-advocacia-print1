import type { Request, Response, RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.services.js";
import { CreateUserInput } from "./user.services.js";

export const UserController = {
  async create(req: Request, res: Response) {
    console.log("Chegou ao UserController.create");

    const adminId = res.locals.userId as string;
    const input = req.body as CreateUserInput;

    const result = await UserService.create(input, adminId, req.ip);

    return res.status(StatusCodes.CREATED).json(result.user);
  }
}