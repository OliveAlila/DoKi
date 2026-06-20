import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "@/env";

const JWT_SECRET = env.JWT_SECRET;

export interface AuthRequest extends Request {
	user?: {
		userId: number;
		role?: string;
	};
}

export const authenticateJWT = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;
	const token = authHeader ? authHeader.split(" ")[1] : req.cookies?.auth_token;

	if (!token) {
		return res.status(401).json({ error: "Unauthorized: No token provided" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: number;
			role?: string;
		};
		req.user = decoded;
		next();
	} catch (_err) {
		return res.status(401).json({ error: "Unauthorized: Invalid token" });
	}
};
