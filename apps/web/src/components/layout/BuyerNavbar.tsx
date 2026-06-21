import { AppShellNavbar, Button, NavLink, Stack, Tooltip } from "@mantine/core";
import {
	IconChartBar,
	IconFileInvoice,
	IconLogout,
	IconMapSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
	{
		label: "Marketplace Feed",
		to: "/buyer",
		leftSection: <IconMapSearch size={20} />,
	},
	{
		label: "Contracts",
		to: "/buyer/contracts",
		leftSection: <IconFileInvoice size={20} />,
	},
	{
		label: "ESG Scorecard",
		to: "/buyer/impact",
		leftSection: <IconChartBar size={20} />,
	},
] as const;

interface BuyerNavbarProps {
	isExpanded: boolean;
	mobileOpened: boolean;
	toggleMobile: () => void;
}

export const BuyerNavbar = ({
	isExpanded,
	mobileOpened,
	toggleMobile,
}: BuyerNavbarProps) => {
	const pathname = usePathname();
	const { signOut } = useAuth();

	return (
		<AppShellNavbar
			p="md"
			style={{
				backgroundColor: "var(--doki-surface-color)",
				borderRight: "1px solid var(--doki-border-color)",
				overflow: "hidden",
				whiteSpace: "nowrap",
				transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
			}}
		>
			<Stack justify="space-between" h="100%">
				<Stack gap="xs">
					{NAV_LINKS.map(({ to, label, leftSection }) => {
						const isActive =
							pathname === to || (to !== "/buyer" && pathname.startsWith(to));

						const navLinkItem = (
							<NavLink
								key={to}
								component={Link}
								href={to}
								label={isExpanded ? label : null}
								leftSection={leftSection}
								active={isActive}
								onClick={() => {
									if (mobileOpened) toggleMobile();
								}}
								fw={600}
								color="emerald"
								variant="subtle"
								styles={{
									root: {
										borderRadius: "8px",
										height: "44px",
										display: "flex",
										alignItems: "center",
										justifyContent: isExpanded ? "flex-start" : "center",
										padding: isExpanded ? "0 12px" : "0",
										transition: "padding 0.15s ease",
										backgroundColor: isActive
											? "var(--mantine-primary-color-filled)"
											: "transparent",
										color: isActive
											? "#FFFFFF"
											: "var(--doki-text-secondary)",
									},
									section: {
										margin: isExpanded ? "0 12px 0 0" : "0",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: isActive
											? "#FFFFFF"
											: "var(--doki-text-secondary)",
									},
									body: {
										display: isExpanded ? "block" : "none",
									},
								}}
							/>
						);

						return isExpanded ? (
							navLinkItem
						) : (
							<Tooltip
								key={to}
								label={label}
								position="right"
								withArrow
								offset={15}
								events={{ hover: true, focus: true, touch: false }}
							>
								{navLinkItem}
							</Tooltip>
						);
					})}
				</Stack>

				<Stack gap="xs">
					{isExpanded ? (
						<Button
							variant="subtle"
							color="red"
							fullWidth
							leftSection={<IconLogout size={20} />}
							onClick={signOut}
							justify="flex-start"
							styles={{
								root: {
									height: "44px",
									borderRadius: "8px",
									padding: "0 12px",
								},
							}}
						>
							Sign Out
						</Button>
					) : (
						<Tooltip
							label="Sign Out"
							position="right"
							withArrow
							offset={15}
							events={{ hover: true, focus: true, touch: false }}
						>
							<Button
								variant="subtle"
								color="red"
								fullWidth
								px={0}
								onClick={signOut}
								styles={{
									root: {
										height: "44px",
										borderRadius: "8px",
										display: "flex",
										justifyContent: "center",
									},
									section: {
										margin: 0,
									},
								}}
							>
								<IconLogout size={20} />
							</Button>
						</Tooltip>
					)}
				</Stack>
			</Stack>
		</AppShellNavbar>
	);
};
