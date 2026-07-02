import { z } from "zod";

export const env = z.object({
  PORT: z.string(),
  HOST: z.string().optional(),
  DATABASE_URL: z.url(),
  COOKIE_SECRET: z.string(),
  JWT_SECRET: z.string(),
  WEB_APP_URL: z.string().default("http://localhost:5173"),
});

export const {
  DATABASE_URL,
  PORT,
  HOST,
  COOKIE_SECRET,
  JWT_SECRET,
  WEB_APP_URL,
} = env.parse(process.env)
