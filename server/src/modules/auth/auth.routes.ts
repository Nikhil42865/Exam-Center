import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { registerSchema, loginSchema, updateProfileSchema } from "@examcenter/contracts";

const router = Router();

router.post("/register", validateBody(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post("/login", validateBody(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post("/refresh", (req, res, next) => authController.refresh(req, res, next));
router.post("/logout", requireAuth, (req, res) => authController.logout(req, res));

export const authRoutes = router;

// User profile routes
const userRoutes = Router();
userRoutes.get("/me", requireAuth, (req, res) => authController.getMe(req, res));
userRoutes.patch("/me", requireAuth, validateBody(updateProfileSchema), (req, res, next) => authController.updateMe(req, res, next));

export const userRoutesConfig = userRoutes;
