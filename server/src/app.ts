import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./env";
import { authRouter } from "./routes/auth.routes";
import { submissionRouter } from "./routes/submission.routes";
import { globalLimiter } from "./middleware/rate-limit";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  // Behind a reverse proxy in production (Render/Railway/Nginx) so
  // req.ip reflects the real client for rate limiting.
  app.set("trust proxy", 1);

  app.use(helmet());
  // In dev the Next.js rewrite proxies everything same-origin, but explicit
  // credentialed CORS keeps direct API access (e.g. curl, mobile) working.
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(globalLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/submissions", submissionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
