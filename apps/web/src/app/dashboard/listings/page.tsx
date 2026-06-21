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
import {
	IconAlertTriangle,
	IconSettings,
	IconShieldCheck,
	IconTrash,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
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

const columnHelper = createColumnHelper<ListingWithCategory>();

const columns = [
	columnHelper.accessor("id", {
		header: "Listing ID",
		cell: (info) => (
			<Text
				style={{
					fontFamily: "monospace",
					color: "var(--mantine-color-emerald-6)",
				}}
			>
				LST-{info.getValue().toString().padStart(5, "0")}
			</Text>
		),
	}),
	columnHelper.accessor((row) => row.seller, {
		id: "seller",
		header: "Producer (Organic Waste Generator)",
		cell: (info) => (
			<Box>
				<Text size="sm" fw={600}>
					{info.getValue().name}
				</Text>
				<Text size="xs" c="dimmed">
					{info.getValue().address}
				</Text>
			</Box>
		),
	}),
	columnHelper.accessor((row) => row.category.name, {
		id: "category",
		header: "Category",
		cell: (info) => (
			<Badge color="blue" variant="light">
				{info.getValue()}
			</Badge>
		),
	}),
	columnHelper.display({
		id: "metrics",
		header: "Metrics",
		cell: (info) => {
			const { purity, moisture } = info.row.original;
			return (
				<Box>
					<Group gap="xs" mb={4}>
						<Text size="xs" w={50}>
							CPI:
						</Text>
						<Progress
							value={purity}
							color={purity < 75 ? "red" : "emerald"}
							size="sm"
							w={60}
						/>
						<Text size="xs" fw={700} c={purity < 75 ? "red.4" : "emerald.6"}>
							{purity}%
						</Text>
					</Group>
					<Group gap="xs">
						<Text size="xs" w={50}>
							RMC:
						</Text>
						<Progress value={moisture} color="blue" size="sm" w={60} />
						<Text size="xs" fw={700} c="blue.4">
							{moisture}%
						</Text>
					</Group>
				</Box>
			);
		},
	}),
	columnHelper.display({
		id: "status",
		header: "AI Flag",
		cell: (info) => {
			const { purity, status } = info.row.original;
			const needsReview = purity < 75 || status === "PENDING_REVIEW";
			return needsReview ? (
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
			);
		},
	}),
	columnHelper.display({
		id: "actions",
		header: () => <Text ta="right">Operator Action</Text>,
		cell: () => (
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
		),
	}),
];

export default function MarketplaceModerationPage() {
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

	const table = useReactTable({
		data: allListings,
		columns,
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

				<Card p="md">
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
