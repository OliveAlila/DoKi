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
import { BuyerNavbar } from "./BuyerNavbar";
import { IconLeaf } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

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
        backgroundColor: '#0f172a',
        color: '#f8fafc',
      }}
    >
      <AppShellHeader
        style={{
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
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
              color="#94a3b8"
            />
            {/* Desktop Burger */}
            <Burger
              opened={!desktopCollapsed}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
              color="#94a3b8"
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
              <IconLeaf size={28} color="#0d9488" />
              <Title order={3} style={{ fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Doki <Text span inherit color="#0d9488">Procurement</Text>
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
          backgroundColor: '#0f172a',
          minHeight: '100vh',
        }}
      >
        {children}
      </AppShellMain>
    </AppShell>
  );
};

export default BuyerAppShell;
