"use client";

import {
	Badge,
	Box,
	Button,
	Card,
	Collapse,
	Container,
	CopyButton,
	Grid,
	Group,
	Loader,
	ScrollArea,
	Skeleton,
	Stack,
	Table,
	Text,
	ThemeIcon,
	Title,
	useMantineTheme,
} from "@mantine/core";
import {
	IconArrowLeft,
	IconCheck,
	IconCopy,
	IconDatabase,
	IconRecycle,
	IconReload,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toPascalCaseWithSpace } from "@/utils/format";
import { getApiUrl } from "@/utils/network";

// Dynamically load the Map component to prevent window-undefined SSR errors in Next.js
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
	ssr: false,
	loading: () => <Skeleton height={400} radius="lg" />,
});

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
					<Box h={50} w="100%" mt="sm">
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
		loading: () => <Skeleton height={50} mt="sm" radius="md" />,
	},
);

type Scorecard = {
	totalWasteDiverted: number;
	methaneAvoided: number;
	co2eReduced: number;
};

type AuditLog = {
	id: number;
	timestamp: string;
	action: string;
	operator: string;
	details: string;
};

type MapPin = {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	address: string;
	type: "seller" | "buyer";
	details?: string;
};

type SparklineItem = {
	name: string;
	value: number;
};

type Category = {
	id: number;
	name: string;
	doc: number;
};

