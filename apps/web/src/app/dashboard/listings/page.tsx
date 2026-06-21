"use client";
"use no memo";

import React from "react";
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Container,
	Divider,
	Group,
	Loader,
	Progress,
	Stack,
	Table,
	TableTbody,
	TableTd,
	TableTh,
	TableThead,
	TableTr,
	Text,
	TextInput,
	Title,
	SimpleGrid,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconSettings,
	IconShieldCheck,
	IconTrash,
	IconSearch,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/network";

type ListingWithCategory = {
	id: number;
	quantity: number;
	moisture: number;
	purity: number;
	status: string;
	category: { name: string };
	seller: { name: string; address: string };
};

type SellerWithListings = {
	id: number;
	name: string;
	address: string;
	listings: Omit<ListingWithCategory, "seller">[];
};

export default function MarketplaceModerationPage() {
	const [searchQuery, setSearchQuery] = React.useState("");
	
	const { data, isLoading } = useQuery({
		queryKey: ["listingsModeration"],
		queryFn: async () => {
			const res = await fetch(`${getApiUrl()}/api/v1/listings`, {
				credentials: "include",
			});
			return res.json();
		},
	});

	const sellers: SellerWithListings[] = data?.sellers || [];
	const allListings: ListingWithCategory[] = sellers.flatMap((seller) =>
		seller.listings.map((l) => ({
			...l,
			seller: { name: seller.name, address: seller.address },
		})),
	);

	const filteredListings = allListings.filter((l) => {
		if (searchQuery && !l.seller.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}
		return true;
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
						Loading Moderation Desk...
					</Text>
				</Stack>
			</Container>
		);
	}

	return (
		<Box py={30}>
			<Container size="xl">
				<Group justify="space-between" mb={30}>
					<Stack gap={4}>
						<Group gap="xs">
							<IconShieldCheck
								size={28}
								style={{ color: "var(--mantine-color-emerald-6)" }}
							/>
							<Title order={1} style={{ fontSize: "28px", fontWeight: 800 }}>
								Marketplace{" "}
								<Text
									span
									inherit
									style={{ color: "var(--mantine-color-emerald-6)" }}
								>
									Moderation
								</Text>
							</Title>
						</Group>
						<Text size="sm" c="dimmed">
							Gemini 2.5 Flash Classification Verification Workstation
						</Text>
					</Stack>
				</Group>

				<Card withBorder shadow="sm" p="lg" mb="lg">
					<Stack gap="lg">
						<Group justify="space-between" align="center">
							<Stack gap={0}>
								<Title order={4}>Filters</Title>
								<Text size="sm" c="dimmed">
									Refine moderation queue
								</Text>
							</Stack>
							<Button variant="light" color="gray" onClick={() => setSearchQuery("")}>
								Clear All
							</Button>
						</Group>

						<Divider />

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
							<TextInput
								label="Search Seller"
								placeholder="Enter seller name"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.currentTarget.value)}
								leftSection={<IconSearch size={16} />}
							/>
						</SimpleGrid>
					</Stack>
				</Card>

				<Card p="0" withBorder shadow="sm" radius="md">
					<Table
						highlightOnHover
						verticalSpacing="sm"
						style={{ borderBottom: "1px solid var(--doki-border-color)" }}
					>
						<TableThead>
							<TableTr>
								<TableTh>Listing ID</TableTh>
								<TableTh>Producer (Organic Waste Generator)</TableTh>
								<TableTh>Category</TableTh>
								<TableTh>Metrics</TableTh>
								<TableTh>AI Flag</TableTh>
								<TableTh ta="right">Operator Action</TableTh>
							</TableTr>
						</TableThead>
						<TableTbody>
							{filteredListings.map((row) => {
								const needsReview = row.purity < 75 || row.status === "PENDING_REVIEW";
								return (
									<TableTr key={row.id}>
										<TableTd>
											<Text
												style={{
													fontFamily: "monospace",
													color: "var(--mantine-color-emerald-6)",
												}}
											>
												LST-{row.id.toString().padStart(5, "0")}
											</Text>
										</TableTd>
										<TableTd>
											<Box>
												<Text size="sm" fw={600}>
													{row.seller.name}
												</Text>
												<Text size="xs" c="dimmed">
													{row.seller.address}
												</Text>
											</Box>
										</TableTd>
										<TableTd>
											<Badge color="blue" variant="light">
												{row.category.name}
											</Badge>
										</TableTd>
										<TableTd>
											<Box>
												<Group gap="xs" mb={4}>
													<Text size="xs" w={50}>
														CPI:
													</Text>
													<Progress
														value={row.purity}
														color={row.purity < 75 ? "red" : "emerald"}
														size="sm"
														w={60}
													/>
													<Text size="xs" fw={700} c={row.purity < 75 ? "red.4" : "emerald.6"}>
														{row.purity}%
													</Text>
												</Group>
												<Group gap="xs">
													<Text size="xs" w={50}>
														RMC:
													</Text>
													<Progress value={row.moisture} color="blue" size="sm" w={60} />
													<Text size="xs" fw={700} c="blue.4">
														{row.moisture}%
													</Text>
												</Group>
											</Box>
										</TableTd>
										<TableTd>
											{needsReview ? (
												<Badge
													color="red"
													variant="filled"
													leftSection={<IconAlertTriangle size={12} />}
												>
													Flagged
												</Badge>
											) : (
												<Badge color="emerald" variant="light">
													Verified
												</Badge>
											)}
										</TableTd>
										<TableTd>
											<Group gap="xs" justify="flex-end">
												<Button
													size="xs"
													variant="light"
													color="yellow"
													leftSection={<IconSettings size={14} />}
												>
													Adjust
												</Button>
												<ActionIcon variant="light" color="red" aria-label="Delete">
													<IconTrash size={16} />
												</ActionIcon>
											</Group>
										</TableTd>
									</TableTr>
								);
							})}
						</TableTbody>
					</Table>
				</Card>
			</Container>
		</Box>
	);
}
