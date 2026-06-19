"use client";

import { getApiUrl } from "@/utils/network";
import { Alert, Badge, Box, Button, Card, Container, Grid, Group, Loader, Progress, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAlertTriangle, IconArrowLeft, IconCheck, IconLeaf, IconTruckDelivery } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type ListingDetail = {
  id: number;
  quantity: number;
  moisture: number;
  purity: number;
  status: string;
  category: { name: string; doc: number };
  seller: { name: string; address: string; contactPhone: string };
};

export default function ListingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [successMsg, setSuccessMsg] = useState("");

  const { data: listing, isLoading, error } = useQuery<ListingDetail>({
    queryKey: ['listing', id],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/v1/listings/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch listing");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/v1/transactions/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to express interest");
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccessMsg("Sourcing interest successfully locked. The organic waste generator has been notified.");
    },
  });

  if (isLoading) {
    return (
      <Container fluid style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack align="center" gap="md">
          <Loader color="teal" size="lg" type="dots" />
          <Text color="slate.4" size="sm">Retrieving Feedstock Material Asset Stream Parameters...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !listing) {
    return (
      <Container fluid style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text color="red.4">Failed to load listing. It may have been removed or acquired.</Text>
      </Container>
    );
  }

  const isWarning = listing.purity < 75;

  return (
    <Box py={30}>
      <Container size="md">
        <Button
          variant="subtle"
          color="slate"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/buyer')}
          mb="xl"
        >
          Back to Marketplace
        </Button>

        <Group justify="space-between" mb={30}>
          <Stack gap={4}>
            <Title order={1} style={{ fontSize: "28px", fontWeight: 800, color: "#f8fafc" }}>
              Asset Stream: <Text span inherit color="#0d9488">LST-{listing.id.toString().padStart(5, '0')}</Text>
            </Title>
            <Text size="sm" color="slate.4">
              Gemini 2.5 Flash Classification Report
            </Text>
          </Stack>
          <Badge color={listing.status === "PENDING" ? "blue" : "teal"} size="lg" variant="light">
            {listing.status}
          </Badge>
        </Group>

        {isWarning && (
          <Alert icon={<IconAlertTriangle size={16} />} title="Structural Contaminants Detected" color="red" variant="light" mb="xl">
            The AI vision model has flagged this feedstock stream for a Verified Composition Purity Index (CPI) below 75%. Inspect carefully upon delivery.
          </Alert>
        )}

        {successMsg && (
          <Alert icon={<IconCheck size={16} />} title="Transaction Locked" color="teal" variant="light" mb="xl">
            {successMsg}
          </Alert>
        )}

        <Grid gap="lg">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card p="xl" radius="lg" style={{ backgroundColor: "#1e293b", border: "1px solid #334155", height: "100%" }}>
              <Title order={3} size="h4" mb="md" style={{ color: "#f8fafc" }}>Feedstock Parameters</Title>
              
              <Group gap="xs" mb="xl">
                <ThemeIcon color="teal" size="lg" radius="xl" variant="light">
                  <IconLeaf size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" color="slate.5" fw={700} style={{ textTransform: 'uppercase' }}>Category</Text>
                  <Text size="lg" fw={600} color="#f8fafc">{listing.category.name}</Text>
                </Box>
              </Group>

              <Stack gap="xl">
                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" color="slate.4">Total Verified Weight</Text>
                    <Text size="lg" fw={800} color="teal.4">{listing.quantity} <Text span size="sm">Kg</Text></Text>
                  </Group>
                </Box>

                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" color="slate.4">Verified Composition Purity Index (CPI)</Text>
                    <Text size="md" fw={700} color={isWarning ? "red.4" : "teal.4"}>{listing.purity}%</Text>
                  </Group>
                  <Progress value={listing.purity} color={isWarning ? "red" : "teal"} size="md" />
                </Box>

                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" color="slate.4">Relative Moisture Coefficient (RMC)</Text>
                    <Text size="md" fw={700} color="blue.4">{listing.moisture}%</Text>
                  </Group>
                  <Progress value={listing.moisture} color="blue" size="md" />
                </Box>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="lg" h="100%">
              <Card p="xl" radius="lg" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
                <Title order={3} size="h4" mb="md" style={{ color: "#f8fafc" }}>Organic Waste Generator Profile</Title>
                <Text size="xs" color="slate.5" fw={700} style={{ textTransform: 'uppercase' }} mb={4}>Facility Name</Text>
                <Text size="sm" fw={600} color="#f8fafc" mb="md">{listing.seller.name}</Text>

                <Text size="xs" color="slate.5" fw={700} style={{ textTransform: 'uppercase' }} mb={4}>Location Address</Text>
                <Text size="sm" color="#f8fafc" mb="md">{listing.seller.address}</Text>

                <Text size="xs" color="slate.5" fw={700} style={{ textTransform: 'uppercase' }} mb={4}>Contact Terminal</Text>
                <Text size="sm" color="#f8fafc">{listing.seller.contactPhone || "Not Provided"}</Text>
              </Card>

              <Card p="xl" radius="lg" style={{ backgroundColor: "#1e293b", border: "1px solid #0d9488", flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title order={3} size="h5" mb="sm" ta="center" style={{ color: "#f8fafc" }}>Express Sourcing Interest</Title>
                <Text size="xs" color="slate.4" ta="center" mb="xl">
                  By executing this action, you lock this feedstock stream into your procurement pipeline and notify the generator.
                </Text>
                
                <Button
                  fullWidth
                  size="lg"
                  color="teal"
                  leftSection={<IconTruckDelivery size={20} />}
                  loading={mutation.isPending}
                  onClick={() => mutation.mutate()}
                  disabled={listing.status !== "PENDING" || !!successMsg}
                >
                  {successMsg ? "Locked for Transit" : "Secure Feedstock"}
                </Button>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
