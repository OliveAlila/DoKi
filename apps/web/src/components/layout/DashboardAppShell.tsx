"use client";

import {
  AppShell,
  AppShellMain,
  AppShellHeader,
  Burger,
  Group,
  Title,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DashboardNavbar } from "./DashboardNavbar";
import { IconLeaf } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

const DashboardAppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        backgroundColor: '#0b0f19',
        color: '#f3f4f6',
      }}
    >
      <AppShellHeader
        style={{
          backgroundColor: '#0b0f19',
          borderBottom: '1px solid #1f2937',
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
              color="#9ca3af"
            />
            {/* Desktop Burger */}
            <Burger
              opened={!desktopCollapsed}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
              color="#9ca3af"
            />
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                gap: "8px",
              }}
            >
              <IconLeaf size={28} color="#22c55e" />
              <Title order={3} style={{ fontWeight: 800, color: '#f3f4f6', margin: 0 }}>
                Doki <Text span inherit color="#22c55e">Console</Text>
              </Title>
            </Link>
          </Group>
        </Group>
      </AppShellHeader>

      <DashboardNavbar
        isExpanded={isExpanded}
        mobileOpened={mobileOpened}
        toggleMobile={toggleMobile}
      />

      <AppShellMain
        style={{
          transition: "padding-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: '#0b0f19',
          minHeight: '100vh',
        }}
      >
        {children}
      </AppShellMain>
    </AppShell>
  );
};

export default DashboardAppShell;
