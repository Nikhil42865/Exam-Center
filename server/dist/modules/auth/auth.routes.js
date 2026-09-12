"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutesConfig = exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_js_1 = require("./auth.controller.js");
const validate_js_1 = require("../../middleware/validate.js");
const auth_js_1 = require("../../middleware/auth.js");
const contracts_1 = require("@examcenter/contracts");
const router = (0, express_1.Router)();
router.post("/register", (0, validate_js_1.validateBody)(contracts_1.registerSchema), (req, res, next) => auth_controller_js_1.authController.register(req, res, next));
router.post("/login", (0, validate_js_1.validateBody)(contracts_1.loginSchema), (req, res, next) => auth_controller_js_1.authController.login(req, res, next));
router.post("/refresh", (req, res, next) => auth_controller_js_1.authController.refresh(req, res, next));
router.post("/logout", auth_js_1.requireAuth, (req, res) => auth_controller_js_1.authController.logout(req, res));
exports.authRoutes = router;
// User profile routes
const userRoutes = (0, express_1.Router)();
userRoutes.get("/me", auth_js_1.requireAuth, (req, res) => auth_controller_js_1.authController.getMe(req, res));
userRoutes.patch("/me", auth_js_1.requireAuth, (0, validate_js_1.validateBody)(contracts_1.updateProfileSchema), (req, res, next) => auth_controller_js_1.authController.updateMe(req, res, next));
exports.userRoutesConfig = userRoutes;
