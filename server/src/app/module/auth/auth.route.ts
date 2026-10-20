import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { authLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { AuthController } from "./auth.controller";
import { loginValidation, signupValidation } from "./auth.validation";

const router = Router();

router.post("/signup", authLimiter, validate(signupValidation), AuthController.signup);

router.post("/login", authLimiter, validate(loginValidation), AuthController.login);

router.post("/logout", AuthController.logout);

router.get("/me", checkAuth, AuthController.me);

export const authRoutes = router;
