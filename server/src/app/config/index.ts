import "dotenv/config";
import { z } from "zod";

/**
 * Environment variables are validated once at boot. A missing DATABASE_URL
 * should crash immediately with a readable message — not surface as a cryptic
 * error on the first request.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.url("DATABASE_URL must be a valid postgres:// URL"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("12h"),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`   ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;

const config = {
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
    clientOrigin: env.CLIENT_ORIGIN,
    apiPrefix: "/api/v1",
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: "ph-submissions",
  },
  cookie: {
    name: "ph_token",
    maxAgeMs: 12 * 60 * 60 * 1000, // 12h — matches the JWT expiry
    secure: env.COOKIE_SECURE,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    globalMax: 300,
    submissionMax: 5,
  },
} as const;

export default config;
