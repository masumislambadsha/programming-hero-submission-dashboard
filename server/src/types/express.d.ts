import type { Role } from "@ph/shared";

export type AuthUser = {
  id: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      /** Set by `checkAuth` after verifying the JWT. */
      user?: AuthUser;
      /** Set by `validate` — parsed/coerced body, query and params. */
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
