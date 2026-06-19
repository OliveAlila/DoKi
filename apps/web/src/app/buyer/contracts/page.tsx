"use client";

import { getApiUrl } from "@/utils/network";
import { useQuery } from "@tanstack/react-query";
import { Box, Card, Container, Group, Stack, Table, Text, Title, Badge, Tabs, Loader, Button, PasswordInput, Modal } from "@mantine/core";
import { IconFileInvoice, IconTruckDelivery, IconChecklist, IconClock, IconCheck } from "@tabler/icons-react";
import React, { useState } from "react";

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

export default function ContractsPage() {
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [otp, setOtp] = useState("");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['buyerContracts'],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/v1/buyer/transactions`, { credentials: 'include' });
      return res.json();
    },
  });

  // Since our backend Transaction model doesn't explicitly track PENDING/IN_TRANSIT/COMPLETED,
  // we will artificially partition the fetched transactions based on recency for demonstration.
  // In a real app, Transaction would have a `status` enum.
  const now = new Date().getTime();
  const pendingMatches = transactions.filter(t => (now - new Date(t.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 1); // < 1 day
  const inTransit = transactions.filter(t => {
    const age = now - new Date(t.createdAt).getTime();
    return age >= 1000 * 60 * 60 * 24 * 1 && age < 1000 * 60 * 60 * 24 * 3; // 1-3 days
  });
  const completed = transactions.filter(t => (now - new Date(t.createdAt).getTime()) >= 1000 * 60 * 60 * 24 * 3); // > 3 days

  const handleCheckout = (t: Transaction) => {
    setActiveTransaction(t);
    setOtpModalOpen(true);
  };

  const confirmDelivery = () => {
    // Simulate successful confirmation
    setOtpModalOpen(false);
    setOtp("");
    alert("Transaction completed successfully! ESG metrics recorded.");
  };

  if (isLoading) {
    return (
      <Container fluid style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <Stack align="center" gap="md">
          <Loader color="teal" size="lg" type="dots" />
          <Text color="slate.4" size="sm">Loading Procurement Ledger...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Box style={{ backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh" }} py={30}>
      <Container size="xl">
        <Group justify="space-between" mb={30}>
          <Stack gap={4}>
            <Group gap="xs">
              <IconFileInvoice size={28} color="#0d9488" />
              <Title order={1} style={{ fontSize: "28px", fontWeight: 800, color: "#f8fafc" }}>
                Procurement <Text span inherit color="#0d9488">Contract Manager</Text>
              </Title>
            </Group>
            <Text size="sm" color="slate.4">
              Active feedstock acquisition pipelines and logistics tracker
            </Text>
          </Stack>
        </Group>

        <Card p="0" radius="lg" style={{ backgroundColor: "#1e293b", border: "1px solid #334155", overflow: 'hidden' }}>
          <Tabs defaultValue="transit" color="teal" variant="outline">
            <Tabs.List style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
              <Tabs.Tab value="pending" leftSection={<IconClock size={16} />} style={{ color: '#f8fafc', fontWeight: 600 }}>
                Pending Matches ({pendingMatches.length})
              </Tabs.Tab>
              <Tabs.Tab value="transit" leftSection={<IconTruckDelivery size={16} />} style={{ color: '#f8fafc', fontWeight: 600 }}>
                In Transit Logistics ({inTransit.length})
              </Tabs.Tab>
              <Tabs.Tab value="completed" leftSection={<IconChecklist size={16} />} style={{ color: '#f8fafc', fontWeight: 600 }}>
                Completed Transactions ({completed.length})
              </Tabs.Tab>
            </Tabs.List>

            {/* In Transit Tab */}
            <Tabs.Panel value="transit" p="md">
              {inTransit.length === 0 ? (
                <Text size="sm" color="slate.4" ta="center" py="xl">No active logistics at the moment.</Text>
              ) : (
                <Table highlightOnHover verticalSpacing="sm" style={{ color: "#e2e8f0" }}>
                  <Table.Thead style={{ borderBottom: "1.5px solid #334155" }}>
                    <Table.Tr>
                      <Table.Th style={{ color: "#94a3b8" }}>Order ID</Table.Th>
                      <Table.Th style={{ color: "#94a3b8" }}>Material</Table.Th>
                      <Table.Th style={{ color: "#94a3b8" }}>Generator Details</Table.Th>
                      <Table.Th style={{ color: "#94a3b8" }}>Pick-up Address</Table.Th>
                      <Table.Th style={{ color: "#94a3b8", textAlign: "right" }}>Logistics Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {inTransit.map(t => (
                      <Table.Tr key={t.id} style={{ borderBottom: "1px solid #334155" }}>
                        <Table.Td style={{ fontFamily: 'monospace', color: '#5eead4' }}>TRX-{t.id.toString().padStart(5, '0')}</Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600}>{t.category.name}</Text>
                          <Text size="xs" color="slate.4">{t.quantity} Kg • CPI: {t.purity}%</Text>
                        </Table.Td>
                        <Table.Td fw={500}>{t.seller.name}</Table.Td>
                        <Table.Td>
                          <Text size="sm" w={250} truncate>{t.seller.address}</Text>
                        </Table.Td>
                        <Table.Td align="right">
                          <Button size="xs" color="teal" leftSection={<IconCheck size={14} />} onClick={() => handleCheckout(t)}>
                            Confirm Arrival
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Tabs.Panel>

            {/* Pending Matches Tab */}
            <Tabs.Panel value="pending" p="md">
              {pendingMatches.length === 0 ? (
                <Text size="sm" color="slate.4" ta="center" py="xl">No pending matches.</Text>
              ) : (
                <Table highlightOnHover verticalSpacing="sm" style={{ color: "#e2e8f0" }}>
                  <Table.Thead style={{ borderBottom: "1.5px solid #334155" }}>
                    <Table.Tr>
                      <Table.Th style={{ color: "#94a3b8" }}>Order ID</Table.Th>
                      <Table.Th style={{ color: "#94a3b8" }}>Material</Table.Th>
                      <Table.Th style={{ color: "#94a3b8" }}>Generator Details</Table.Th>
                      <Table.Th style={{ color: "#94a3b8" }}>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {pendingMatches.map(t => (
                      <Table.Tr key={t.id} style={{ borderBottom: "1px solid #334155" }}>
                        <Table.Td style={{ fontFamily: 'monospace', color: '#5eead4' }}>TRX-{t.id.toString().padStart(5, '0')}</Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600}>{t.category.name}</Text>
                          <Text size="xs" color="slate.4">{t.quantity} Kg</Text>
                        </Table.Td>
                        <Table.Td fw={500}>{t.seller.name}</Table.Td>
                        <Table.Td>
                          <Badge color="blue" variant="light">Awaiting Dispatch</Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Tabs.Panel>

            {/* Completed Transactions Tab */}
            <Tabs.Panel value="completed" p="md">
              <Table highlightOnHover verticalSpacing="sm" style={{ color: "#e2e8f0" }}>
                <Table.Thead style={{ borderBottom: "1.5px solid #334155" }}>
                  <Table.Tr>
                    <Table.Th style={{ color: "#94a3b8" }}>Order ID</Table.Th>
                    <Table.Th style={{ color: "#94a3b8" }}>Date Settled</Table.Th>
                    <Table.Th style={{ color: "#94a3b8" }}>Material</Table.Th>
                    <Table.Th style={{ color: "#94a3b8" }}>Total Weight</Table.Th>
                    <Table.Th style={{ color: "#94a3b8" }}>Abatement Impact</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {completed.map(t => {
                    const d = new Date(t.createdAt);
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    return (
                      <Table.Tr key={t.id} style={{ borderBottom: "1px solid #334155" }}>
                        <Table.Td style={{ fontFamily: 'monospace', color: '#5eead4' }}>TRX-{t.id.toString().padStart(5, '0')}</Table.Td>
                        <Table.Td>{dateStr}</Table.Td>
                        <Table.Td fw={600}>{t.category.name}</Table.Td>
                        <Table.Td>{t.quantity} Kg</Table.Td>
                        <Table.Td>
                          <Text size="sm" color="teal.4" fw={700}>+{t.co2eReduced} MTCO2e</Text>
                        </Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

          </Tabs>
        </Card>
      </Container>

      {/* OTP Checkout Modal */}
      <Modal
        opened={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        title={<Title order={3} style={{ color: "#f8fafc" }}>Confirm Delivery Check-Out</Title>}
        centered
        styles={{
          content: { backgroundColor: '#1e293b', border: '1px solid #334155' },
          header: { backgroundColor: '#1e293b' },
          title: { color: '#f8fafc' },
          close: { color: '#94a3b8', '&:hover': { backgroundColor: '#334155' } }
        }}
      >
        {activeTransaction && (
          <Stack gap="md">
            <Text size="sm" color="slate.3">
              To securely close logistics for <strong>TRX-{activeTransaction.id.toString().padStart(5, '0')}</strong> from <strong>{activeTransaction.seller.name}</strong>, please input the generator&apos;s secure 6-digit release OTP.
            </Text>
            <PasswordInput
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.currentTarget.value)}
              size="md"
              radius="md"
              styles={{
                input: { backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }
              }}
            />
            <Button color="teal" size="md" fullWidth onClick={confirmDelivery} disabled={otp.length < 6}>
              Verify & Complete Transaction
            </Button>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
