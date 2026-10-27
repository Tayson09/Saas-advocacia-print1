import type { Request, Response, NextFunction } from "express";
import type { RequestHandler } from "express";
import { verifyAccessToken } from "../modules/token/token.service.js";
import { AccessTokenInvalid } from "../helpers/errors/access-token-invalid.errors.js";

export const authenticate: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Entrou no authenticate");
  const authorization = req.headers.authorization;

  if (!authorization) return next(new AccessTokenInvalid());

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) return next(new AccessTokenInvalid());

  try {
    const { userId} = verifyAccessToken(token);

    res.locals.userId = userId;

    return next();
  } catch (error) {
    return next(error);
  }
}
