"use client";

import { getApiUrl } from "@/utils/network";
import { useQuery } from "@tanstack/react-query";
import { Box, Card, Container, Group, Stack, Table, Text, Title, Badge, Loader, Button, ActionIcon, Progress } from "@mantine/core";
import { IconShieldCheck, IconAlertTriangle, IconSettings, IconTrash } from "@tabler/icons-react";
import React from "react";

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
  listings: Omit<ListingWithCategory, 'seller'>[];
};

export default function MarketplaceModerationPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['listingsModeration'],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/v1/listings`, { credentials: 'include' });
      return res.json();
    },
  });

  const sellers: SellerWithListings[] = data?.sellers || [];
  const allListings: ListingWithCategory[] = sellers.flatMap(seller => 
    seller.listings.map(l => ({ ...l, seller: { name: seller.name, address: seller.address } }))
  );

  if (isLoading) {
    return (
      <Container fluid style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19' }}>
        <Stack align="center" gap="md">
          <Loader color="green" size="lg" type="dots" />
          <Text color="gray.5" size="sm">Loading Moderation Desk...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Box style={{ backgroundColor: "#0b0f19", color: "#f3f4f6", minHeight: "100vh" }} py={30}>
      <Container size="xl">
        <Group justify="space-between" mb={30}>
          <Stack gap={4}>
            <Group gap="xs">
              <IconShieldCheck size={28} color="#22c55e" />
              <Title order={1} style={{ fontSize: "28px", fontWeight: 800, color: "#f3f4f6" }}>
                Marketplace <Text span inherit color="#22c55e">Moderation</Text>
              </Title>
            </Group>
            <Text size="sm" color="gray.5">
              Gemini 2.5 Flash Classification Verification Workstation
            </Text>
          </Stack>
        </Group>

        <Card p="md" radius="lg" style={{ backgroundColor: "#111827", border: "1px solid #1f2937" }}>
          <Table highlightOnHover verticalSpacing="sm" style={{ color: "#e5e7eb" }}>
            <Table.Thead style={{ borderBottom: "1.5px solid #1f2937" }}>
              <Table.Tr>
                <Table.Th style={{ color: "#9ca3af" }}>Listing ID</Table.Th>
                <Table.Th style={{ color: "#9ca3af" }}>Producer (Organic Waste Generator)</Table.Th>
                <Table.Th style={{ color: "#9ca3af" }}>Category</Table.Th>
                <Table.Th style={{ color: "#9ca3af" }}>Metrics</Table.Th>
                <Table.Th style={{ color: "#9ca3af" }}>AI Flag</Table.Th>
                <Table.Th style={{ color: "#9ca3af", textAlign: "right" }}>Operator Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allListings.map((l) => {
                const needsReview = l.purity < 75 || l.status === "PENDING_REVIEW";

                return (
                  <Table.Tr key={l.id} style={{ borderBottom: "1px solid #1f2937" }}>
                    <Table.Td style={{ fontFamily: 'monospace', color: '#a7f3d0' }}>LST-{l.id.toString().padStart(5, '0')}</Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>{l.seller.name}</Text>
                      <Text size="xs" color="gray.5">{l.seller.address}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">{l.category.name}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" mb={4}>
                        <Text size="xs" w={50}>CPI:</Text>
                        <Progress value={l.purity} color={l.purity < 75 ? "red" : "green"} size="sm" w={60} />
                        <Text size="xs" fw={700} color={l.purity < 75 ? "red.4" : "green.4"}>{l.purity}%</Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="xs" w={50}>RMC:</Text>
                        <Progress value={l.moisture} color="blue" size="sm" w={60} />
                        <Text size="xs" fw={700} color="blue.4">{l.moisture}%</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {needsReview ? (
                        <Badge color="red" variant="filled" leftSection={<IconAlertTriangle size={12} />}>
                          Flagged
                        </Badge>
                      ) : (
                        <Badge color="green" variant="light">Verified</Badge>
                      )}
                    </Table.Td>
                    <Table.Td align="right">
                      <Group gap="xs" justify="flex-end">
                        <Button size="xs" variant="light" color="yellow" leftSection={<IconSettings size={14} />}>
                          Adjust
                        </Button>
                        <ActionIcon variant="light" color="red" aria-label="Delete">
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Card>
      </Container>
    </Box>
  );
}
