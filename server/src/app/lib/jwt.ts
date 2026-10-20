import jwt from "jsonwebtoken";
import type { Role } from "@ph/shared";
import config from "../config";

export type TokenPayload = {
  /** "subject" — the user id */
  sub: string;
  role: Role;
};

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
    issuer: config.jwt.issuer,
  });
}

/**
 * Verifies signature + expiry. Throws jsonwebtoken's errors — callers decide
 * how to translate "invalid" vs "expired" into HTTP responses.
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.jwt.secret, {
    issuer: config.jwt.issuer,
  });

  if (typeof decoded === "string" || !decoded.sub || !decoded.role) {
    throw new Error("Malformed token payload");
  }

  return { sub: decoded.sub, role: decoded.role as Role };
}
