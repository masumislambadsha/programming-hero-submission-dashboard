import app from "./app";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";

const server = app.listen(config.app.port, () => {
  console.log(`\n  🚀 API server running on http://localhost:${config.app.port}${config.app.apiPrefix}`);
  console.log(`   environment: ${config.app.env}\n`);
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

export default app;
