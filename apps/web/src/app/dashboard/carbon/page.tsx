"use client";

import { Box, Card, Container, Grid, Group, Stack, Table, Text, Title, Badge, Progress } from "@mantine/core";
import { IconLeaf, IconTrendingUp } from "@tabler/icons-react";
import React from "react";

// Mock Data for Forecasting
const FORECAST_DATA = [
  { region: "Kiambu", currentVolume: "1,200 Tonnes", projectedAbatement: "245 MTCO2e", trend: "+12%" },
  { region: "Nakuru", currentVolume: "850 Tonnes", projectedAbatement: "180 MTCO2e", trend: "+8%" },
  { region: "Nairobi", currentVolume: "2,100 Tonnes", projectedAbatement: "410 MTCO2e", trend: "+15%" },
];

// Mock Data for DOC Monitors
const DOC_MONITORS = [
  { category: "Spent Grain", baselineDoc: 0.17, currentVariance: 0.165, progress: 85 },
  { category: "Coffee Pulp", baselineDoc: 0.15, currentVariance: 0.152, progress: 92 },
  { category: "Macadamia Shells", baselineDoc: 0.20, currentVariance: 0.195, progress: 78 },
];

export default function CarbonTracingPage() {
  return (
    <Box style={{ backgroundColor: "#0b0f19", color: "#f3f4f6", minHeight: "100vh" }} py={30}>
      <Container size="xl">
        <Group justify="space-between" mb={30}>
          <Stack gap={4}>
            <Group gap="xs">
              <IconLeaf size={28} color="#22c55e" />
              <Title order={1} style={{ fontSize: "28px", fontWeight: 800, color: "#f3f4f6" }}>
                Ecological <Text span inherit color="#22c55e">Tracing Ledger</Text>
              </Title>
            </Group>
            <Text size="sm" color="gray.5">
              IPCC Tier 1 Compliance Tracking & Methane Abatement Forecasting
            </Text>
          </Stack>
        </Group>

        <Grid gap="lg" mb={30}>
          <Grid.Col span={12}>
            <Title order={3} size="lg" mb="sm" style={{ color: "#f3f4f6", fontWeight: 700 }}>
              Degradable Organic Carbon (DOC) Monitors
            </Title>
            <Grid>
              {DOC_MONITORS.map((monitor, idx) => (
                <Grid.Col span={{ base: 12, md: 4 }} key={idx}>
                  <Card p="lg" radius="lg" style={{ backgroundColor: "#111827", border: "1px solid #1f2937" }}>
                    <Text size="sm" color="gray.5" fw={700} style={{ textTransform: "uppercase" }}>
                      {monitor.category}
                    </Text>
                    <Group justify="space-between" mt="md" mb="xs">
                      <Text size="sm">Baseline: {monitor.baselineDoc}</Text>
                      <Text size="sm" color={monitor.currentVariance > monitor.baselineDoc ? "red" : "green"}>
                        Current: {monitor.currentVariance}
                      </Text>
                    </Group>
                    <Progress value={monitor.progress} color="green" size="sm" radius="xl" />
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>
        </Grid>

        <Card p="md" radius="lg" style={{ backgroundColor: "#111827", border: "1px solid #1f2937" }}>
          <Group justify="space-between" mb="md">
            <Title order={3} size="lg" style={{ color: "#f3f4f6", fontWeight: 700 }}>
              Regional Abatement Forecasting
            </Title>
            <Badge color="blue" variant="light" leftSection={<IconTrendingUp size={14} />}>
              Next 30 Days
            </Badge>
          </Group>
          <Table highlightOnHover verticalSpacing="sm" style={{ color: "#e5e7eb" }}>
            <Table.Thead style={{ borderBottom: "1.5px solid #1f2937" }}>
              <Table.Tr>
                <Table.Th style={{ color: "#9ca3af" }}>Region</Table.Th>
                <Table.Th style={{ color: "#9ca3af" }}>Current Volume</Table.Th>
                <Table.Th style={{ color: "#9ca3af" }}>Projected Abatement</Table.Th>
                <Table.Th style={{ color: "#9ca3af" }}>Trend</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {FORECAST_DATA.map((data, idx) => (
                <Table.Tr key={idx} style={{ borderBottom: "1px solid #1f2937" }}>
                  <Table.Td fw={600}>{data.region}</Table.Td>
                  <Table.Td>{data.currentVolume}</Table.Td>
                  <Table.Td color="green.4">{data.projectedAbatement}</Table.Td>
                  <Table.Td>
                    <Badge color="green" variant="light">{data.trend}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Container>
    </Box>
  );
}
