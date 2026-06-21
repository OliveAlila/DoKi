"use client";

import {
	Box,
	Button,
	Card,
	Container,
	Divider,
	Group,
	Stack,
	Switch,
	Text,
	Title,
} from "@mantine/core";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {

	return (
		<Box py={30}>
			<Container size="md">
				<Stack gap={4} mb="xl">
					<Title order={2} fw={800} c="dark">
						Account Settings
					</Title>
					<Text c="dimmed" fz="sm">
						Manage your preferences, notifications, and security
					</Text>
				</Stack>

				<Stack gap="lg">
					<Card shadow="sm" p="xl" withBorder radius="md">
						<Title order={4} fw={700} mb="md">
							Appearance
						</Title>
						<Divider mb="lg" />
						<Group justify="space-between" align="center">
							<Stack gap={0}>
								<Text fw={500}>Theme Preference</Text>
								<Text size="sm" c="dimmed">
									Toggle between Light and Dark mode for the dashboard interface.
								</Text>
							</Stack>
							<ThemeToggle />
						</Group>
					</Card>

					<Card shadow="sm" p="xl" withBorder radius="md">
						<Title order={4} fw={700} mb="md">
							Notifications
						</Title>
						<Divider mb="lg" />
						<Stack gap="lg">
							<Group justify="space-between" align="center">
								<Stack gap={0}>
									<Text fw={500}>Email Notifications</Text>
									<Text size="sm" c="dimmed">
										Receive daily summaries of new organic waste listings.
									</Text>
								</Stack>
								<Switch defaultChecked size="md" color="emerald" />
							</Group>
							<Group justify="space-between" align="center">
								<Stack gap={0}>
									<Text fw={500}>Transaction Alerts</Text>
									<Text size="sm" c="dimmed">
										Get notified immediately when a transaction is completed or updated.
									</Text>
								</Stack>
								<Switch defaultChecked size="md" color="emerald" />
							</Group>
							<Group justify="space-between" align="center">
								<Stack gap={0}>
									<Text fw={500}>Marketing Updates</Text>
									<Text size="sm" c="dimmed">
										Occasional emails about new features, updates, and ecosystem news.
									</Text>
								</Stack>
								<Switch size="md" color="emerald" />
							</Group>
						</Stack>
					</Card>

					<Card shadow="sm" p="xl" withBorder radius="md">
						<Title order={4} fw={700} mb="md">
							Security & Privacy
						</Title>
						<Divider mb="lg" />
						<Stack gap="lg">
							<Group justify="space-between" align="center">
								<Stack gap={0}>
									<Text fw={500}>Two-Factor Authentication (2FA)</Text>
									<Text size="sm" c="dimmed">
										Add an extra layer of security to your account.
									</Text>
								</Stack>
								<Button variant="light" color="emerald">
									Enable 2FA
								</Button>
							</Group>
							<Group justify="space-between" align="center">
								<Stack gap={0}>
									<Text fw={500}>Password Reset</Text>
									<Text size="sm" c="dimmed">
										Change your account password securely.
									</Text>
								</Stack>
								<Button variant="outline" color="gray">
									Change Password
								</Button>
							</Group>
						</Stack>
					</Card>
				</Stack>
			</Container>
		</Box>
	);
}
