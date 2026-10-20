import { Router } from "express";
import { loginSchema, signupSchema } from "@ph/shared";
import { validateBody } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import { setAuthCookie, clearAuthCookie } from "../lib/cookie";
import { signToken } from "../lib/jwt";
import * as authService from "../services/auth.service";

export const authRouter = Router();

/**
 * POST /api/auth/signup — public, STUDENT ONLY.
 * Mentors are seeded directly in the database (per the task spec); there is
 * deliberately no way to register a privileged account over the API.
 */
authRouter.post("/signup", validateBody(signupSchema), async (req, res) => {
  const user = await authService.signup(req.body);
  setAuthCookie(res, signToken({ sub: user.id, role: user.role }));
  res.status(201).json({ success: true, data: { user } });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const user = await authService.login(req.body);
  setAuthCookie(res, signToken({ sub: user.id, role: user.role }));
  res.json({ success: true, data: { user } });
});

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, data: null });
});

/** Current user, looked up fresh from the DB (role changes apply instantly). */
authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await authService.getSafeUserById(req.user!.id);
  if (!user) {
    clearAuthCookie(res);
    return res.status(401).json({ success: false, message: "Account no longer exists." });
  }
  res.json({ success: true, data: { user } });
});
