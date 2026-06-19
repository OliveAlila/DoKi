"use client";

import DashboardAppShell from "@/components/layout/DashboardAppShell";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Container, Stack, Loader, Text, Card, ThemeIcon, Title, Button } from "@mantine/core";
import { IconRecycle } from "@tabler/icons-react";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Container
        fluid
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0f19",
        }}
      >
        <Stack align="center" gap="md">
          <Loader color="green" size="lg" type="dots" />
          <Text color="gray.5" size="sm">
            Authenticating...
          </Text>
        </Stack>
      </Container>
    );
  }

  // Access Denied guard if user is loaded but not an ADMIN
  if (user.role !== "ADMIN") {
    return (
      <Container
        fluid
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0f19",
        }}
      >
        <Card
          p="xl"
          radius="lg"
          style={{
            backgroundColor: "#111827",
            border: "1px solid #dc2626",
            maxWidth: "500px",
            textAlign: "center",
            boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.2)",
          }}
        >
          <Stack align="center" gap="md">
            <ThemeIcon color="red" size="xl" radius="xl">
              <IconRecycle size={30} />
            </ThemeIcon>
            <Title order={2} style={{ color: "#f87171", fontWeight: 800 }}>
              Access Denied
            </Title>
            <Text color="gray.4" size="sm">
              The Operator Dashboard requires ADMIN clearance. Your account role is{" "}
              <strong>{user.role}</strong>.
            </Text>
            <Button variant="filled" color="green" onClick={() => router.push("/")}>
              Return to Homepage
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return <DashboardAppShell>{children}</DashboardAppShell>;
};

export default DashboardLayout;
