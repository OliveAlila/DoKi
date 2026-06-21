"use client";

import {
	Avatar,
	Box,
	Button,
	Card,
	Container,
	Divider,
	Group,
	Notification,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/utils/network";

interface ProfileFormValues {
	name: string;
	companyName: string;
	contactPhone: string;
	address: string;
}

export default function ProfilePage() {
	const { user, signIn } = useAuth();
	const [loading, setLoading] = useState(false);
	const [successMsg, setSuccessMsg] = useState("");
	const [errorMsg, setErrorMsg] = useState("");

	const form = useForm<ProfileFormValues>({
		initialValues: {
			name: user?.name || "",
			companyName: user?.companyName || "",
			contactPhone: user?.contactPhone || "",
			address: user?.address || "",
		},
	});

	useEffect(() => {
		if (user) {
			form.setValues({
				name: user.name || "",
				companyName: user.companyName || "",
				contactPhone: user.contactPhone || "",
				address: user.address || "",
			});
		}
	}, [user, form]);

	const handleSubmit = async (values: ProfileFormValues) => {
		setLoading(true);
		setSuccessMsg("");
		setErrorMsg("");

		try {
			const res = await fetch(`${getApiUrl()}/api/auth/me`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
				credentials: "include",
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to update profile");
			}

			const data = await res.json();
			signIn(data.user); // Update context
			setSuccessMsg("Profile updated successfully!");
			setTimeout(() => setSuccessMsg(""), 3000);
		} catch (error) {
			const err = error as Error;
			setErrorMsg(err.message || "An error occurred");
			setTimeout(() => setErrorMsg(""), 3000);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box py={30}>
			<Container size="md">
				<Stack gap={4} mb="xl">
					<Title order={2} fw={800} c="dark">
						Your Profile
					</Title>
					<Text c="dimmed" fz="sm">
						Manage your account details and personal information
					</Text>
				</Stack>

				<Card shadow="sm" p="xl" withBorder radius="md">
					<form onSubmit={form.onSubmit(handleSubmit)}>
						<Stack gap="xl">
							{successMsg && (
								<Notification color="teal" onClose={() => setSuccessMsg("")}>
									{successMsg}
								</Notification>
							)}
							{errorMsg && (
								<Notification color="red" onClose={() => setErrorMsg("")}>
									{errorMsg}
								</Notification>
							)}

							<Box>
								<Title order={4} fw={700} mb="md">
									Profile Information
								</Title>
								<Divider />
							</Box>

							<Group align="center" gap="lg">
								<Avatar size={80} radius={80} color="emerald">
									{user?.name?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
								</Avatar>
								<Stack gap={4}>
									<Text fz="sm" c="gray.6">
										Profile Photo
									</Text>
									<Group gap="sm" mt={4}>
										<Button variant="light" size="xs" radius="sm" color="emerald">
											Upload Photo
										</Button>
										<Button variant="outline" color="gray" size="xs" radius="sm">
											Remove
										</Button>
									</Group>
								</Stack>
							</Group>

							<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
								<TextInput
									label="Full Name"
									placeholder="Enter your full name"
									radius="md"
									size="md"
									{...form.getInputProps("name")}
								/>
								<TextInput
									label="Email Address"
									placeholder="Email"
									radius="md"
									size="md"
									value={user?.email || ""}
									disabled
								/>
								<TextInput
									label="Company Name"
									placeholder="Company Name"
									radius="md"
									size="md"
									{...form.getInputProps("companyName")}
								/>
								<TextInput
									label="Contact Phone"
									placeholder="Phone Number"
									radius="md"
									size="md"
									{...form.getInputProps("contactPhone")}
								/>
								<TextInput
									label="Physical Address"
									placeholder="Your business address"
									radius="md"
									size="md"
									style={{ gridColumn: "1 / -1" }}
									{...form.getInputProps("address")}
								/>
								<TextInput
									label="Account Role"
									placeholder="Role"
									radius="md"
									size="md"
									value={user?.role || ""}
									disabled
								/>
							</SimpleGrid>

							<Group mt="xl" gap="md" justify="flex-end">
								<Button
									variant="outline"
									color="gray"
									radius="md"
									px="xl"
									size="md"
									onClick={() => form.reset()}
									disabled={loading}
								>
									Discard
								</Button>
								<Button
									type="submit"
									radius="md"
									px="xl"
									size="md"
									color="emerald"
									loading={loading}
								>
									Save Changes
								</Button>
							</Group>
						</Stack>
					</form>
				</Card>
			</Container>
		</Box>
	);
}
