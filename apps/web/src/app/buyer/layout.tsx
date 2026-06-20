"use client";

import {
	Button,
	Card,
	Container,
	Loader,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import BuyerAppShell from "@/components/layout/BuyerAppShell";
import { useAuth } from "@/context/AuthContext";

const BuyerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.push("/sign-in");
		}
	}, [user, loading, router]);

	if (loading || !user) {
		return (
			<Container
				fluid
				style={{
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Stack align="center" gap="md">
					<Loader color="teal" size="lg" type="dots" />
					<Text c="dimmed" size="sm">
						Authenticating Buyer Profile...
					</Text>
				</Stack>
			</Container>
		);
	}

	// Access Denied guard if user is loaded but not a BUYER
	if (user.role !== "BUYER") {
		return (
			<Container
				fluid
				style={{
					height: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Card
					p="xl"
					style={{
						borderColor: "var(--mantine-color-red-6)",
						maxWidth: "500px",
						textAlign: "center",
					}}
				>
					<Stack align="center" gap="md">
						<ThemeIcon color="red" size="xl" radius="xl">
							<IconLock size={30} />
						</ThemeIcon>
						<Title
							order={2}
							style={{ color: "var(--mantine-color-red-6)", fontWeight: 800 }}
						>
							Access Restricted
						</Title>
						<Text c="dimmed" size="sm">
							Buyer Profile Credentials Required. Your account role is{" "}
							<strong>{user.role}</strong>.
						</Text>
						<Button
							variant="filled"
							color="teal"
							onClick={() => router.push("/")}
						>
							Return to Homepage
						</Button>
					</Stack>
				</Card>
			</Container>
		);
	}

	return <BuyerAppShell>{children}</BuyerAppShell>;
};

export default BuyerLayout;
