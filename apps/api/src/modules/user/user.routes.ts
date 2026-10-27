import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { createUserSchema } from "./user.schema.js";
import { UserController } from "./user.controllers.js";

const router = Router();

router.post(
  "/register",
  authenticate,
  requireAdmin,
  validate({ body: createUserSchema}),
  UserController.create
);

export default router;