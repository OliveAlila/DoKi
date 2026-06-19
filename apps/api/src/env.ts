import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(), // Prisma handles its own DB URL internally, but we can validate it if provided
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.string().default("development"),
  ALLOWED_ORIGINS: z.string().optional(),
  JWT_SECRET: z.string({ message: "FATAL: JWT_SECRET environment variable is missing." }),
  GEMINI_API_KEY: z.string({ message: "FATAL: GEMINI_API_KEY environment variable is missing." }),
});

export const env = envSchema.parse(process.env);
