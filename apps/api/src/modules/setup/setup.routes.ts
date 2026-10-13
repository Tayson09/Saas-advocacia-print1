import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { setupController } from "./setup.controller.js";
import { registerAdminSchema } from "./setup.schema.js";
import { ensureRegistrationOpen } from "../../middlewares/ensure-registration-open.js";

const router = Router();

router.get("/status", setupController.status);

router.post(
  "/admin",
  ensureRegistrationOpen,        
  validate(registerAdminSchema), 
  setupController.registerAdmin  
);

export default router;