import { z } from "zod";

export const env = z.object({
  PORT: z.string(),
  HOST: z.string().optional(),
  DATABASE_URL: z.url(),
  COOKIE_SECRET: z.string(),
  JWT_SECRET: z.string(),
});

export const {
  DATABASE_URL,
  PORT,
  HOST,
  COOKIE_SECRET,
  JWT_SECRET,
} = env.parse(process.env)
