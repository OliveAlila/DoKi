import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "@/env.ts";
import authRoutes from "@/routes/auth.ts";
import listingsRoutes from "@/routes/listings.ts";

const app = express();
const port = env.PORT;

app.use(
	cors({
		origin: (origin, callback) => {
			if (env.NODE_ENV !== "production") {
				if (
					!origin ||
					/^http:\/\/localhost:\d+$/.test(origin) ||
					/^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
					/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) ||
					/^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin)
				) {
					return callback(null, true);
				}
			}

			// Production strict origins
			const allowedOrigins = env.ALLOWED_ORIGINS
				? env.ALLOWED_ORIGINS.split(",")
				: ["https://doki.com"];
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	}),
);

app.use(express.json({ limit: "10mb" })); // Support base64 image uploads
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/v1", listingsRoutes);

app.get("/api/health", (_req, res) => {
	res.json({ status: "ok" });
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