type ListingWithCategory = {
	id: number;
	sellerId: number;
	categoryId: number;
	quantity: number;
	moisture: number;
	purity: number;
	status: string;
	createdAt: string;
	updatedAt: string;
	category: Category;
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

export default function OperatorDashboard() {
	const { user, loading } = useAuth();
	const router = useRouter();

	// Component States
	const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

	const {
		data: dashboardData,
		isLoading: loadingData,
		refetch,
		isRefetching: refreshing,
	} = useQuery({
		queryKey: ["dashboard"],
		queryFn: async () => {
			const statsRes = await fetch(`${getApiUrl()}/api/v1/dashboard/stats`, {
				credentials: "include",
			});
			const statsData = await statsRes.json();

			const listingsRes = await fetch(`${getApiUrl()}/api/v1/listings`, {
				credentials: "include",
			});
			const listingsData = await listingsRes.json();

			const logsRes = await fetch(`${getApiUrl()}/api/v1/transactions`, {
				credentials: "include",
			});
			const logsData = await logsRes.json();

			const pins: MapPin[] = [];
			if (listingsRes.ok) {
				listingsData.sellers.forEach((s: SellerWithListings) => {
					const activeListingsText = s.listings
						.map(
							(l: ListingWithCategory) =>
								`${l.category.name} (${l.quantity} Kg)`,
						)
						.join(", ");
					pins.push({
						id: s.id,
						name: s.name,
						latitude: s.latitude,
						longitude: s.longitude,
						address: s.address,
						type: "seller",
						details: activeListingsText
							? `Active Listings: ${activeListingsText}`
							: "No active listings currently",
					});
				});
				listingsData.buyers.forEach((b: Buyer) => {
					pins.push({
						id: b.id,
						name: b.name,
						latitude: b.latitude,
						longitude: b.longitude,
						address: b.address,
						type: "buyer",
						details: "Bioenergy & Compost Offtaker",
					});
				});
			}

			return {
				stats: statsRes.ok ? statsData : null,
				auditLogs: logsRes.ok ? logsData : [],
				mapPins: pins,
			};
		},
		enabled: !!user && user.role === "ADMIN",
	});

	const stats: { scorecard: Scorecard; sparkline: SparklineItem[] } | null =
		dashboardData?.stats || null;
	const auditLogs: AuditLog[] = dashboardData?.auditLogs || [];
	const mapPins: MapPin[] = dashboardData?.mapPins || [];

	const fetchData = async () => {
		await refetch();
	};

	useEffect(() => {
		if (!loading && !user) {
			router.push("/sign-in");
		}
	}, [user, loading, router]);

	if (loading || !user) {
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
						Loading Doki Operator Portal...
					</Text>
				</Stack>
			</Container>
		);
	}

	// Access Denied guard if user is loaded but not an ADMIN
	if (user.role !== "ADMIN") {
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
				<Card
					p="xl"
					style={{
						borderColor: "var(--mantine-color-red-6)",
						maxWidth: "500px",
						textAlign: "center",
					}}
				>
					<Stack align="center" gap="md">
						<ThemeIcon color="red" size="xl" radius="xl">
							<IconRecycle size={30} />
						</ThemeIcon>
						<Title
							order={2}
							style={{ color: "var(--mantine-color-red-6)", fontWeight: 800 }}
						>
							Access Denied
						</Title>
						<Text c="dimmed" size="sm">
							The Operator Dashboard requires ADMIN clearance. Your account role
							is <strong>{user.role}</strong>.
						</Text>
						<Button
							variant="filled"
							color="emerald"
							onClick={() => router.push("/")}
						>
							Return to Homepage
						</Button>
					</Stack>
				</Card>
			</Container>
		);
	}

	if (loadingData) {
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
						Loading Doki Operator Portal...
					</Text>
				</Stack>
			</Container>
		);
	}

	// Formatting date utility
	const formatDate = (isoString: string) => {
		const d = new Date(isoString);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
	};

	const renderSafeJson = (details: string) => {
		try {
			return JSON.stringify(JSON.parse(details), null, 2);
		} catch {
			return details; // fallback to raw string
		}
	};

	const syntaxHighlightJson = (jsonStr: string): React.ReactNode => {
		if (!jsonStr) return "";
		try {
			const regex =
				/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"\s*:?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
			const parts = jsonStr.split(regex);

			return parts.map((part, index) => {
				if (!part) return null;
				// Test if this part matches our JSON token regex
				if (regex.test(part)) {
					let style: React.CSSProperties = {
						color: "var(--mantine-color-blue-4)",
					}; // default key
					if (/^"/.test(part)) {
						if (/:$/.test(part)) {
							style = {
								color: "var(--mantine-color-cyan-4)",
								fontWeight: "bold",
							}; // key
						} else {
							style = { color: "var(--mantine-color-emerald-3)" }; // string
						}
					} else if (/true|false/.test(part)) {
						style = { color: "var(--mantine-color-red-3)" }; // boolean
					} else if (/null/.test(part)) {
						style = { color: "var(--doki-text-secondary)" }; // null
					} else if (/^-?\d+/.test(part)) {
						style = { color: "var(--mantine-color-yellow-3)" }; // number
					}
					const uniqueKey = `json-part-${index}-${part.length}-${part.charCodeAt(0) || 0}`;
					return (
						<span key={uniqueKey} style={style}>
							{part}
						</span>
					);
				}
				return part;
			});
		} catch {
			return jsonStr;
		}
	};

	return (
		<Box>
			<Container size="xl">
				{/* Page Actions */}
				<Group justify="space-between" mb={30} align="center">
					<Text size="sm" c="dimmed">
						Real-time Landfill Avoidance & Greenhouse Gas Abatement Ledger |
						Kenya Circular Feedstock Hubs
					</Text>
					<Group gap="md">
						<Button
							variant="subtle"
							color="gray"
							leftSection={<IconReload size={16} />}
							onClick={fetchData}
							loading={refreshing}
						>
							Refresh Data
						</Button>
						<Button
							variant="outline"
							color="emerald"
							leftSection={<IconArrowLeft size={16} />}
							onClick={() => router.push("/")}
						>
							Back to Home
						</Button>
					</Group>
				</Group>

				{/* Real-time Impact Scorecard */}
				<Grid gap="md" mb={30}>
					{/* Card A: Total Waste Diverted */}
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Card p="lg" h="100%">
							<Text
								size="xs"
								c="dimmed"
								fw={700}
								style={{ textTransform: "uppercase", letterSpacing: "1px" }}
							>
								Total Feedstock Diverted
							</Text>
							<Group justify="space-between" align="baseline" mt="sm">
								<Text style={{ fontSize: "32px", fontWeight: 800 }}>
									{stats?.scorecard.totalWasteDiverted || 0}{" "}
									<Text span size="xl" c="dimmed">
										Tonnes
									</Text>
								</Text>
								<Badge color="emerald" variant="light">
									Diverted from Landfill
								</Badge>
							</Group>
							<SparklineChart data={stats?.sparkline || []} />
						</Card>
					</Grid.Col>

					{/* Card B: Methane Avoided */}
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Card p="lg" h="100%">
							<Text
								size="xs"
								c="dimmed"
								fw={700}
								style={{ textTransform: "uppercase", letterSpacing: "1px" }}
							>
								Methane Avoided (IPCC Tier 1)
							</Text>
							<Group justify="space-between" align="baseline" mt="sm">
								<Text style={{ fontSize: "32px", fontWeight: 800 }}>
									{stats?.scorecard.methaneAvoided || 0}{" "}
									<Text span size="xl" c="dimmed">
										MT
									</Text>
								</Text>
								<Badge color="emerald" variant="light">
									IPCC Standard DOC
								</Badge>
							</Group>
							<SparklineChart data={stats?.sparkline || []} />
						</Card>
					</Grid.Col>

					{/* Card C: CO2e Reductions */}
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Card p="lg" h="100%">
							<Text
								size="xs"
								c="dimmed"
								fw={700}
								style={{ textTransform: "uppercase", letterSpacing: "1px" }}
							>
								CO2e Reductions
							</Text>
							<Group justify="space-between" align="baseline" mt="sm">
								<Text style={{ fontSize: "32px", fontWeight: 800 }}>
									{stats?.scorecard.co2eReduced || 0}{" "}
									<Text span size="xl" c="dimmed">
										MTCO₂e
									</Text>
								</Text>
								<Badge color="emerald" variant="light">
									GWP Multiplier x28
								</Badge>
							</Group>
							<SparklineChart data={stats?.sparkline || []} />
						</Card>
					</Grid.Col>
				</Grid>

				{/* Proximity Map & Audit Trail Grid */}
				<Grid gap="lg" mb={30}>
					{/* Map Column */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card p="md" style={{ height: "100%" }}>
							<Title order={3} size="lg" mb="sm" style={{ fontWeight: 700 }}>
								Kenyan Geo-Spatial Proximity Map
							</Title>
							<Text size="xs" c="dimmed" mb="md">
								Active Listings Map in Thika, Kiambu, and Nairobi. Green markers
								represent Organic Waste Generators. Blue markers represent
								Industrial Circular Consumers.
							</Text>
							<MapComponent pins={mapPins} />
						</Card>
					</Grid.Col>

					{/* Audit Ledger Column */}
					<Grid.Col span={{ base: 12, lg: 6 }}>
						<Card p="md" style={{ height: "100%" }}>
							<Title order={3} size="lg" mb="sm" style={{ fontWeight: 700 }}>
								Real-time Audit Ledger
							</Title>
							<Text size="xs" c="dimmed" mb="md">
								Scrollable real-time transaction ledger for audit review. Click
								any row to expand forensic parameters.
							</Text>

							<ScrollArea h={380}>
								<Table highlightOnHover verticalSpacing="sm">
									<Table.Thead
										style={{
											borderBottom: "1.5px solid var(--doki-border-color)",
										}}
									>
										<Table.Tr>
											<Table.Th
												style={{
													color: "var(--doki-text-secondary)",
													fontSize: "12px",
												}}
											>
												Timestamp
											</Table.Th>
											<Table.Th
												style={{
													color: "var(--doki-text-secondary)",
													fontSize: "12px",
												}}
											>
												Action
											</Table.Th>
											<Table.Th
												style={{
													color: "var(--doki-text-secondary)",
													fontSize: "12px",
												}}
											>
												Operator
											</Table.Th>
										</Table.Tr>
									</Table.Thead>
									<Table.Tbody>
										{auditLogs.slice(0, 5).map((log) => {
											const isExpanded = expandedLogId === log.id;
											let badgeColor = "blue";
											if (log.action === "TRANSACTION_COMPLETED")
												badgeColor = "emerald";
											else if (log.action === "LISTING_PUBLISHED")
												badgeColor = "emerald";
											else if (log.action === "SYSTEM_BOOTSTRAP")
												badgeColor = "cyan";

											return (
												<React.Fragment key={log.id}>
													<Table.Tr
														onClick={() =>
															setExpandedLogId(isExpanded ? null : log.id)
														}
														style={{
															cursor: "pointer",
															borderBottom:
																"1px solid var(--doki-border-color)",
														}}
													>
														<Table.Td
															style={{ fontSize: "12px", whiteSpace: "nowrap" }}
														>
															{formatDate(log.timestamp)}
														</Table.Td>
														<Table.Td>
															<Badge
																color={badgeColor}
																variant="light"
																size="xs"
															>
																{toPascalCaseWithSpace(log.action)}
															</Badge>
														</Table.Td>
														<Table.Td
															style={{ fontSize: "12px", fontWeight: 500 }}
														>
															{toPascalCaseWithSpace(log.operator)}
														</Table.Td>
													</Table.Tr>
													<Table.Tr>
														<Table.Td colSpan={3} p={0}>
															<Collapse expanded={isExpanded}>
																<Box
																	p="md"
																	style={{
																		backgroundColor: "var(--doki-bg-base)",
																		borderBottom:
																			"1px solid var(--doki-border-color)",
																	}}
																>
																	<Group justify="space-between" mb="xs">
																		<Group gap="xs">
																			<IconDatabase
																				size={14}
																				style={{
																					color:
																						"var(--mantine-color-emerald-6)",
																				}}
																			/>
																			<Text
																				size="xs"
																				fw={700}
																				style={{
																					color:
																						"var(--mantine-color-emerald-6)",
																				}}
																			>
																				Forensic JSON Metadata
																			</Text>
																		</Group>
																		<CopyButton
																			value={renderSafeJson(log.details)}
																		>
																			{({ copied, copy }) => (
																				<Button
																					size="xs"
																					variant="subtle"
																					color={copied ? "emerald" : "gray"}
																					leftSection={
																						copied ? (
																							<IconCheck size={14} />
																						) : (
																							<IconCopy size={14} />
																						)
																					}
																					onClick={copy}
																				>
																					{copied
																						? "Copied"
																						: "Copy Cryptographic Hash / Metadata Record"}
																				</Button>
																			)}
																		</CopyButton>
																	</Group>
																	<Box
																		style={{
																			margin: 0,
																			fontSize: "11px",
																			overflowX: "auto",
																			fontFamily: "monospace",
																			padding: "10px",
																			backgroundColor:
																				"var(--doki-surface-color)",
																			border:
																				"1px solid var(--doki-border-color)",
																			borderRadius: "8px",
																			lineHeight: 1.5,
																		}}
																	>
																		<pre
																			style={{
																				margin: 0,
																				whiteSpace: "pre-wrap",
																				wordBreak: "break-all",
																			}}
																		>
																			{syntaxHighlightJson(
																				renderSafeJson(log.details),
																			)}
																		</pre>
																	</Box>
																</Box>
															</Collapse>
														</Table.Td>
													</Table.Tr>
												</React.Fragment>
											);
										})}
									</Table.Tbody>
								</Table>
							</ScrollArea>
						</Card>
					</Grid.Col>
				</Grid>
			</Container>
		</Box>
	);
}
