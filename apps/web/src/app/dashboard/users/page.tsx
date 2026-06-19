"use client";

import { getApiUrl } from "@/utils/network";
import { useQuery } from "@tanstack/react-query";
import { Box, Card, Container, Group, Stack, Table, Text, Title, Badge, Tabs, Loader, Button, ActionIcon } from "@mantine/core";
import { IconUsers, IconBuildingFactory, IconUserExclamation, IconBan } from "@tabler/icons-react";
import React from "react";

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

export default function UserRegistryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['usersRegistry'],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/v1/listings`, { credentials: 'include' });
      return res.json();
    },
  });

  const sellers: SellerWithListings[] = data?.sellers || [];
  const buyers: Buyer[] = data?.buyers || [];

  if (isLoading) {
    return (
      <Container fluid style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0f19' }}>
        <Stack align="center" gap="md">
          <Loader color="green" size="lg" type="dots" />
          <Text color="gray.5" size="sm">Loading User Registry...</Text>
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
              <IconUsers size={28} color="#22c55e" />
              <Title order={1} style={{ fontSize: "28px", fontWeight: 800, color: "#f3f4f6" }}>
                User & <Text span inherit color="#22c55e">Facility Registry</Text>
              </Title>
            </Group>
            <Text size="sm" color="gray.5">
              Platform Membership & Operational Compliance Management
            </Text>
          </Stack>
        </Group>

        <Card p="0" radius="lg" style={{ backgroundColor: "#111827", border: "1px solid #1f2937", overflow: 'hidden' }}>
          <Tabs defaultValue="sellers" color="green" variant="outline">
            <Tabs.List style={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}>
              <Tabs.Tab value="sellers" leftSection={<IconUserExclamation size={16} />} style={{ color: '#f3f4f6', fontWeight: 600 }}>
                Producers (Organic Waste Generators)
              </Tabs.Tab>
              <Tabs.Tab value="buyers" leftSection={<IconBuildingFactory size={16} />} style={{ color: '#f3f4f6', fontWeight: 600 }}>
                Offtakers (Industrial Circular Consumers)
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="sellers" p="md">
              <Table highlightOnHover verticalSpacing="sm" style={{ color: "#e5e7eb" }}>
                <Table.Thead style={{ borderBottom: "1.5px solid #1f2937" }}>
                  <Table.Tr>
                    <Table.Th style={{ color: "#9ca3af" }}>Enterprise ID</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Name</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Location</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Active Listings</Table.Th>
                    <Table.Th style={{ color: "#9ca3af", textAlign: "right" }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sellers.map((s) => (
                    <Table.Tr key={`seller-${s.id}`} style={{ borderBottom: "1px solid #1f2937" }}>
                      <Table.Td style={{ fontFamily: 'monospace', color: '#6ee7b7' }}>E-SEL-{s.id.toString().padStart(4, '0')}</Table.Td>
                      <Table.Td fw={600}>{s.name}</Table.Td>
                      <Table.Td>
                        <Text size="sm">{s.address}</Text>
                        <Text size="xs" color="gray.5">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="blue" variant="light">{s.listings.length} items</Badge>
                      </Table.Td>
                      <Table.Td align="right">
                        <Group gap="xs" justify="flex-end">
                          <Button size="xs" variant="light" color="blue">View Profile</Button>
                          <ActionIcon variant="light" color="red" aria-label="Suspend">
                            <IconBan size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

            <Tabs.Panel value="buyers" p="md">
              <Table highlightOnHover verticalSpacing="sm" style={{ color: "#e5e7eb" }}>
                <Table.Thead style={{ borderBottom: "1.5px solid #1f2937" }}>
                  <Table.Tr>
                    <Table.Th style={{ color: "#9ca3af" }}>Industrial ID</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Name</Table.Th>
                    <Table.Th style={{ color: "#9ca3af" }}>Location</Table.Th>
                    <Table.Th style={{ color: "#9ca3af", textAlign: "right" }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {buyers.map((b) => (
                    <Table.Tr key={`buyer-${b.id}`} style={{ borderBottom: "1px solid #1f2937" }}>
                      <Table.Td style={{ fontFamily: 'monospace', color: '#93c5fd' }}>I-BUY-{b.id.toString().padStart(4, '0')}</Table.Td>
                      <Table.Td fw={600}>{b.name}</Table.Td>
                      <Table.Td>
                        <Text size="sm">{b.address}</Text>
                        <Text size="xs" color="gray.5">{b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}</Text>
                      </Table.Td>
                      <Table.Td align="right">
                        <Group gap="xs" justify="flex-end">
                          <Button size="xs" variant="light" color="blue">Verify License</Button>
                          <ActionIcon variant="light" color="red" aria-label="Suspend">
                            <IconBan size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Container>
    </Box>
  );
}
