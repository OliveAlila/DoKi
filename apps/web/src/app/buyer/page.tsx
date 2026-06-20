"use client";

import {
	Badge,
	Box,
	Button,
	Card,
	Container,
	Grid,
	Group,
	Loader,
	ScrollArea,
	Select,
	Skeleton,
	Slider,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconFilter,
	IconLeaf,
	IconListDetails,
	IconMapSearch,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/utils/network";

// Dynamically load the Map component
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
	ssr: false,
	loading: () => <Skeleton height={500} radius="lg" w="100%" />,
});

type ListingWithCategory = {
	id: number;
	quantity: number;
	moisture: number;
	purity: number;
	status: string;
	category: { name: string };
	seller: {
		name: string;
		address: string;
		latitude: number;
		longitude: number;
	};
};

type MapPin = {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	address: string;
	type: "seller" | "buyer";
	details: string;
};

// Haversine distance formula in km
const getDistance = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) => {
	const R = 6371; // km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

export default function MarketplaceFeedPage() {
	const { user } = useAuth();

	const [filterCategory, setFilterCategory] = useState<string | null>(null);
	const [minPurity, setMinPurity] = useState<number>(80);
	const [maxMoisture, setMaxMoisture] = useState<number>(60);
	const [maxDistance, setMaxDistance] = useState<number>(50);

	const { data, isLoading } = useQuery({
		queryKey: ["marketplaceListings"],
		queryFn: async () => {
			const res = await fetch(`${getApiUrl()}/api/v1/listings`, {
				credentials: "include",
			});
			return res.json();
		},
	});

	const allListings: ListingWithCategory[] = useMemo(() => {
		if (!data?.sellers) return [];
		return data.sellers.flatMap(
			(seller: {
				name: string;
				address: string;
				latitude: number;
				longitude: number;
				listings: Omit<ListingWithCategory, "seller">[];
			}) =>
				seller.listings
					.filter((l: { status: string }) => l.status === "PENDING")
					.map((l: Omit<ListingWithCategory, "seller">) => ({
						...l,
						seller: {
							name: seller.name,
							address: seller.address,
							latitude: seller.latitude,
							longitude: seller.longitude,
						},
					})),
		);
	}, [data]);

	const uniqueCategories = useMemo(
		() => Array.from(new Set(allListings.map((l) => l.category.name))),
		[allListings],
	);

	const filteredListings = useMemo(() => {
		return allListings.filter((l) => {
			// Category filter
			if (filterCategory && l.category.name !== filterCategory) return false;
			// Purity filter
			if (l.purity < minPurity) return false;
			// Moisture filter
			if (l.moisture > maxMoisture) return false;

			// Distance filter
			if (
				user?.latitude &&
				user?.longitude &&
				l.seller.latitude &&
				l.seller.longitude
			) {
				const dist = getDistance(
					user.latitude,
					user.longitude,
					l.seller.latitude,
					l.seller.longitude,
				);
				if (dist > maxDistance) return false;
			}
			return true;
		});
	}, [allListings, filterCategory, minPurity, maxMoisture, maxDistance, user]);

	const mapPins = useMemo(() => {
		const pins: MapPin[] = [];
		filteredListings.forEach((l) => {
			pins.push({
				id: l.id,
				name: l.seller.name,
				latitude: l.seller.latitude,
				longitude: l.seller.longitude,
				address: l.seller.address,
				type: "seller",
				details: `${l.category.name} (${l.quantity} Kg) - Purity: ${l.purity}%`,
			});
		});
		// Add Buyer pin
		if (user?.latitude && user?.longitude) {
			pins.push({
				id: -1,
				name: user.companyName || user.name || "Your Facility",
				latitude: user.latitude,
				longitude: user.longitude,
				address: user.address || "",
				type: "buyer",
				details: "Your Feedstock Processing Facility",
			});
		}
		return pins;
	}, [filteredListings, user]);

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
						Scanning Regional Waste Streams...
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
							<IconMapSearch
								size={28}
								style={{ color: "var(--mantine-color-teal-6)" }}
							/>
							<Title order={1} style={{ fontSize: "28px", fontWeight: 800 }}>
								Marketplace Feed
							</Title>
						</Group>
						<Text size="sm" c="dimmed">
							Discover and secure regional organic feedstock supply lines.
						</Text>
					</Stack>
				</Group>

				<Grid gap="lg">
					{/* Left Column: Feed & Filters */}
					<Grid.Col span={{ base: 12, lg: 5 }}>
						<Card p="md" mb="md">
							<Group gap="xs" mb="md">
								<IconFilter size={18} color="var(--doki-text-secondary)" />
								<Text fw={600} style={{ color: "var(--doki-text-primary)" }}>
									Sourcing Parameters
								</Text>
							</Group>

							<Stack gap="md">
								<Select
									label={
										<Text size="xs" c="dimmed">
											Feedstock Category
										</Text>
									}
									placeholder="All Categories"
									data={uniqueCategories}
									value={filterCategory}
									onChange={setFilterCategory}
									clearable
								/>

								<Box>
									<Group justify="space-between" mb={4}>
										<Text size="xs" c="dimmed">
											Minimum CPI %
										</Text>
										<Text size="xs" fw={700} color="teal">
											{minPurity}%
										</Text>
									</Group>
									<Slider
										value={minPurity}
										onChange={setMinPurity}
										min={0}
										max={100}
										color="teal"
									/>
								</Box>

								<Box>
									<Group justify="space-between" mb={4}>
										<Text size="xs" c="dimmed">
											Maximum RMC %
										</Text>
										<Text size="xs" fw={700} color="blue">
											{maxMoisture}%
										</Text>
									</Group>
									<Slider
										value={maxMoisture}
										onChange={setMaxMoisture}
										min={0}
										max={100}
										color="blue"
									/>
								</Box>

								<Box>
									<Group justify="space-between" mb={4}>
										<Text size="xs" c="dimmed">
											Proximity Radius (km)
										</Text>
										<Text size="xs" fw={700} color="grape">
											{maxDistance} km
										</Text>
									</Group>
									<Slider
										value={maxDistance}
										onChange={setMaxDistance}
										min={5}
										max={500}
										color="grape"
									/>
								</Box>
							</Stack>
						</Card>

						<Title order={4} mb="md">
							Active Feedstock Listings
						</Title>
						<ScrollArea h={500} offsetScrollbars>
							<Stack gap="sm">
								{filteredListings.length === 0 ? (
									<Text size="sm" c="dimmed" ta="center" py="xl">
										No active listings match your parameters.
									</Text>
								) : (
									filteredListings.map((l) => {
										let distText = "";
										if (user?.latitude && user?.longitude) {
											distText = `${getDistance(user.latitude, user.longitude, l.seller.latitude, l.seller.longitude).toFixed(1)} km`;
										}

										return (
											<Card key={l.id} p="md">
												<Group
													justify="space-between"
													mb="xs"
													align="flex-start"
												>
													<Box>
														<Group gap="xs">
															<IconLeaf
																size={16}
																style={{ color: "var(--mantine-color-teal-6)" }}
															/>
															<Text fw={700}>{l.category.name}</Text>
														</Group>
														<Text size="xs" c="dimmed" mt={2}>
															{l.seller.name}
														</Text>
													</Box>
													<Badge color="teal" variant="light">
														{l.quantity} Kg
													</Badge>
												</Group>

												<Group gap="xl" mb="md">
													<Box>
														<Text size="xs" c="dimmed">
															CPI
														</Text>
														<Text
															size="sm"
															fw={600}
															color={l.purity < 75 ? "red" : "teal"}
														>
															{l.purity}%
														</Text>
													</Box>
													<Box>
														<Text size="xs" c="dimmed">
															RMC
														</Text>
														<Text size="sm" fw={600} color="blue">
															{l.moisture}%
														</Text>
													</Box>
													{distText && (
														<Box>
															<Text size="xs" c="dimmed">
																Distance
															</Text>
															<Text size="sm" fw={600} color="grape">
																{distText}
															</Text>
														</Box>
													)}
												</Group>

												<Button
													component={Link}
													href={`/buyer/listings/${l.id}`}
													fullWidth
													variant="light"
													color="teal"
													leftSection={<IconListDetails size={16} />}
												>
													Inspect Details
												</Button>
											</Card>
										);
									})
								)}
							</Stack>
						</ScrollArea>
					</Grid.Col>

					{/* Right Column: Map */}
					<Grid.Col span={{ base: 12, lg: 7 }}>
						<Card p="md" style={{ height: "100%", minHeight: 600 }}>
							<Title order={3} size="md" mb="sm">
								Regional Proximity Map
							</Title>
							<Text size="xs" c="dimmed" mb="md">
								Interactive view of organic waste generating facilities
								(Producers).
							</Text>
							<Box style={{ height: "calc(100% - 60px)", minHeight: 500 }}>
								<MapComponent pins={mapPins} />
							</Box>
						</Card>
					</Grid.Col>
				</Grid>
			</Container>
		</Box>
	);
}
