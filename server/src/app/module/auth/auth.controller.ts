import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { clearAuthCookie, setAuthCookie } from "../../lib/cookies";
import { signToken } from "../../lib/jwt";
import { AppError } from "../../utils/AppError";
import type { LoginInput, SignupInput } from "./auth.interface";
import { AuthService } from "./auth.service";

/**
 * POST /api/v1/auth/signup — public, STUDENT ONLY.
 * Mentors are seeded directly in the database (per the task spec); there is
 * deliberately no way to register a privileged account over the API.
 */
const signup = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.signup(req.validated?.body as SignupInput);

  setAuthCookie(res, signToken({ sub: user.id, role: user.role }));

  sendResponse(res, {
    statusCode: 201,
    message: "Account created successfully.",
    data: { user },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.login(req.validated?.body as LoginInput);

  setAuthCookie(res, signToken({ sub: user.id, role: user.role }));

  sendResponse(res, {
    statusCode: 200,
    message: "Logged in successfully.",
    data: { user },
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  clearAuthCookie(res);

  sendResponse(res, {
    statusCode: 200,
    message: "Logged out successfully.",
    data: null,
  });
});

/** Current user, looked up fresh from the DB (role changes apply instantly). */
const me = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.getSafeUserById(req.user!.id);

  if (!user) {
    clearAuthCookie(res);
    throw new AppError(401, "Account no longer exists.");
  }

  sendResponse(res, {
    statusCode: 200,
    message: "Current user fetched successfully.",
    data: { user },
  });
});

export const AuthController = {
  signup,
  login,
  logout,
  me,
};
