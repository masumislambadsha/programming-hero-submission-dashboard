import bcrypt from "bcryptjs";
import type { Role } from "@ph/shared";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { LoginInput, SafeUser, SignupInput } from "./auth.interface";

function toSafeUser(user: { id: string; name: string; email: string; role: Role }): SafeUser {
  // passwordHash never leaves this layer.
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function signup(input: SignupInput): Promise<SafeUser> {
  const email = input.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Same response whether the email belongs to a student or a seeded
    // mentor — no account enumeration.
    throw new AppError(409, "An account with this email already exists. Try logging in instead.", {
      email: ["This email is already registered"],
    });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      role: "STUDENT", // never taken from the request body.
    },
  });

  return toSafeUser(user);
}

export async function login(input: LoginInput): Promise<SafeUser> {
  const email = input.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email } });

  // Constant-ish response for unknown email vs wrong password.
  const valid = user
    ? await bcrypt.compare(input.password, user.passwordHash)
    : await bcrypt.compare(input.password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv");

  if (!user || !valid) {
    throw new AppError(401, "Invalid email or password.");
  }

  return toSafeUser(user);
}

export async function getSafeUserById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  return user ? toSafeUser(user) : null;
}

export const AuthService = {
  signup,
  login,
  getSafeUserById,
};
