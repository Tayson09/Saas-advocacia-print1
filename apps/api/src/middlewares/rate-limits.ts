// src/middlewares/rate-limit.ts
import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../helpers/errors/app-error.js";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // janela de 15 minutos
  limit: 5,                 // 5 tentativas por IP nessa janela
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8", // envia headers RateLimit-* padrão
  legacyHeaders: false,       // desliga os antigos X-RateLimit-*
  handler: (_req, _res, next) => {
    // repassa ao errorHandler para manter o formato padrão de erro
    next(
      new AppError(
        "Muitas tentativas. Tente novamente em alguns minutos.",
        StatusCodes.TOO_MANY_REQUESTS,
        "TOO_MANY_REQUESTS"
      )
    );
  },
});