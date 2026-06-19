'use client';

import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/network';
import {
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Container,
  Grid,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconDatabase,
  IconRecycle,
  IconReload
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Dynamically load the Map component to prevent window-undefined SSR errors in Next.js
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <Box
      h={400}
      w="100%"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
        color: '#9ca3af',
        borderRadius: '12px',
      }}
    >
      <Stack align="center" gap="sm">
        <Loader color="green" size="md" />
        <Text size="sm">Loading Geo-Spatial Proximity Map...</Text>
      </Stack>
    </Box>
  ),
});

// Dynamically load Recharts components to prevent SSR hydration mismatches
const SparklineChart = dynamic(
  () =>
    import('recharts').then((recharts) => {
      const { ResponsiveContainer, AreaChart, Area } = recharts;
      return function ChartComponent({ data }: { data: { name: string; value: number }[] }) {
        return (
          <Box h={50} w="100%" mt="sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        );
      };
    }),
  { ssr: false }
);

type Scorecard = {
  totalWasteDiverted: number;
  methaneAvoided: number;
  co2eReduced: number;
};

type AuditLog = {
  id: number;
  timestamp: string;
  action: string;
  operator: string;
  details: string;
};

type MapPin = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  type: 'seller' | 'buyer';
  details?: string;
};

type SparklineItem = {
  name: string;
  value: number;
};

type Category = {
  id: number;
  name: string;
  doc: number;
};

