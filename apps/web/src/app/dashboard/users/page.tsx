"use client";
"use no memo";

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
	Title,
} from "@mantine/core";
import {
	IconBan,
	IconBuildingFactory,
	IconUserExclamation,
	IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
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

const sellerColumnHelper = createColumnHelper<SellerWithListings>();

const sellerColumns = [
	sellerColumnHelper.accessor("id", {
		header: "Enterprise ID",
		cell: (info) => (
			<Text
				style={{
					fontFamily: "monospace",
					color: "var(--mantine-color-emerald-6)",
				}}
			>
				E-SEL-{info.getValue().toString().padStart(4, "0")}
			</Text>
		),
	}),
	sellerColumnHelper.accessor("name", {
		header: "Name",
		cell: (info) => <Text fw={600}>{info.getValue()}</Text>,
	}),
	sellerColumnHelper.display({
		id: "location",
		header: "Location",
		cell: (info) => {
			const { address, latitude, longitude } = info.row.original;
			return (
				<Box>
					<Text size="sm">{address}</Text>
					<Text size="xs" c="dimmed">
						{latitude.toFixed(4)}, {longitude.toFixed(4)}
					</Text>
				</Box>
			);
		},
	}),
	sellerColumnHelper.accessor((row) => row.listings.length, {
		id: "listings",
		header: "Active Listings",
		cell: (info) => (
			<Badge color="blue" variant="light">
				{info.getValue()} items
			</Badge>
		),
	}),
	sellerColumnHelper.display({
		id: "actions",
		header: () => <Text ta="right">Actions</Text>,
		cell: () => (
			<Group gap="xs" justify="flex-end">
				<Button size="xs" variant="light" color="blue">
					View Profile
				</Button>
				<ActionIcon variant="light" color="red" aria-label="Suspend">
					<IconBan size={16} />
				</ActionIcon>
			</Group>
		),
	}),
];

const buyerColumnHelper = createColumnHelper<Buyer>();

const buyerColumns = [
	buyerColumnHelper.accessor("id", {
		header: "Industrial ID",
		cell: (info) => (
			<Text
				style={{
					fontFamily: "monospace",
					color: "var(--mantine-color-blue-4)",
				}}
			>
				I-BUY-{info.getValue().toString().padStart(4, "0")}
			</Text>
		),
	}),
	buyerColumnHelper.accessor("name", {
		header: "Name",
		cell: (info) => <Text fw={600}>{info.getValue()}</Text>,
	}),
	buyerColumnHelper.display({
		id: "location",
		header: "Location",
		cell: (info) => {
			const { address, latitude, longitude } = info.row.original;
			return (
				<Box>
					<Text size="sm">{address}</Text>
					<Text size="xs" c="dimmed">
						{latitude.toFixed(4)}, {longitude.toFixed(4)}
					</Text>
				</Box>
			);
		},
	}),
	buyerColumnHelper.display({
		id: "actions",
		header: () => <Text ta="right">Actions</Text>,
		cell: () => (
			<Group gap="xs" justify="flex-end">
				<Button size="xs" variant="light" color="blue">
					Verify License
				</Button>
				<ActionIcon variant="light" color="red" aria-label="Suspend">
					<IconBan size={16} />
				</ActionIcon>
			</Group>
		),
	}),
];

export default function UserRegistryPage() {
	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsString.withDefault("sellers"),
	);

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

	const sellersTable = useReactTable({
		data: sellers,
		columns: sellerColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	const buyersTable = useReactTable({
		data: buyers,
		columns: buyerColumns,
		getCoreRowModel: getCoreRowModel(),
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

				<Card p="0" style={{ overflow: "hidden" }}>
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
									{sellersTable.getHeaderGroups().map((headerGroup) => (
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
									{sellersTable.getRowModel().rows.map((row) => (
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
						</Tabs.Panel>

						<Tabs.Panel value="buyers" p="md">
							<Table
								highlightOnHover
								verticalSpacing="sm"
								withTableBorder
								withColumnBorders
							>
								<TableThead>
									{buyersTable.getHeaderGroups().map((headerGroup) => (
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
									{buyersTable.getRowModel().rows.map((row) => (
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
						</Tabs.Panel>
					</Tabs>
				</Card>
			</Container>
		</Box>
	);
}
