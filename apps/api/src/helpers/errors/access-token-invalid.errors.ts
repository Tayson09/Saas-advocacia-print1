import { StatusCodes } from "http-status-codes";
import { AppError } from "./app-error.js";

export class AccessTokenInvalid extends AppError {
  constructor() {
    super(
      "Token de acesso inválido.",
      StatusCodes.UNAUTHORIZED,
      "INVALID_ACCESS_TOKEN"
    )
  }
}