import { StatusCodes } from "http-status-codes";
import { AppError } from "./app-error.js";

export class AccessTokenExpired extends AppError {
  constructor() {
    super(
      "Sua sessão expirou. Renove o acesso para continuar.",
      StatusCodes.UNAUTHORIZED,
      "ACCESS_TOKEN_EXPIRED"
    );
  }
}