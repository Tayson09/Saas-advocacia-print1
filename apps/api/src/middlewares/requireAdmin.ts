import type { Request, Response, NextFunction, RequestHandler } from "express";
import { userRepository } from "../modules/user/user.repositories.js";
import { AppError } from "../helpers/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

export const requireAdmin: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Entrou no requireAdmin");
    const userId = res.locals.userId as string | undefined;

    if (!userId) return next(new AppError("Autenticação necessária", StatusCodes.UNAUTHORIZED, "UNAUTHENTICATED"));

    const user = await userRepository.findForAuthorization(userId);

    if (!user || !user.isActive) return next(new AppError("Acesso restrito a administradores", StatusCodes.FORBIDDEN, "FORBIDDEN"));

    return next();
  } catch (error) {
    return next(error);
  }
}