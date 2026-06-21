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
	Group,
	Loader,
	Stack,
	Table,
	TableTbody,
	TableTd,
	TableTh,
	TableThead,
	TableTr,
	Tabs,
	Text,
	TextInput,
	Title,
	Divider,
	SimpleGrid,
} from "@mantine/core";
import {
	IconBan,
	IconBuildingFactory,
	IconUserExclamation,
	IconUsers,
	IconSearch,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { getApiUrl } from "@/utils/network";

type ListingWithCategory = {
	id: number;
	quantity: number;
	category: { name: string };
};

type SellerWithListings = {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	address: string;
	listings: ListingWithCategory[];
};

type Buyer = {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	address: string;
};

export default function UserRegistryPage() {
	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsString.withDefault("sellers"),
	);
	const [searchQuery, setSearchQuery] = React.useState("");

	const { data, isLoading } = useQuery({
		queryKey: ["usersRegistry"],
		queryFn: async () => {
			const res = await fetch(`${getApiUrl()}/api/v1/listings`, {
				credentials: "include",
			});
			return res.json();
		},
	});

	const sellers: SellerWithListings[] = data?.sellers || [];
	const buyers: Buyer[] = data?.buyers || [];

	const filteredSellers = sellers.filter(s => 
		!searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
	);
	
	const filteredBuyers = buyers.filter(b => 
		!searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

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
						Loading User Registry...
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
							<IconUsers
								size={28}
								style={{ color: "var(--mantine-color-emerald-6)" }}
							/>
							<Title order={1} style={{ fontSize: "28px", fontWeight: 800 }}>
								User &{" "}
								<Text
									span
									inherit
									style={{ color: "var(--mantine-color-emerald-6)" }}
								>
									Facility Registry
								</Text>
							</Title>
						</Group>
						<Text size="sm" c="dimmed">
							Platform Membership & Operational Compliance Management
						</Text>
					</Stack>
				</Group>

				<Card withBorder shadow="sm" p="lg" mb="lg">
					<Stack gap="lg">
						<Group justify="space-between" align="center">
							<Stack gap={0}>
								<Title order={4}>Filters</Title>
								<Text size="sm" c="dimmed">
									Refine user search
								</Text>
							</Stack>
							<Button variant="light" color="gray" onClick={() => setSearchQuery("")}>
								Clear All
							</Button>
						</Group>

						<Divider />

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
							<TextInput
								label="Search User"
								placeholder="Enter name"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.currentTarget.value)}
								leftSection={<IconSearch size={16} />}
							/>
						</SimpleGrid>
					</Stack>
				</Card>

				<Card p="0" withBorder shadow="sm" radius="md" style={{ overflow: "hidden" }}>
					<Tabs
						value={activeTab}
						onChange={setActiveTab}
						color="emerald"
						variant="outline"
					>
						<Tabs.List>
							<Tabs.Tab
								value="sellers"
								leftSection={<IconUserExclamation size={16} />}
								style={{ fontWeight: 600 }}
							>
								Producers (Organic Waste Generators)
							</Tabs.Tab>
							<Tabs.Tab
								value="buyers"
								leftSection={<IconBuildingFactory size={16} />}
								style={{ fontWeight: 600 }}
							>
								Offtakers (Industrial Circular Consumers)
							</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value="sellers" p="md">
							<Table
								highlightOnHover
								verticalSpacing="sm"
								withTableBorder
								withColumnBorders
							>
								<TableThead>
									<TableTr>
										<TableTh>Enterprise ID</TableTh>
										<TableTh>Name</TableTh>
										<TableTh>Location</TableTh>
										<TableTh>Active Listings</TableTh>
										<TableTh ta="right">Actions</TableTh>
									</TableTr>
								</TableThead>
								<TableTbody>
									{filteredSellers.map((row) => (
										<TableTr key={row.id}>
											<TableTd>
												<Text
													style={{
														fontFamily: "monospace",
														color: "var(--mantine-color-emerald-6)",
													}}
												>
													E-SEL-{row.id.toString().padStart(4, "0")}
												</Text>
											</TableTd>
											<TableTd>
												<Text fw={600}>{row.name}</Text>
											</TableTd>
											<TableTd>
												<Box>
													<Text size="sm">{row.address}</Text>
													<Text size="xs" c="dimmed">
														{row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
													</Text>
												</Box>
											</TableTd>
											<TableTd>
												<Badge color="blue" variant="light">
													{row.listings.length} Active
												</Badge>
											</TableTd>
											<TableTd>
												<Group gap="xs" justify="flex-end">
													<Button size="xs" variant="light" color="blue">
														Verify License
													</Button>
													<ActionIcon variant="light" color="red" aria-label="Suspend">
														<IconBan size={16} />
													</ActionIcon>
												</Group>
											</TableTd>
										</TableTr>
									))}
								</TableTbody>
							</Table>
						</Tabs.Panel>

						<Tabs.Panel value="buyers" p="md">
							<Table
								highlightOnHover
								verticalSpacing="sm"
								withTableBorder
								withColumnBorders
							>
								<TableThead>
									<TableTr>
										<TableTh>Organization ID</TableTh>
										<TableTh>Name</TableTh>
										<TableTh>Facility Location</TableTh>
										<TableTh>Status</TableTh>
										<TableTh ta="right">Actions</TableTh>
									</TableTr>
								</TableThead>
								<TableTbody>
									{filteredBuyers.map((row) => (
										<TableTr key={row.id}>
											<TableTd>
												<Text
													style={{
														fontFamily: "monospace",
														color: "var(--mantine-color-blue-6)",
													}}
												>
													O-BUY-{row.id.toString().padStart(4, "0")}
												</Text>
											</TableTd>
											<TableTd>
												<Text fw={600}>{row.name}</Text>
											</TableTd>
											<TableTd>
												<Box>
													<Text size="sm">{row.address}</Text>
													<Text size="xs" c="dimmed">
														{row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
													</Text>
												</Box>
											</TableTd>
											<TableTd>
												<Badge color="emerald" variant="light">
													Active
												</Badge>
											</TableTd>
											<TableTd>
												<Group gap="xs" justify="flex-end">
													<Button size="xs" variant="light" color="blue">
														Verify License
													</Button>
													<ActionIcon variant="light" color="red" aria-label="Suspend">
														<IconBan size={16} />
													</ActionIcon>
												</Group>
											</TableTd>
										</TableTr>
									))}
								</TableTbody>
							</Table>
						</Tabs.Panel>
					</Tabs>
				</Card>
			</Container>
		</Box>
	);
}
