import type { Role } from "@ph/shared";

export type AuthUser = {
  id: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireAuth` after verifying the JWT. */
      user?: AuthUser;
    }
  }
}

export {};
