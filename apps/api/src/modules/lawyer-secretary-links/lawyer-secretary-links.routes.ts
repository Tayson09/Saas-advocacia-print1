import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { validate } from "../../middlewares/validate.js";
import { linkSchema } from "./lawyer-secretary-links.schema.js";
import { linkController } from "./lawyer-secretary-links.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  requireAdmin,
  validate({ body: linkSchema.body }),
  linkController.create,
);

router.get("/all", authenticate, linkController.list);

export default router;