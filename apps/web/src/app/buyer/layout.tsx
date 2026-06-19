"use client";

import BuyerAppShell from "@/components/layout/BuyerAppShell";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Container, Stack, Loader, Text, Card, ThemeIcon, Title, Button } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";

const BuyerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          backgroundColor: "#0f172a",
        }}
      >
        <Stack align="center" gap="md">
          <Loader color="teal" size="lg" type="dots" />
          <Text color="slate.4" size="sm">
            Authenticating Buyer Profile...
          </Text>
        </Stack>
      </Container>
    );
  }

  // Access Denied guard if user is loaded but not a BUYER
  if (user.role !== "BUYER") {
    return (
      <Container
        fluid
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
        }}
      >
        <Card
          p="xl"
          radius="lg"
          style={{
            backgroundColor: "#1e293b",
            border: "1px solid #ef4444",
            maxWidth: "500px",
            textAlign: "center",
            boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.2)",
          }}
        >
          <Stack align="center" gap="md">
            <ThemeIcon color="red" size="xl" radius="xl">
              <IconLock size={30} />
            </ThemeIcon>
            <Title order={2} style={{ color: "#fca5a5", fontWeight: 800 }}>
              Access Restricted
            </Title>
            <Text color="slate.3" size="sm">
              Buyer Profile Credentials Required. Your account role is{" "}
              <strong>{user.role}</strong>.
            </Text>
            <Button variant="filled" color="teal" onClick={() => router.push("/")}>
              Return to Homepage
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return <BuyerAppShell>{children}</BuyerAppShell>;
};

export default BuyerLayout;
