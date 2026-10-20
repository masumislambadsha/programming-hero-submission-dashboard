import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * In dev, `tsx watch` restarts the process on file changes. Without the
 * globalThis cache every restart would open a new connection pool and
 * eventually exhaust Postgres connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
