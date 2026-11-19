import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { AuthController } from "./auth.controller.js";
import { loginSchema, refreshBodySchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schema.js";
import { loginRateLimiter, passwordResetRateLimiter } from "../../middlewares/rate-limits.js";

const router = Router();

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  AuthController.login
);

router.post(
  "/refresh",
  validate(refreshBodySchema),
  AuthController.refresh
)

router.post(
  "/forgot-password",
  passwordResetRateLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
)

router.post(
  "/reset-password",
  passwordResetRateLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword
)

export default router;
