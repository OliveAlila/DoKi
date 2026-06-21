"use client";

import {
	Avatar,
	Group,
	Menu,
	MenuDivider,
	MenuDropdown,
	MenuItem,
	MenuLabel,
	MenuTarget,
	Text,
	UnstyledButton,
} from "@mantine/core";
import {
	IconChevronDown,
	IconLogout,
	IconSettings,
	IconUser,
} from "@tabler/icons-react";
import Link from "next/link";

export function UserMenu() {
	// Mock user data for now
	const userName = "Admin User";

	return (
		<Menu shadow="md" width={200} position="bottom-end">
			<MenuTarget>
				<UnstyledButton>
					<Group gap={8} align="center">
						<Avatar
							src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
							alt={userName}
							radius="xl"
							size={36}
						/>
						<Group gap={4} visibleFrom="xs" align="center">
							<Text size="sm" fw={600} style={{ color: "var(--mantine-color-text)" }}>
								{userName}
							</Text>
							<IconChevronDown size={14} style={{ color: "var(--mantine-color-text)" }} />
						</Group>
					</Group>
				</UnstyledButton>
			</MenuTarget>

			<MenuDropdown>
				<MenuLabel>Account</MenuLabel>
				<MenuItem
					component={Link}
					href="/dashboard/profile"
					leftSection={<IconUser size={14} />}
				>
					Profile
				</MenuItem>
				<MenuItem
					component={Link}
					href="/dashboard/settings"
					leftSection={<IconSettings size={14} />}
				>
					Settings
				</MenuItem>
				<MenuDivider />
				<MenuItem
					color="red"
					leftSection={<IconLogout size={14} />}
					onClick={() => console.log("Sign out clicked")}
				>
					Sign Out
				</MenuItem>
			</MenuDropdown>
		</Menu>
	);
}
