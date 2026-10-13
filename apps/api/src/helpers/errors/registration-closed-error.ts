import { StatusCodes } from "http-status-codes";
import { AppError } from "./app-error.js";

export class RegistrationClosedError extends AppError {
  constructor() {
    super(
      "O cadastro inicial já foi realizado. Novos administradores devem ser criados internamente pelo painel.",
      StatusCodes.FORBIDDEN,
      "REGISTRATION_CLOSED"
    );
  }
}