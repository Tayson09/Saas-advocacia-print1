import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { AuthController } from "./auth.controller.js";
import { loginSchema, refreshBodySchema } from "./auth.schema.js";
import { loginRateLimiter } from "../../middlewares/rate-limits.js";

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

export default router;