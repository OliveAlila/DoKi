"use client";

import {
	Alert,
	Badge,
	Box,
	Button,
	Card,
	Container,
	Grid,
	Group,
	Loader,
	Progress,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	IconAlertTriangle,
	IconArrowLeft,
	IconLeaf,
	IconTruckDelivery,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/network";

type ListingDetail = {
	id: number;
	quantity: number;
	moisture: number;
	purity: number;
	status: string;
	category: { name: string; doc: number };
	seller: { name: string; address: string; contactPhone: string };
};

export default function ListingDetailsPage() {
	const { id } = useParams();
	const router = useRouter();

	const {
		data: listing,
		isLoading,
		error,
	} = useQuery<ListingDetail>({
		queryKey: ["listing", id],
		queryFn: async () => {
			const res = await fetch(`${getApiUrl()}/api/v1/listings/${id}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to fetch listing");
			return res.json();
		},
	});

	const mutation = useMutation({
		mutationFn: async () => {
			const res = await fetch(`${getApiUrl()}/api/v1/transactions/interest`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ listingId: id }),
				credentials: "include",
			});
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to express interest");
			}
			return res.json();
		},
		onSuccess: () => {
			notifications.show({
				title: "Transaction Locked",
				message: "Sourcing interest locked. The generator has been notified.",
				color: "emerald",
			});
		},
	});

	if (isLoading) {
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
					<Loader color="emerald" size="lg" type="dots" />
					<Text c="dimmed" size="sm">
						Retrieving Feedstock Material Parameters...
					</Text>
				</Stack>
			</Container>
		);
	}

	if (error || !listing) {
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
				<Text color="red">
					Failed to load listing. It may have been removed or acquired.
				</Text>
			</Container>
		);
	}

	const isWarning = listing.purity < 75;

	return (
		<Box py={30}>
			<Container size="md">
				<Button
					variant="subtle"
					color="gray"
					leftSection={<IconArrowLeft size={16} />}
					onClick={() => router.push("/buyer")}
					mb="xl"
				>
					Back to Marketplace
				</Button>

				<Group justify="space-between" mb={30}>
					<Stack gap={4}>
						<Title order={1} style={{ fontSize: "28px", fontWeight: 800 }}>
							Asset Stream:{" "}
							<Text
								span
								inherit
								style={{ color: "var(--mantine-color-emerald-6)" }}
							>
								LST-{listing.id.toString().padStart(5, "0")}
							</Text>
						</Title>
						<Text size="sm" c="dimmed">
							Classification Report
						</Text>
					</Stack>
					<Badge
						color={listing.status === "PENDING" ? "blue" : "emerald"}
						size="lg"
						variant="light"
					>
						{listing.status}
					</Badge>
				</Group>

				{isWarning && (
					<Alert
						icon={<IconAlertTriangle size={16} />}
						title="Composition Purity Index (CPI) Alert"
						color="red"
						variant="light"
						mb="xl"
					>
						Verified Composition Purity Index (CPI) is below 75%. Inspect
						carefully upon delivery.
					</Alert>
				)}

				<Grid gap="lg">
					<Grid.Col span={{ base: 12, md: 7 }}>
						<Card p="xl" style={{ height: "100%" }}>
							<Title order={3} size="h4" mb="md">
								Feedstock Parameters
							</Title>

							<Group gap="xs" mb="xl">
								<ThemeIcon
									color="emerald"
									size="lg"
									radius="xl"
									variant="light"
								>
									<IconLeaf size={20} />
								</ThemeIcon>
								<Box>
									<Text
										size="xs"
										c="dimmed"
										fw={700}
										style={{ textTransform: "uppercase" }}
									>
										Category
									</Text>
									<Text size="lg" fw={600}>
										{listing.category.name}
									</Text>
								</Box>
							</Group>

							<Stack gap="xl">
								<Box>
									<Group justify="space-between" mb={8}>
										<Text size="sm" c="dimmed">
											Total Verified Weight
										</Text>
										<Text size="lg" fw={800} color="emerald">
											{listing.quantity}{" "}
											<Text span size="sm">
												Kg
											</Text>
										</Text>
									</Group>
								</Box>

								<Box>
									<Group justify="space-between" mb={8}>
										<Text size="sm" c="dimmed">
											Verified Composition Purity Index (CPI)
										</Text>
										<Text
											size="md"
											fw={700}
											color={isWarning ? "red" : "emerald"}
										>
											{listing.purity}%
										</Text>
									</Group>
									<Progress
										value={listing.purity}
										color={isWarning ? "red" : "emerald"}
										size="md"
									/>
								</Box>

								<Box>
									<Group justify="space-between" mb={8}>
										<Text size="sm" c="dimmed">
											Relative Moisture Coefficient (RMC)
										</Text>
										<Text size="md" fw={700} color="blue">
											{listing.moisture}%
										</Text>
									</Group>
									<Progress value={listing.moisture} color="blue" size="md" />
								</Box>
							</Stack>
						</Card>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 5 }}>
						<Stack gap="lg" h="100%">
							<Card p="xl">
								<Title order={3} size="h4" mb="md">
									Organic Waste Generator Profile
								</Title>
								<Text
									size="xs"
									c="dimmed"
									fw={700}
									style={{ textTransform: "uppercase" }}
									mb={4}
								>
									Facility Name
								</Text>
								<Text size="sm" fw={600} mb="md">
									{listing.seller.name}
								</Text>

								<Text
									size="xs"
									c="dimmed"
									fw={700}
									style={{ textTransform: "uppercase" }}
									mb={4}
								>
									Location Address
								</Text>
								<Text size="sm" mb="md">
									{listing.seller.address}
								</Text>

								<Text
									size="xs"
									c="dimmed"
									fw={700}
									style={{ textTransform: "uppercase" }}
									mb={4}
								>
									Contact Terminal
								</Text>
								<Text size="sm">
									{listing.seller.contactPhone || "Not Provided"}
								</Text>
							</Card>

							<Card
								p="xl"
								style={{
									flexGrow: 1,
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
								}}
							>
								<Title order={3} size="h5" mb="sm" ta="center">
									Express Sourcing Interest
								</Title>
								<Text size="xs" c="dimmed" ta="center" mb="xl">
									Executing this action locks this feedstock stream into your
									procurement pipeline and notifies the generator.
								</Text>

								<Button
									fullWidth
									size="lg"
									color="emerald"
									leftSection={<IconTruckDelivery size={20} />}
									loading={mutation.isPending}
									onClick={() => mutation.mutate()}
									disabled={listing.status !== "PENDING"}
								>
									Secure Feedstock
								</Button>
							</Card>
						</Stack>
					</Grid.Col>
				</Grid>
			</Container>
		</Box>
	);
}
