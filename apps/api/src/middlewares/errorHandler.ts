import { Request, Response, NextFunction } from "express";
import { AppError } from "../helpers/erros/app-error.js";
import { Prisma } from "../generated/prisma/client.js";
import { StatusCodes } from "http-status-codes";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(StatusCodes.CONFLICT).json({
          status: "error",
          code: "UNIQUE_CONSTRAINT",
          message: "Já existe um registro com esses dados"
        });
      
      case "P2025":
        return res.status(StatusCodes.NOT_FOUND).json({
          status: "error",
          code: "NOT_FOUND",
          message: "Registro não encontrado"
        });
        
      case "P2003":
        return res.status(StatusCodes.CONFLICT).json({
          status: "error",
          code: "FOREIGN_KEY_VIOLATION",
          message: "Essa operação viola uma relação com outro registro"
        });
    }
  }

  console.error(err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: "error",
    code: "INTERNAL_ERROR",
    message: "Erro interno do servidor"
  });
}