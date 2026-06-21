"use client";
"use no memo";

import {
	Badge,
	Box,
	Card,
	Container,
	Grid,
	Group,
	Progress,
	Stack,
	Table,
	TableTbody,
	TableTd,
	TableTh,
	TableThead,
	TableTr,
	Text,
	Title,
} from "@mantine/core";
import { IconLeaf, IconTrendingUp } from "@tabler/icons-react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

// Mock Data for Forecasting
const FORECAST_DATA = [
	{
		id: 1,
		region: "Kiambu",
		currentVolume: "1,200 Tonnes",
		projectedAbatement: "245 MTCO2e",
		trend: "+12%",
	},
	{
		id: 2,
		region: "Nakuru",
		currentVolume: "850 Tonnes",
		projectedAbatement: "180 MTCO2e",
		trend: "+8%",
	},
	{
		id: 3,
		region: "Nairobi",
		currentVolume: "2,100 Tonnes",
		projectedAbatement: "410 MTCO2e",
		trend: "+15%",
	},
];

type Forecast = (typeof FORECAST_DATA)[0];
const columnHelper = createColumnHelper<Forecast>();

const columns = [
	columnHelper.accessor("region", {
		header: "Region",
		cell: (info) => <Text fw={600}>{info.getValue()}</Text>,
	}),
	columnHelper.accessor("currentVolume", {
		header: "Current Volume",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("projectedAbatement", {
		header: "Projected Abatement",
		cell: (info) => (
			<Text fw={600} c="emerald.6">
				{info.getValue()}
			</Text>
		),
	}),
	columnHelper.accessor("trend", {
		header: "Trend",
		cell: (info) => (
			<Badge color="emerald" variant="light">
				{info.getValue()}
			</Badge>
		),
	}),
];

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
	const table = useReactTable({
		data: FORECAST_DATA,
		columns,
		getCoreRowModel: getCoreRowModel(),
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

				<Card p="md">
					<Group justify="space-between" mb="md">
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
					<Table
						highlightOnHover
						verticalSpacing="sm"
						withTableBorder
						withColumnBorders
					>
						<TableThead>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableTr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableTh key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableTh>
									))}
								</TableTr>
							))}
						</TableThead>
						<TableTbody>
							{table.getRowModel().rows.map((row) => (
								<TableTr key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableTd key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableTd>
									))}
								</TableTr>
							))}
						</TableTbody>
					</Table>
				</Card>
			</Container>
		</Box>
	);
}
