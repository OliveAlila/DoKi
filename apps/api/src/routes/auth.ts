import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";
import prisma from "@/db";
import { env } from "@/env";
import { hashPassword, verifyPassword } from "@/utils/hash";

const router = Router();

const JWT_SECRET = env.JWT_SECRET;

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window`
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many requests, please try again later." },
});

router.post("/sign-up", authLimiter, async (req, res) => {
	const { email, password, name, role } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		// Only allow BUYER or SELLER to be set during sign up; default to SELLER
		let signupRole: "SELLER" | "BUYER" = "SELLER";
		if (role === "BUYER") {
			signupRole = "BUYER";
		}

		// Hash the password
		const hashedPassword = hashPassword(password);
		const user = await prisma.user.create({
			data: { email, password: hashedPassword, name, role: signupRole },
		});

		const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
			expiresIn: "1d",
		});

		res.cookie("auth_token", token, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 24 * 60 * 60 * 1000,
			sameSite: "lax",
		});

		res.status(201).json({
			message: "User created successfully",
			token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Sign-up error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/sign-in", authLimiter, async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !verifyPassword(password, user.password)) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
			expiresIn: "1d",
		});

		res.cookie("auth_token", token, {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			maxAge: 24 * 60 * 60 * 1000,
			sameSite: "lax",
		});

		res.json({
			message: "Signed in successfully",
			token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Sign-in error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/sign-out", (_req, res) => {
	res.clearCookie("auth_token");
	res.json({ message: "Signed out successfully" });
});

router.get("/me", async (req, res) => {
	const authHeader = req.headers.authorization;
	const token = authHeader ? authHeader.split(" ")[1] : req.cookies?.auth_token;

	if (!token) {
		return res
			.status(401)
			.json({ error: "Unauthorized: Missing token reference" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: number;
			role?: string;
		};
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
		});
		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}
		res.json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Verify /me error:", error);
		res.status(401).json({ error: "Invalid token" });
	}
});

export default router;
