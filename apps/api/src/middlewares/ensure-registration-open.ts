import { Request, Response, NextFunction } from "express";
import { setupService } from "../modules/setup/setup.service.js";
import { RegistrationClosedError } from "../helpers/errors/registration-closed-error.js";

export async function ensureRegistrationOpen(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  if (await setupService.isRegistrationOpen()) return next();
  next(new RegistrationClosedError());
}