"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { getApiUrl } from "@/utils/network";

type User = {
	id: number;
	email: string;
	name?: string;
	role: string;
	latitude?: number;
	longitude?: number;
	companyName?: string;
	contactPhone?: string;
	address?: string;
};

type AuthContextType = {
	user: User | null;
	loading: boolean;
	signIn: (user: User) => void;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const queryClient = useQueryClient();

	const { data: user, isLoading } = useQuery<User | null>({
		queryKey: ["user"],
		queryFn: async () => {
			const res = await fetch(`${getApiUrl()}/api/auth/me`, {
				credentials: "include",
			});
			if (!res.ok) return null;
			const data = await res.json();
			return data.user;
		},
		retry: false,
	});

	const signIn = (user: User) => {
		queryClient.setQueryData(["user"], user);
	};

	const signOut = async () => {
		await fetch(`${getApiUrl()}/api/auth/sign-out`, {
			method: "POST",
			credentials: "include",
		});
		queryClient.setQueryData(["user"], null);
	};

	return (
		<AuthContext.Provider
			value={{ user: user || null, loading: isLoading, signIn, signOut }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
