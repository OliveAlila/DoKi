"use client";

import {
	Badge,
	Box,
	Card,
	Container,
	Grid,
	Group,
	Loader,
	Skeleton,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import {
	IconChartBar,
	IconCloudOff,
	IconFlameOff,
	IconLeaf,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { getApiUrl } from "@/utils/network";

// Dynamically load Recharts components to prevent SSR hydration mismatches
const SparklineChart = dynamic(
	() =>
		import("recharts").then((recharts) => {
			const { ResponsiveContainer, AreaChart, Area } = recharts;
			return function ChartComponent({
				data,
			}: {
				data: { name: string; value: number }[];
			}) {
				const theme = useMantineTheme();
				const primaryColor = theme.colors.emerald?.[6] || "#16A34A";
				return (
					<Box h="100%" w="100%">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={data}
								margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
							>
								<defs>
									<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="5%"
											stopColor={primaryColor}
											stopOpacity={0.3}
										/>
										<stop
											offset="95%"
											stopColor={primaryColor}
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<Area
									type="monotone"
									dataKey="value"
									stroke={primaryColor}
									strokeWidth={1.5}
									fillOpacity={1}
									fill="url(#colorValue)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</Box>
				);
			};
		}),
	{
		ssr: false,
		loading: () => <Skeleton height={80} w="100%" radius="md" />,
	},
);

type Transaction = {
	id: number;
	quantity: number;
	methaneAvoided: number;
	co2eReduced: number;
	createdAt: string;
};

export default function ESGImpactPage() {
	const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
		queryKey: ["buyerContracts"], // share the cache
		queryFn: async () => {
			const res = await fetch(`${getApiUrl()}/api/v1/buyer/transactions`, {
				credentials: "include",
			});
			return res.json();
		},
	});

	const stats = useMemo(() => {
		let totalWeightKg = 0;
		let methaneAvoided = 0;
		let co2eReduced = 0;

		transactions.forEach((t) => {
			totalWeightKg += t.quantity;
			methaneAvoided += t.methaneAvoided;
			co2eReduced += t.co2eReduced;
		});

		// Generate sparkline chart data by month for the last 6 months
		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		const monthlyDataMap: { [key: string]: number } = {};
		const today = new Date();
		const trendData: { name: string; value: number }[] = [];

		for (let i = 5; i >= 0; i--) {
			const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
			const mName = months[d.getMonth()] as string;
			monthlyDataMap[mName] = 0;
			trendData.push({ name: mName, value: 0 });
		}

		transactions.forEach((t) => {
			const tDate = new Date(t.createdAt);
			const mName = months[tDate.getMonth()] as string;
			if (mName && monthlyDataMap[mName] !== undefined) {
				monthlyDataMap[mName] += t.quantity / 1000; // Tonnes diverted
			}
		});

		const sparkline = trendData.map((item) => ({
			name: item.name,
			value: parseFloat((monthlyDataMap[item.name] || 0).toFixed(2)),
		}));

		return {
			totalWeightTonnes: parseFloat((totalWeightKg / 1000).toFixed(2)),
			methaneAvoided: parseFloat(methaneAvoided.toFixed(3)),
			co2eReduced: parseFloat(co2eReduced.toFixed(3)),
			sparkline,
		};
	}, [transactions]);

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
					<Loader color="teal" size="lg" type="dots" />
					<Text c="dimmed" size="sm">
						Compiling ESG Audit Metrics...
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
							<IconChartBar
								size={28}
								style={{ color: "var(--mantine-color-teal-6)" }}
							/>
							<Title order={1} style={{ fontSize: "28px", fontWeight: 800 }}>
								Corporate ESG GHG Abatement Ledger
							</Title>
						</Group>
						<Text size="sm" c="dimmed">
							Audited greenhouse gas abatement ledger verified via IPCC-Tier 1
							mathematical models
						</Text>
					</Stack>
				</Group>

				<Grid gap="lg">
					{/* Card A: Wet Weight Diverted */}
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Card p="xl">
							<Group gap="xs" mb="sm">
								<IconLeaf
									size={18}
									style={{ color: "var(--mantine-color-teal-6)" }}
								/>
								<Text
									size="xs"
									c="dimmed"
									fw={700}
									style={{ textTransform: "uppercase", letterSpacing: "1px" }}
								>
									Total Wet Feedstock Diverted
								</Text>
							</Group>
							<Group justify="space-between" align="baseline" mt="sm">
								<Text style={{ fontSize: "36px", fontWeight: 800 }}>
									{stats.totalWeightTonnes}{" "}
									<Text span size="xl" c="dimmed">
										Tonnes
									</Text>
								</Text>
								<Badge color="teal" variant="light">
									Diverted from Landfill
								</Badge>
							</Group>
							<Box mt="md" h={80}>
								<SparklineChart data={stats.sparkline} />
							</Box>
						</Card>
					</Grid.Col>

					{/* Card B: Methane Emissions Displaced */}
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Card p="xl">
							<Group gap="xs" mb="sm">
								<IconFlameOff size={18} color="orange" />
								<Text
									size="xs"
									c="dimmed"
									fw={700}
									style={{ textTransform: "uppercase", letterSpacing: "1px" }}
								>
									Audited Greenhouse Gas Abatement Ledger (IPCC Tier 1)
								</Text>
							</Group>
							<Group justify="space-between" align="baseline" mt="sm">
								<Text style={{ fontSize: "36px", fontWeight: 800 }}>
									{stats.methaneAvoided}{" "}
									<Text span size="xl" c="dimmed">
										MT
									</Text>
								</Text>
								<Badge color="yellow" variant="light">
									IPCC Standard DOC
								</Badge>
							</Group>
							<Box mt="md" h={80}>
								<SparklineChart data={stats.sparkline} />
							</Box>
						</Card>
					</Grid.Col>

					{/* Card C: net GHG Reductions */}
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Card p="xl">
							<Group gap="xs" mb="sm">
								<IconCloudOff size={18} color="indigo" />
								<Text
									size="xs"
									c="dimmed"
									fw={700}
									style={{ textTransform: "uppercase", letterSpacing: "1px" }}
								>
									Net Carbon Abatement Equivalent (CO2e)
								</Text>
							</Group>
							<Group justify="space-between" align="baseline" mt="sm">
								<Text style={{ fontSize: "36px", fontWeight: 800 }}>
									{stats.co2eReduced}{" "}
									<Text span size="xl" c="dimmed">
										MTCO₂e
									</Text>
								</Text>
								<Badge color="indigo" variant="light">
									GWP Multiplier x28
								</Badge>
							</Group>
							<Box mt="md" h={80}>
								<SparklineChart data={stats.sparkline} />
							</Box>
						</Card>
					</Grid.Col>
				</Grid>
			</Container>
		</Box>
	);
}
