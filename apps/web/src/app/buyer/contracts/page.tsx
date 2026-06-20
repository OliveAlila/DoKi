"use client";

import {
	Badge,
	Box,
	Button,
	Card,
	Container,
	Group,
	Loader,
	Modal,
	PasswordInput,
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
import { notifications } from "@mantine/notifications";
import {
	IconCheck,
	IconChecklist,
	IconClock,
	IconFileInvoice,
	IconTruckDelivery,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	type Table as ReactTable,
	useReactTable,
} from "@tanstack/react-table";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { getApiUrl } from "@/utils/network";

type Transaction = {
	id: number;
	sellerId: number;
	buyerId: number;
	categoryId: number;
	quantity: number;
	moisture: number;
	purity: number;
	methaneAvoided: number;
	co2eReduced: number;
	createdAt: string;
	category: { name: string };
	seller: { name: string; address: string };
};

const columnHelper = createColumnHelper<Transaction>();

export default function ContractsPage() {
	const [otpModalOpen, setOtpModalOpen] = useState(false);
	const [activeTransaction, setActiveTransaction] =
		useState<Transaction | null>(null);
	const [otp, setOtp] = useState("");

	const [activeTab, setActiveTab] = useQueryState(
		"tab",
		parseAsString.withDefault("transit"),
	);

	const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
		queryKey: ["buyerContracts"],
		queryFn: async () => {
			const res = await fetch(`${getApiUrl()}/api/v1/buyer/transactions`, {
				credentials: "include",
			});
			return res.json();
		},
	});

	const now = Date.now();
	const pendingMatches = transactions.filter(
		(t) => now - new Date(t.createdAt).getTime() < 1000 * 60 * 60 * 24 * 1,
	); // < 1 day
	const inTransit = transactions.filter((t) => {
		const age = now - new Date(t.createdAt).getTime();
		return age >= 1000 * 60 * 60 * 24 * 1 && age < 1000 * 60 * 60 * 24 * 3; // 1-3 days
	});
	const completed = transactions.filter(
		(t) => now - new Date(t.createdAt).getTime() >= 1000 * 60 * 60 * 24 * 3,
	); // > 3 days

	const handleCheckout = (t: Transaction) => {
		setActiveTransaction(t);
		setOtpModalOpen(true);
	};

	const confirmDelivery = () => {
		setOtpModalOpen(false);
		setOtp("");
		notifications.show({
			title: "Transaction Completed",
			message: "ESG metrics recorded.",
			color: "emerald",
		});
	};

	const commonIdColumn = columnHelper.accessor("id", {
		header: "Order ID",
		cell: (info) => (
			<Text
				style={{
					fontFamily: "monospace",
					color: "var(--mantine-color-emerald-6)",
				}}
			>
				TRX-{info.getValue().toString().padStart(5, "0")}
			</Text>
		),
	});

	const inTransitColumns = [
		commonIdColumn,
		columnHelper.display({
			id: "material",
			header: "Material",
			cell: (info) => {
				const t = info.row.original;
				return (
					<Box>
						<Text size="sm" fw={600}>
							{t.category.name}
						</Text>
						<Text size="xs" c="dimmed">
							{t.quantity} Kg • CPI: {t.purity}%
						</Text>
					</Box>
				);
			},
		}),
		columnHelper.accessor((row) => row.seller.name, {
			id: "generatorDetails",
			header: "Generator Details",
			cell: (info) => <Text fw={500}>{info.getValue()}</Text>,
		}),
		columnHelper.accessor((row) => row.seller.address, {
			id: "pickupAddress",
			header: "Pick-up Address",
			cell: (info) => (
				<Text size="sm" w={250} truncate>
					{info.getValue()}
				</Text>
			),
		}),
		columnHelper.display({
			id: "actions",
			header: () => <Text ta="right">Logistics Action</Text>,
			cell: (info) => (
				<Group justify="flex-end">
					<Button
						size="xs"
						color="emerald"
						leftSection={<IconCheck size={14} />}
						onClick={() => handleCheckout(info.row.original)}
					>
						Confirm Arrival
					</Button>
				</Group>
			),
		}),
	];

	const pendingColumns = [
		commonIdColumn,
		columnHelper.display({
			id: "material",
			header: "Material",
			cell: (info) => {
				const t = info.row.original;
				return (
					<Box>
						<Text size="sm" fw={600}>
							{t.category.name}
						</Text>
						<Text size="xs" c="dimmed">
							{t.quantity} Kg
						</Text>
					</Box>
				);
			},
		}),
		columnHelper.accessor((row) => row.seller.name, {
			id: "generatorDetails",
			header: "Generator Details",
			cell: (info) => <Text fw={500}>{info.getValue()}</Text>,
		}),
		columnHelper.display({
			id: "status",
			header: "Status",
			cell: () => (
				<Badge color="blue" variant="light">
					Awaiting Dispatch
				</Badge>
			),
		}),
	];

	const completedColumns = [
		commonIdColumn,
		columnHelper.accessor("createdAt", {
			header: "Date Settled",
			cell: (info) => {
				const d = new Date(info.getValue());
				return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
			},
		}),
		columnHelper.accessor((row) => row.category.name, {
			id: "material",
			header: "Material",
			cell: (info) => <Text fw={600}>{info.getValue()}</Text>,
		}),
		columnHelper.accessor("quantity", {
			header: "Total Weight",
			cell: (info) => `${info.getValue()} Kg`,
		}),
		columnHelper.accessor("co2eReduced", {
			header: "Abatement Impact",
			cell: (info) => (
				<Text size="sm" c="emerald" fw={700}>
					+{info.getValue()} MTCO2e
				</Text>
			),
		}),
	];

	const inTransitTable = useReactTable({
		data: inTransit,
		columns: inTransitColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	const pendingTable = useReactTable({
		data: pendingMatches,
		columns: pendingColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	const completedTable = useReactTable({
		data: completed,
		columns: completedColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	const renderTable = <TData,>(tableInstance: ReactTable<TData>) => (
		<Table
			highlightOnHover
			verticalSpacing="sm"
			withTableBorder
			withColumnBorders
		>
			<TableThead>
				{tableInstance.getHeaderGroups().map((headerGroup) => (
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
				{tableInstance.getRowModel().rows.map((row) => (
					<TableTr key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<TableTd key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableTd>
						))}
					</TableTr>
				))}
			</TableTbody>
		</Table>
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
						Loading Procurement Ledger...
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
							<IconFileInvoice
								size={28}
								style={{ color: "var(--mantine-color-emerald-6)" }}
							/>
							<Title order={1} style={{ fontSize: "28px", fontWeight: 800 }}>
								Procurement Contract Manager
							</Title>
						</Group>
						<Text size="sm" c="dimmed">
							Active feedstock acquisition pipelines and logistics tracker
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
								value="pending"
								leftSection={<IconClock size={16} />}
								style={{ fontWeight: 600 }}
							>
								Pending Matches ({pendingMatches.length})
							</Tabs.Tab>
							<Tabs.Tab
								value="transit"
								leftSection={<IconTruckDelivery size={16} />}
								style={{ fontWeight: 600 }}
							>
								In Transit Logistics ({inTransit.length})
							</Tabs.Tab>
							<Tabs.Tab
								value="completed"
								leftSection={<IconChecklist size={16} />}
								style={{ fontWeight: 600 }}
							>
								Completed Transactions ({completed.length})
							</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value="transit" p="md">
							{inTransit.length === 0 ? (
								<Text size="sm" c="dimmed" ta="center" py="xl">
									No active logistics tracked within the last 3 days.
								</Text>
							) : (
								renderTable(inTransitTable)
							)}
						</Tabs.Panel>

						<Tabs.Panel value="pending" p="md">
							{pendingMatches.length === 0 ? (
								<Text size="sm" c="dimmed" ta="center" py="xl">
									No pending dispatch requests within the last 24 hours.
								</Text>
							) : (
								renderTable(pendingTable)
							)}
						</Tabs.Panel>

						<Tabs.Panel value="completed" p="md">
							{completed.length === 0 ? (
								<Text size="sm" c="dimmed" ta="center" py="xl">
									No completed transactions yet.
								</Text>
							) : (
								renderTable(completedTable)
							)}
						</Tabs.Panel>
					</Tabs>
				</Card>
			</Container>

			{/* OTP Checkout Modal */}
			<Modal
				opened={otpModalOpen}
				onClose={() => setOtpModalOpen(false)}
				title={<Title order={3}>Confirm Delivery Check-Out</Title>}
				centered
			>
				{activeTransaction && (
					<Stack gap="md">
						<Text size="sm" c="dimmed">
							To securely close logistics for{" "}
							<strong>
								TRX-{activeTransaction.id.toString().padStart(5, "0")}
							</strong>{" "}
							from <strong>{activeTransaction.seller.name}</strong>, please
							input the generator release OTP.
						</Text>
						<PasswordInput
							placeholder="000000"
							value={otp}
							onChange={(e) => setOtp(e.currentTarget.value)}
							size="md"
							radius="md"
						/>
						<Button
							color="emerald"
							size="md"
							fullWidth
							onClick={confirmDelivery}
							disabled={otp.length < 6}
						>
							Verify & Complete Transaction
						</Button>
					</Stack>
				)}
			</Modal>
		</Box>
	);
}