type ListingWithCategory = {
  id: number;
  sellerId: number;
  categoryId: number;
  quantity: number;
  moisture: number;
  purity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
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

export default function OperatorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Component States
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const { data: dashboardData, isLoading: loadingData, refetch, isRefetching: refreshing } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const statsRes = await fetch(`${getApiUrl()}/api/v1/dashboard/stats`, { credentials: 'include' });
      const statsData = await statsRes.json();

      const listingsRes = await fetch(`${getApiUrl()}/api/v1/listings`, { credentials: 'include' });
      const listingsData = await listingsRes.json();

      const logsRes = await fetch(`${getApiUrl()}/api/v1/transactions`, { credentials: 'include' });
      const logsData = await logsRes.json();

      const pins: MapPin[] = [];
      if (listingsRes.ok) {
        listingsData.sellers.forEach((s: SellerWithListings) => {
          const activeListingsText = s.listings.map((l: ListingWithCategory) => `${l.category.name} (${l.quantity} Kg)`).join(', ');
          pins.push({
            id: s.id,
            name: s.name,
            latitude: s.latitude,
            longitude: s.longitude,
            address: s.address,
            type: 'seller',
            details: activeListingsText ? `Active Listings: ${activeListingsText}` : 'No active listings currently',
          });
        });
        listingsData.buyers.forEach((b: Buyer) => {
          pins.push({
            id: b.id,
            name: b.name,
            latitude: b.latitude,
            longitude: b.longitude,
            address: b.address,
            type: 'buyer',
            details: 'Bioenergy & Compost Offtaker',
          });
        });
      }

      return {
        stats: statsRes.ok ? statsData : null,
        auditLogs: logsRes.ok ? logsData : [],
        mapPins: pins,
      };
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const stats: { scorecard: Scorecard; sparkline: SparklineItem[] } | null = dashboardData?.stats || null;
  const auditLogs: AuditLog[] = dashboardData?.auditLogs || [];
  const mapPins: MapPin[] = dashboardData?.mapPins || [];

  const fetchData = async () => {
    await refetch();
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Container
        fluid
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
        }}
      >
        <Stack align="center" gap="md">
          <Loader color="green" size="lg" type="dots" />
          <Text color="gray.5" size="sm">Loading Doki Operator Portal...</Text>
        </Stack>
      </Container>
    );
  }

  // Access Denied guard if user is loaded but not an ADMIN
  if (user.role !== 'ADMIN') {
    return (
      <Container
        fluid
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
        }}
      >
        <Card
          p="xl"
          radius="lg"
          style={{
            backgroundColor: '#111827',
            border: '1px solid #dc2626',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.2)',
          }}
        >
          <Stack align="center" gap="md">
            <ThemeIcon color="red" size="xl" radius="xl">
              <IconRecycle size={30} />
            </ThemeIcon>
            <Title order={2} style={{ color: '#f87171', fontWeight: 800 }}>
              Access Denied
            </Title>
            <Text color="gray.4" size="sm">
              The Operator Dashboard requires ADMIN clearance. Your account role is <strong>{user.role}</strong>.
            </Text>
            <Button variant="filled" color="green" onClick={() => router.push('/')}>
              Return to Homepage
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (loadingData) {
    return (
      <Container
        fluid
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
        }}
      >
        <Stack align="center" gap="md">
          <Loader color="green" size="lg" type="dots" />
          <Text color="gray.5" size="sm">Loading Doki Operator Portal...</Text>
        </Stack>
      </Container>
    );
  }

  // Formatting date utility
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderSafeJson = (details: string) => {
    try {
      return JSON.stringify(JSON.parse(details), null, 2);
    } catch {
      return details; // fallback to raw string
    }
  };

  return (
    <Box style={{ backgroundColor: '#0b0f19', color: '#f3f4f6' }}>
      <Container size="xl">
        {/* Page Actions */}
        <Group justify="space-between" mb={30} align="center">
          <Text size="sm" color="gray.5">
            Real-time Landfill Avoidance & Carbon Abatement Ledger | Kenya Agricultural Hubs
          </Text>
          <Group gap="md">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconReload size={16} />}
              onClick={fetchData}
              loading={refreshing}
              style={{ color: '#9ca3af' }}
            >
              Refresh Data
            </Button>
            <Button
              variant="outline"
              color="green"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
          </Group>
        </Group>

        {/* Real-time Impact Scorecard */}
        <Grid gap="md" mb={30}>
          {/* Card A: Total Waste Diverted */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              p="lg"
              radius="lg"
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
              }}
            >
              <Text size="xs" color="gray.5" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                Total Waste Diverted
              </Text>
              <Group justify="space-between" align="baseline" mt="sm">
                <Text style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6' }}>
                  {stats?.scorecard.totalWasteDiverted || 0} <Text span size="xl" color="gray.5">Tonnes</Text>
                </Text>
                <Badge color="green" variant="light">Diverted from Landfill</Badge>
              </Group>
              <SparklineChart data={stats?.sparkline || []} />
            </Card>
          </Grid.Col>

          {/* Card B: Methane Avoided */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              p="lg"
              radius="lg"
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
              }}
            >
              <Text size="xs" color="gray.5" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                Methane Avoided (CH4)
              </Text>
              <Group justify="space-between" align="baseline" mt="sm">
                <Text style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6' }}>
                  {stats?.scorecard.methaneAvoided || 0} <Text span size="xl" color="gray.5">MT</Text>
                </Text>
                <Badge color="teal" variant="light">IPCC Standard DOC</Badge>
              </Group>
              <SparklineChart data={stats?.sparkline || []} />
            </Card>
          </Grid.Col>

          {/* Card C: CO2e Reductions */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              p="lg"
              radius="lg"
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
              }}
            >
              <Text size="xs" color="gray.5" fw={700} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                CO2e Reductions
              </Text>
              <Group justify="space-between" align="baseline" mt="sm">
                <Text style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6' }}>
                  {stats?.scorecard.co2eReduced || 0} <Text span size="xl" color="gray.5">MTCO₂e</Text>
                </Text>
                <Badge color="emerald" variant="light">GWP Multiplier x28</Badge>
              </Group>
              <SparklineChart data={stats?.sparkline || []} />
            </Card>
          </Grid.Col>
        </Grid>

        {/* Proximity Map & Audit Trail Grid */}
        <Grid gap="lg" mb={30}>
          {/* Map Column */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card
              p="md"
              radius="lg"
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                height: '100%',
              }}
            >
              <Title order={3} size="lg" mb="sm" style={{ color: '#f3f4f6', fontWeight: 700 }}>
                Kenyan Geo-Spatial Proximity Map
              </Title>
              <Text size="xs" color="gray.5" mb="md">
                Active Listings Map in Thika, Kiambu, and Nairobi. Green pins are Waste Sellers. Blue pins are Offtakers.
              </Text>
              <MapComponent pins={mapPins} />
            </Card>
          </Grid.Col>

          {/* Audit Ledger Column */}
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card
              p="md"
              radius="lg"
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                height: '100%',
              }}
            >
              <Title order={3} size="lg" mb="sm" style={{ color: '#f3f4f6', fontWeight: 700 }}>
                Live Audit Ledger
              </Title>
              <Text size="xs" color="gray.5" mb="md">
                Scrollable real-time transaction ledger for audit review. Click any row to expand forensic parameters.
              </Text>

              <ScrollArea h={380}>
                <Table highlightOnHover verticalSpacing="sm" style={{ color: '#e5e7eb' }}>
                  <Table.Thead style={{ borderBottom: '1.5px solid #1f2937' }}>
                    <Table.Tr>
                      <Table.Th style={{ color: '#9ca3af', fontSize: '12px' }}>Timestamp</Table.Th>
                      <Table.Th style={{ color: '#9ca3af', fontSize: '12px' }}>Action</Table.Th>
                      <Table.Th style={{ color: '#9ca3af', fontSize: '12px' }}>Operator</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {auditLogs.map((log) => {
                      const isExpanded = expandedLogId === log.id;
                      let badgeColor = 'blue';
                      if (log.action === 'TRANSACTION_COMPLETED') badgeColor = 'emerald';
                      else if (log.action === 'LISTING_PUBLISHED') badgeColor = 'green';
                      else if (log.action === 'SYSTEM_BOOTSTRAP') badgeColor = 'cyan';

                      return (
                        <React.Fragment key={log.id}>
                          <Table.Tr
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            style={{ cursor: 'pointer', borderBottom: '1px solid #1f2937' }}
                          >
                            <Table.Td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                              {formatDate(log.timestamp)}
                            </Table.Td>
                            <Table.Td>
                              <Badge color={badgeColor} variant="light" size="xs">
                                {log.action}
                              </Badge>
                            </Table.Td>
                            <Table.Td style={{ fontSize: '12px', fontWeight: 500 }}>
                              {log.operator}
                            </Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td colSpan={3} p={0}>
                              <Collapse expanded={isExpanded}>
                                <Box p="md" style={{ backgroundColor: '#0b0f19', borderBottom: '1px solid #1f2937' }}>
                                  <Group mb="xs">
                                    <IconDatabase size={14} color="#10b981" />
                                    <Text size="xs" fw={700} color="green.4">Forensic JSON Metadata</Text>
                                  </Group>
                                  <pre
                                    style={{
                                      margin: 0,
                                      fontSize: '11px',
                                      color: '#a7f3d0',
                                      overflowX: 'auto',
                                      fontFamily: 'monospace',
                                      padding: '8px',
                                      backgroundColor: '#1f2937/40',
                                      borderRadius: '6px',
                                    }}
                                  >
                                    {renderSafeJson(log.details)}
                                  </pre>
                                </Box>
                              </Collapse>
                            </Table.Td>
                          </Table.Tr>
                        </React.Fragment>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}


