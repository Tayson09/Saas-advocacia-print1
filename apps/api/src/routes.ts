import { Router } from "express";
import setupRoutes from "./modules/setup/setup.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";

const router = Router();

router.use("/setup", setupRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;