"use client";

import type { CSSVariablesResolver, MantineColorsTuple } from "@mantine/core";
import {
	Badge,
	Button,
	createTheme,
	createVarsResolver,
	MantineProvider,
} from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";

// 1. Swatch config for emerald
const emeraldColors: MantineColorsTuple = [
	"#F4F9F4", // 0
	"#E6EFE6", // 1
	"#C2DCC2", // 2
	"#9EC49E", // 3
	"#75A875", // 4
	"#4B8C4B", // 5
	"#2E7D32", // 6 - Primary brand color (darker green)
	"#1B5E20", // 7
	"#0F4D14", // 8
	"#0C3B0F", // 9 - Deep Forest for hover
];

const theme = createTheme({
	primaryColor: "emerald",
	colors: {
		// Register custom swatch
		emerald: emeraldColors,
	},
	other: {
		// Light semantic base colors
		lightBgBase: "#FAFAF9",
		lightSurface: "#FFFFFF",
		lightBorder: "#E5E7E5",
		lightTextPrimary: "#1A1D1B",
		lightTextSecondary: "#6B716E",

		// Dark semantic base colors
		darkBgBase: "#0D0F0E",
		darkSurface: "#161918",
		darkBorder: "#2A2D2C",
		darkTextPrimary: "#F2F4F2",
		darkTextSecondary: "#9CA39F",
	},
	components: {
		Button: Button.extend({
			defaultProps: {
				radius: "md",
			},
			vars: (_theme, props) => {
				if (props.variant === "filled") {
					return {
						root: {
							"--button-bg": "var(--mantine-color-emerald-6)",
							"--button-hover": "var(--mantine-color-emerald-9)",
							"--button-color": "#FFFFFF",
						},
					};
				}
				if (props.variant === "outline") {
					return {
						root: {
							"--button-bd": "1px solid var(--mantine-color-emerald-6)",
							"--button-color": "var(--mantine-color-emerald-6)",
							"--button-bg": "transparent",
							"--button-hover": "rgba(22, 163, 74, 0.05)",
						},
					};
				}
				return { root: {} };
			},
		}),
		Card: {
			defaultProps: {
				radius: "md",
				withBorder: true,
			},
			styles: {
				root: {
					backgroundColor: "var(--doki-surface-color)",
					borderColor: "var(--doki-border-color)",
					color: "var(--doki-text-primary)",
				},
			},
		},
		Badge: Badge.extend({
			defaultProps: {
				radius: "md",
			},
			vars: (_theme, props) => {
				if (props.variant === "light" && props.color === "emerald") {
					return {
						root: {
							"--badge-bg": "var(--mantine-color-emerald-0)",
							"--badge-color": "var(--mantine-color-emerald-6)",
						},
					};
				}
				return { root: {} };
			},
		}),
	},
});

const resolver = createVarsResolver((theme) => ({
	variables: {},
	light: {
		"--doki-bg-base": theme.other.lightBgBase as string,
		"--doki-surface-color": theme.other.lightSurface as string,
		"--doki-border-color": theme.other.lightBorder as string,
		"--doki-text-primary": theme.other.lightTextPrimary as string,
		"--doki-text-secondary": theme.other.lightTextSecondary as string,

		// Override mantine global body & border variables natively
		"--mantine-color-body": theme.other.lightBgBase as string,
		"--mantine-color-text": theme.other.lightTextPrimary as string,
		"--mantine-color-default-border": theme.other.lightBorder as string,
	},
	dark: {
		"--doki-bg-base": theme.other.darkBgBase as string,
		"--doki-surface-color": theme.other.darkSurface as string,
		"--doki-border-color": theme.other.darkBorder as string,
		"--doki-text-primary": theme.other.darkTextPrimary as string,
		"--doki-text-secondary": theme.other.darkTextSecondary as string,

		// Override mantine global body & border variables natively
		"--mantine-color-body": theme.other.darkBgBase as string,
		"--mantine-color-text": theme.other.darkTextPrimary as string,
		"--mantine-color-default-border": theme.other.darkBorder as string,
	},
}));

import { Notifications } from "@mantine/notifications";

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider
				theme={theme}
				cssVariablesResolver={resolver as unknown as CSSVariablesResolver}
				defaultColorScheme="auto"
			>
				<Notifications position="top-right" zIndex={1000} />
				<AuthProvider>
					<NuqsAdapter>{children}</NuqsAdapter>
				</AuthProvider>
			</MantineProvider>
		</QueryClientProvider>
	);
}
