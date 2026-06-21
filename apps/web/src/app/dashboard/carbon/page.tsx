"use client";
"use no memo";

import React from "react";
import {
	ActionIcon,
	Badge,
	Box,
	Card,
	Container,
	Grid,
	Group,
	Menu,
	MenuDropdown,
	MenuItem,
	MenuLabel,
	MenuTarget,
	Progress,
	ScrollArea,
	SimpleGrid,
	Stack,
	Table,
	TableTbody,
	TableTd,
	TableTh,
	TableThead,
	TableTr,
	Text,
	TextInput,
	ThemeIcon,
	Title,
	Button,
	Divider,
	Select,
} from "@mantine/core";
import {
	IconDotsVertical,
	IconEye,
	IconLeaf,
	IconMapPin,
	IconSearch,
	IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";

// Mock Data for Forecasting
const FORECAST_DATA = [
	{
		id: 1,
		region: "Kiambu",
		currentVolume: "1,200 Tonnes",
		projectedAbatement: "245 MTCO2e",
		trend: "+12%",
		activeSites: 14,
		compliance: "High",
	},
	{
		id: 2,
		region: "Nakuru",
		currentVolume: "850 Tonnes",
		projectedAbatement: "180 MTCO2e",
		trend: "+8%",
		activeSites: 9,
		compliance: "Medium",
	},
	{
		id: 3,
		region: "Nairobi",
		currentVolume: "2,100 Tonnes",
		projectedAbatement: "410 MTCO2e",
		trend: "+15%",
		activeSites: 22,
		compliance: "High",
	},
];

// Row-level three-dot menu (baykart pattern)
function ForecastTableMenu({ region }: { region: string }) {
	const slug = region.toLowerCase();
	return (
		<Menu shadow="md" width={200} position="bottom-end">
			<MenuTarget>
				<ActionIcon variant="subtle" color="gray" size="sm">
					<IconDotsVertical size={16} />
				</ActionIcon>
			</MenuTarget>
			<MenuDropdown>
				<MenuLabel>Actions</MenuLabel>
				<MenuItem
					component={Link}
					href={`/dashboard/carbon/${slug}`}
					leftSection={<IconEye size={14} />}
				>
					View Details
				</MenuItem>
				<MenuItem
					component={Link}
					href={`/dashboard/carbon/${slug}`}
					leftSection={<IconMapPin size={14} />}
				>
					View Sites
				</MenuItem>
			</MenuDropdown>
		</Menu>
	);
}

const complianceColor = (c: string) => {
	if (c === "High") return "emerald";
	if (c === "Medium") return "yellow";
	return "red";
};

// Mock Data for DOC Monitors
const DOC_MONITORS = [
	{
		category: "Spent Grain",
		baselineDoc: 0.17,
		currentVariance: 0.165,
		progress: 85,
	},
	{
		category: "Coffee Pulp",
		baselineDoc: 0.15,
		currentVariance: 0.152,
		progress: 92,
	},
	{
		category: "Macadamia Shells",
		baselineDoc: 0.2,
		currentVariance: 0.195,
		progress: 78,
	},
];

export default function CarbonTracingPage() {
	const [searchQuery, setSearchQuery] = React.useState("");
	const [complianceFilter, setComplianceFilter] = React.useState<string | null>(null);

	const filteredData = FORECAST_DATA.filter((row) => {
		if (searchQuery && !row.region.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}
		if (complianceFilter && row.compliance !== complianceFilter) {
			return false;
		}
		return true;
	});
	return (
		<Box py={30}>
			<Container size="xl">
				<Group justify="space-between" mb={30}>
					<Stack gap={4}>
						<Group gap="xs">
							<IconLeaf
								size={28}
								style={{ color: "var(--mantine-color-emerald-6)" }}
							/>
							<Title order={1} style={{ fontSize: "28px", fontWeight: 800 }}>
								Ecological{" "}
								<Text
									span
									inherit
									style={{ color: "var(--mantine-color-emerald-6)" }}
								>
									Tracing Ledger
								</Text>
							</Title>
						</Group>
						<Text size="sm" c="dimmed">
							IPCC Tier 1 Compliance Tracking & Methane Abatement Forecasting
						</Text>
					</Stack>
				</Group>

				<Grid gap="lg" mb={30}>
					<Grid.Col span={12}>
						<Title order={3} size="lg" mb="sm" style={{ fontWeight: 700 }}>
							Degradable Organic Carbon (DOC) Monitors
						</Title>
						<Grid>
							{DOC_MONITORS.map((monitor) => (
								<Grid.Col span={{ base: 12, md: 4 }} key={monitor.category}>
									<Card p="lg">
										<Text
											size="sm"
											c="dimmed"
											fw={700}
											style={{ textTransform: "uppercase" }}
										>
											{monitor.category}
										</Text>
										<Group justify="space-between" mt="md" mb="xs">
											<Text size="sm">Baseline: {monitor.baselineDoc}</Text>
											<Text
												size="sm"
												color={
													monitor.currentVariance > monitor.baselineDoc
														? "red"
														: "emerald"
												}
											>
												Current: {monitor.currentVariance}
											</Text>
										</Group>
										<Progress
											value={monitor.progress}
											color="emerald"
											size="sm"
											radius="xl"
										/>
									</Card>
								</Grid.Col>
							))}
						</Grid>
					</Grid.Col>
				</Grid>

				<Card withBorder shadow="sm" p="lg" mb="lg">
					<Stack gap="lg">
						<Group justify="space-between" align="center">
							<Stack gap={0}>
								<Title order={4}>Filters</Title>
								<Text size="sm" c="dimmed">
									Refine regional data
								</Text>
							</Stack>
							<Button variant="light" color="gray" onClick={() => {
								setSearchQuery("");
								setComplianceFilter(null);
							}}>
								Clear All
							</Button>
						</Group>

						<Divider />

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
							<TextInput
								label="Search Region"
								placeholder="Enter region name"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.currentTarget.value)}
								leftSection={<IconSearch size={16} />}
							/>
							<Select
								label="Compliance"
								placeholder="Select compliance level"
								data={[
									{ value: "High", label: "High" },
									{ value: "Medium", label: "Medium" },
									{ value: "Low", label: "Low" }
								]}
								value={complianceFilter}
								onChange={setComplianceFilter}
								clearable
							/>
						</SimpleGrid>
					</Stack>
				</Card>

				<Card p="0" withBorder shadow="sm" radius="md">
					<Box p="md" style={{ borderBottom: "1px solid var(--doki-border-color)" }}>
						<Group justify="space-between">
							<Title order={3} size="lg" style={{ fontWeight: 700 }}>
								Regional Abatement Forecasting
							</Title>
							<Badge
								color="blue"
								variant="light"
								leftSection={<IconTrendingUp size={14} />}
							>
								Next 30 Days
							</Badge>
						</Group>
					</Box>

					<ScrollArea offsetScrollbars type="scroll">
						<Table
							highlightOnHover
							stickyHeader
							verticalSpacing="sm"
							withTableBorder
							withColumnBorders
						>
							<TableThead>
								<TableTr>
									<TableTh>Region</TableTh>
									<TableTh>Current Volume</TableTh>
									<TableTh>Projected Abatement</TableTh>
									<TableTh>Trend</TableTh>
									<TableTh>Active Sites</TableTh>
									<TableTh>Compliance</TableTh>
									<TableTh>Actions</TableTh>
								</TableTr>
							</TableThead>
							<TableTbody>
								{filteredData.length > 0 ? (
									filteredData.map((row) => (
										<TableTr key={row.id}>
											<TableTd>
												<Text fw={600}>{row.region}</Text>
											</TableTd>
											<TableTd>{row.currentVolume}</TableTd>
											<TableTd>
												<Text fw={600} c="emerald.6">
													{row.projectedAbatement}
												</Text>
											</TableTd>
											<TableTd>
												<Badge color="emerald" variant="light">
													{row.trend}
												</Badge>
											</TableTd>
											<TableTd>{row.activeSites}</TableTd>
											<TableTd>
												<Badge
													color={complianceColor(row.compliance)}
													variant="light"
												>
													{row.compliance}
												</Badge>
											</TableTd>
											<TableTd>
												<ForecastTableMenu region={row.region} />
											</TableTd>
										</TableTr>
									))
								) : (
									<TableTr>
										<TableTd colSpan={7}>
											<Stack align="center" justify="center" py="xl" gap="md">
												<ThemeIcon
													size={60}
													radius="md"
													variant="light"
													color="emerald"
												>
													<IconLeaf size={32} stroke={1.5} />
												</ThemeIcon>
												<Text size="lg" fw={500}>
													No forecast data found
												</Text>
												<Text size="sm" c="dimmed">
													No regional data is available at this time.
												</Text>
											</Stack>
										</TableTd>
									</TableTr>
								)}
							</TableTbody>
						</Table>
					</ScrollArea>
				</Card>
			</Container>
		</Box>
	);
}
