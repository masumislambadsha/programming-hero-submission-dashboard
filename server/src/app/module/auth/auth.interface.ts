import type { LoginInput, Role, SafeUser, SignupInput } from "@ph/shared";

export type { LoginInput, SafeUser, SignupInput };

export type AuthTokenPayload = {
  /** User id */
  sub: string;
  role: Role;
};
