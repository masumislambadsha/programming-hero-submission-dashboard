import type { Role } from "@ph/shared";

/** Where each role lands after login. */
export const ROLE_HOME: Record<Role, string> = {
  STUDENT: "/dashboard",
  MENTOR: "/mentor",
};

export function homeFor(role: Role): string {
  return ROLE_HOME[role] ?? "/";
}
