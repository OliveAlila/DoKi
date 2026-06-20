"use client";

import {
	AppShell,
	AppShellHeader,
	AppShellMain,
	Burger,
	Group,
	Text,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLeaf } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BuyerNavbar } from "./BuyerNavbar";

const BuyerAppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
	const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure(false);

	const isExpanded = !desktopCollapsed;

	return (
		<AppShell
			padding={{ base: "md", sm: "xl" }}
			header={{ height: { base: 60, md: 64 } }}
			navbar={{
				width: { base: 280, sm: isExpanded ? 280 : 80 },
				breakpoint: "sm",
				collapsed: {
					mobile: !mobileOpened,
					desktop: false,
				},
			}}
			style={{
				transition: "all 200ms ease-in-out",
				backgroundColor: "var(--mantine-color-body)",
				color: "var(--mantine-color-text)",
			}}
		>
			<AppShellHeader
				style={{
					backgroundColor: "var(--doki-surface-color)",
					borderBottom: "1px solid var(--doki-border-color)",
				}}
			>
				<Group h="100%" px="md" justify="space-between">
					<Group>
						{/* Mobile Burger */}
						<Burger
							opened={mobileOpened}
							onClick={toggleMobile}
							hiddenFrom="sm"
							size="sm"
							color="gray"
						/>
						{/* Desktop Burger */}
						<Burger
							opened={!desktopCollapsed}
							onClick={toggleDesktop}
							visibleFrom="sm"
							size="sm"
							color="gray"
						/>
						<Link
							href="/buyer"
							style={{
								display: "flex",
								alignItems: "center",
								textDecoration: "none",
								gap: "8px",
							}}
						>
							<IconLeaf
								size={28}
								style={{ color: "var(--mantine-color-emerald-6)" }}
							/>
							<Title
								order={3}
								style={{
									fontWeight: 800,
									color: "var(--mantine-color-text)",
									margin: 0,
								}}
							>
								Doki{" "}
								<Text
									span
									inherit
									style={{ color: "var(--mantine-color-emerald-6)" }}
								>
									Procurement
								</Text>
							</Title>
						</Link>
					</Group>
				</Group>
			</AppShellHeader>

			<BuyerNavbar
				isExpanded={isExpanded}
				mobileOpened={mobileOpened}
				toggleMobile={toggleMobile}
			/>

			<AppShellMain
				style={{
					transition: "padding-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
					backgroundColor: "var(--mantine-color-body)",
					minHeight: "100vh",
				}}
			>
				{children}
			</AppShellMain>
		</AppShell>
	);
};

export default BuyerAppShell;
