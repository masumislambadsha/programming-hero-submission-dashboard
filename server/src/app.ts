import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { globalLimiter } from "./app/middleware/rateLimiter";
import { authRoutes } from "./app/module/auth/auth.route";
import { submissionRoutes } from "./app/module/submission/submission.route";

const app = express();

// Trust the reverse proxy (Render/Railway/Nginx) so req.ip reflects the real
// client for rate limiting.
app.set("trust proxy", 1);

app.use(helmet());
// In dev the Next.js rewrite proxies everything same-origin, but explicit
// credentialed CORS keeps direct API access (e.g. curl, mobile) working.
app.use(
  cors({
    origin: config.app.clientOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(globalLimiter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Programming Hero Submission API is running",
    data: { version: "1.0.0", api: config.app.apiPrefix },
  });
});

app.get(`${config.app.apiPrefix}/health`, (_req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    data: { uptime: process.uptime(), timestamp: new Date().toISOString() },
  });
});

app.use(`${config.app.apiPrefix}/auth`, authRoutes);
app.use(`${config.app.apiPrefix}/submissions`, submissionRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
