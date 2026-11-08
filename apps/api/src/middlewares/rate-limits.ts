// src/middlewares/rate-limit.ts
import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../helpers/errors/app-error.js";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 5,                 
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8", 
  legacyHeaders: false,     
  handler: (_req, _res, next) => {
    next(
      new AppError(
        "Muitas tentativas. Tente novamente em alguns minutos.",
        StatusCodes.TOO_MANY_REQUESTS,
        "TOO_MANY_REQUESTS"
      )
    );
  },
});