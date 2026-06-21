"use client";

import {
	ActionIcon,
	useComputedColorScheme,
	useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeToggle() {
	const { setColorScheme } = useMantineColorScheme();
	const computedColorScheme = useComputedColorScheme("light", {
		getInitialValueInEffect: true,
	});

	return (
		<ActionIcon
			onClick={() =>
				setColorScheme(computedColorScheme === "light" ? "dark" : "light")
			}
			variant="default"
			size="md"
			aria-label="Toggle color scheme"
		>
			{computedColorScheme === "dark" ? (
				<IconSun size={18} stroke={1.5} />
			) : (
				<IconMoon size={18} stroke={1.5} />
			)}
		</ActionIcon>
	);
}
