import { createApp } from "./app";
import { env } from "./env";
import { prisma } from "./lib/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`\n  🚀 API server running on http://localhost:${env.PORT}/api`);
  console.log(`   environment: ${env.NODE_ENV}\n`);
});

// Graceful shutdown — close Prisma's pool before exiting so Postgres is not
// left with dangling connections after a restart.
async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
