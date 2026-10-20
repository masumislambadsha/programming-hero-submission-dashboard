import jwt from "jsonwebtoken";
import { env } from "../env";

export type TokenPayload = {
  /** "subject" — the user id */
  sub: string;
  role: "STUDENT" | "MENTOR";
};

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    issuer: "ph-submissions",
  });
}

/**
 * Verifies signature + expiry. Throws jsonwebtoken's errors — callers decide
 * how to translate "invalid" vs "expired" into HTTP responses.
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: "ph-submissions",
  });

  if (typeof decoded === "string" || !decoded.sub || !decoded.role) {
    throw new Error("Malformed token payload");
  }

  return { sub: decoded.sub, role: decoded.role as TokenPayload["role"] };
}
