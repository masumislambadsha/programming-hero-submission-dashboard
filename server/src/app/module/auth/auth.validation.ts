import { z } from "zod";
import { loginSchema, signupSchema } from "@ph/shared";

/**
 * Request wrappers for the validate middleware. The field rules themselves
 * come from @ph/shared so the client and server share one source of truth.
 */
export const signupValidation = z.object({ body: signupSchema });
export const loginValidation = z.object({ body: loginSchema });
