import { z } from "zod";

const envSchema = z
	.object({
		DATABASE_URL: z.string().optional(), // Prisma handles its own DB URL internally, but we can validate it if provided
		PORT: z.coerce.number().default(3001),
		NODE_ENV: z.string().default("development"),
		ALLOWED_ORIGINS: z.string().optional(),
		JWT_SECRET: z.string({
			message: "FATAL: JWT_SECRET environment variable is missing.",
		}),
		SIMULATE_AI: z
			.preprocess((val) => val === "true" || val === true, z.boolean())
			.default(false),
		GEMINI_API_KEY: z.string().optional(),
	})
	.refine((data) => data.SIMULATE_AI || !!data.GEMINI_API_KEY, {
		message:
			"FATAL: GEMINI_API_KEY environment variable is missing, and SIMULATE_AI is false.",
		path: ["GEMINI_API_KEY"],
	});

export const env = envSchema.parse(process.env);
