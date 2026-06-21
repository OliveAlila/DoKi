"use client";

import {
	Badge,
	Box,
	Button,
	Card,
	Container,
	Grid,
	Group,
	Progress,
	RingProgress,
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
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconArrowLeft,
	IconBuilding,
	IconLeaf,
	IconMapPin,
	IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Mock per-region data
const REGION_DATA: Record<
	string,
	{
		name: string;
		currentVolume: string;
		projectedAbatement: string;
		trend: string;
		compliance: string;
		activeSites: number;
		totalWaste: string;
		methaneCapture: string;
		doc: number;
		sites: {
			name: string;
			type: string;
			volume: string;
			status: string;
			doc: number;
		}[];
		monthlyTrend: { month: string; abatement: number }[];
	}
> = {
	kiambu: {
		name: "Kiambu",
		currentVolume: "1,200 Tonnes",
		projectedAbatement: "245 MTCO2e",
		trend: "+12%",
		compliance: "High",
		activeSites: 14,
		totalWaste: "3,400 Tonnes",
		methaneCapture: "87%",
		doc: 0.165,
		sites: [
			{ name: "Kiambu Breweries Waste", type: "Spent Grain", volume: "420 T", status: "Active", doc: 0.17 },
			{ name: "Limuru Coffee Co.", type: "Coffee Pulp", volume: "280 T", status: "Active", doc: 0.15 },
			{ name: "Tigoni Macadamia Farm", type: "Macadamia Shells", volume: "180 T", status: "Active", doc: 0.20 },
			{ name: "Kiambu FMCG Complex", type: "Organic Waste", volume: "320 T", status: "Under Review", doc: 0.18 },
		],
		monthlyTrend: [
			{ month: "Jan", abatement: 195 },
			{ month: "Feb", abatement: 210 },
			{ month: "Mar", abatement: 220 },
			{ month: "Apr", abatement: 228 },
			{ month: "May", abatement: 238 },
			{ month: "Jun", abatement: 245 },
		],
	},
	nakuru: {
		name: "Nakuru",
		currentVolume: "850 Tonnes",
		projectedAbatement: "180 MTCO2e",
		trend: "+8%",
		compliance: "Medium",
		activeSites: 9,
		totalWaste: "2,100 Tonnes",
		methaneCapture: "72%",
		doc: 0.152,
		sites: [
			{ name: "Nakuru Dairy Collective", type: "Dairy Waste", volume: "310 T", status: "Active", doc: 0.16 },
			{ name: "Rift Valley Grain Mills", type: "Spent Grain", volume: "240 T", status: "Active", doc: 0.17 },
			{ name: "Nakuru Flower Farm", type: "Organic Waste", volume: "180 T", status: "Active", doc: 0.14 },
			{ name: "Molo Wheat Processing", type: "Organic Waste", volume: "120 T", status: "Under Review", doc: 0.15 },
		],
		monthlyTrend: [
			{ month: "Jan", abatement: 148 },
			{ month: "Feb", abatement: 155 },
			{ month: "Mar", abatement: 160 },
			{ month: "Apr", abatement: 165 },
			{ month: "May", abatement: 172 },
			{ month: "Jun", abatement: 180 },
		],
	},
	nairobi: {
		name: "Nairobi",
		currentVolume: "2,100 Tonnes",
		projectedAbatement: "410 MTCO2e",
		trend: "+15%",
		compliance: "High",
		activeSites: 22,
		totalWaste: "5,800 Tonnes",
		methaneCapture: "93%",
		doc: 0.195,
		sites: [
			{ name: "JKIA Industrial Zone", type: "Mixed Organic", volume: "620 T", status: "Active", doc: 0.19 },
			{ name: "Dandora Waste Processing", type: "Organic Waste", volume: "480 T", status: "Active", doc: 0.21 },
			{ name: "Karen Horticultural Hub", type: "Horticultural", volume: "360 T", status: "Active", doc: 0.16 },
			{ name: "Industrial Area Breweries", type: "Spent Grain", volume: "420 T", status: "Active", doc: 0.17 },
			{ name: "Westlands Food Complex", type: "Food Waste", volume: "220 T", status: "Active", doc: 0.18 },
		],
		monthlyTrend: [
			{ month: "Jan", abatement: 330 },
			{ month: "Feb", abatement: 348 },
			{ month: "Mar", abatement: 362 },
			{ month: "Apr", abatement: 378 },
			{ month: "May", abatement: 395 },
			{ month: "Jun", abatement: 410 },
		],
	},
};

const statusColor = (s: string) => {
	if (s === "Active") return "emerald";
	if (s === "Under Review") return "yellow";
	return "red";
};

const complianceColor = (c: string) => {
	if (c === "High") return "emerald";
	if (c === "Medium") return "yellow";
	return "red";
};

const maxAbatement = (trend: { month: string; abatement: number }[]) =>
	Math.max(...trend.map((t) => t.abatement));

export default function RegionDetailPage({
	params,
}: {
	params: { region: string };
}) {
	const data = REGION_DATA[params.region.toLowerCase()];

	if (!data) notFound();

	const max = maxAbatement(data.monthlyTrend);

	return (
		<Box py={30}>
			<Container size="xl">
				{/* Back + Header */}
				<Stack gap="xs" mb={30}>
					<Button
						component={Link}
						href="/dashboard/carbon"
						variant="subtle"
						color="gray"
						leftSection={<IconArrowLeft size={16} />}
						size="xs"
						w="fit-content"
					>
						Back to Carbon Ledger
					</Button>

					<Group gap="xs">
						<IconLeaf
							size={28}
							style={{ color: "var(--mantine-color-emerald-6)" }}
						/>
						<Title order={1} style={{ fontSize: "26px", fontWeight: 800 }}>
							{data.name}{" "}
							<Text
								span
								inherit
								style={{ color: "var(--mantine-color-emerald-6)" }}
							>
								Region
							</Text>
						</Title>
						<Badge color={complianceColor(data.compliance)} variant="filled" ml="sm">
							{data.compliance} Compliance
						</Badge>
					</Group>
					<Text size="sm" c="dimmed">
						IPCC Tier 1 regional breakdown — methane abatement tracking & site
						overview
					</Text>
				</Stack>

				{/* KPI Cards */}
				<SimpleGrid cols={{ base: 2, md: 4 }} mb={30}>
					<Card p="lg" withBorder>
						<Stack gap={4}>
							<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
								Current Volume
							</Text>
							<Text size="xl" fw={800}>
								{data.currentVolume}
							</Text>
						</Stack>
					</Card>
					<Card p="lg" withBorder>
						<Stack gap={4}>
							<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
								Projected Abatement
							</Text>
							<Text size="xl" fw={800} c="emerald.6">
								{data.projectedAbatement}
							</Text>
						</Stack>
					</Card>
					<Card p="lg" withBorder>
						<Stack gap={4}>
							<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
								Methane Capture Rate
							</Text>
							<Text size="xl" fw={800} c="blue">
								{data.methaneCapture}
							</Text>
						</Stack>
					</Card>
					<Card p="lg" withBorder>
						<Stack gap={4}>
							<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
								Active Sites
							</Text>
							<Group gap="xs" align="center">
								<ThemeIcon size="md" color="emerald" variant="light" radius="md">
									<IconBuilding size={16} />
								</ThemeIcon>
								<Text size="xl" fw={800}>
									{data.activeSites}
								</Text>
							</Group>
						</Stack>
					</Card>
				</SimpleGrid>

				{/* Trend chart + DOC Ring */}
				<Grid mb={30}>
					<Grid.Col span={{ base: 12, md: 8 }}>
						<Card p="lg" withBorder h="100%">
							<Group justify="space-between" mb="md">
								<Title order={4} fw={700}>
									Monthly Abatement Trend
								</Title>
								<Badge
									color="blue"
									variant="light"
									leftSection={<IconTrendingUp size={12} />}
								>
									{data.trend} this period
								</Badge>
							</Group>
							<Stack gap="xs">
								{data.monthlyTrend.map((point) => (
									<Group key={point.month} gap="sm" align="center">
										<Text size="sm" w={30} c="dimmed">
											{point.month}
										</Text>
										<Box flex={1}>
											<Progress
												value={(point.abatement / max) * 100}
												color="emerald"
												size="md"
												radius="xl"
											/>
										</Box>
										<Text size="sm" fw={600} w={70} ta="right" c="emerald.6">
											{point.abatement} MT
										</Text>
									</Group>
								))}
							</Stack>
						</Card>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 4 }}>
						<Card p="lg" withBorder h="100%">
							<Title order={4} fw={700} mb="md">
								DOC Variance
							</Title>
							<Stack align="center" gap="sm">
								<RingProgress
									size={160}
									thickness={16}
									roundCaps
									sections={[
										{
											value: (data.doc / 0.25) * 100,
											color: "emerald",
											tooltip: `Current DOC: ${data.doc}`,
										},
									]}
									label={
										<Stack gap={0} align="center">
											<Text size="lg" fw={800}>
												{data.doc}
											</Text>
											<Text size="xs" c="dimmed">
												DOC
											</Text>
										</Stack>
									}
								/>
								<Text size="sm" c="dimmed" ta="center">
									Current degradable organic carbon variance vs. IPCC baseline
									(0.25)
								</Text>
							</Stack>
						</Card>
					</Grid.Col>
				</Grid>

				{/* Sites Table */}
				<Card p="md" withBorder>
					<Group gap="xs" mb="md">
						<ThemeIcon color="emerald" variant="light" size="md" radius="md">
							<IconMapPin size={16} />
						</ThemeIcon>
						<Title order={3} size="md" fw={700}>
							Registered Waste Sites — {data.name}
						</Title>
					</Group>

					<ScrollArea offsetScrollbars type="scroll">
						<Table highlightOnHover stickyHeader withTableBorder withColumnBorders>
							<TableThead>
								<TableTr>
									<TableTh>Site Name</TableTh>
									<TableTh>Waste Type</TableTh>
									<TableTh>Volume</TableTh>
									<TableTh>DOC Value</TableTh>
									<TableTh>Status</TableTh>
								</TableTr>
							</TableThead>
							<TableTbody>
								{data.sites.map((site) => (
									<TableTr key={site.name}>
										<TableTd>
											<Text fw={600}>{site.name}</Text>
										</TableTd>
										<TableTd>
											<Text size="sm" c="dimmed">
												{site.type}
											</Text>
										</TableTd>
										<TableTd>{site.volume}</TableTd>
										<TableTd>
											<Text fw={600} c="emerald.6">
												{site.doc}
											</Text>
										</TableTd>
										<TableTd>
											<Badge
												color={statusColor(site.status)}
												variant="light"
												size="sm"
											>
												{site.status}
											</Badge>
										</TableTd>
									</TableTr>
								))}
							</TableTbody>
						</Table>
					</ScrollArea>
				</Card>
			</Container>
		</Box>
	);
}
