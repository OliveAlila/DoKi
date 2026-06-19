'use client';

import { Button, Container, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Container my={40}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container my={40}>
      <Title>Dashboard</Title>
      <Text mt="md">Welcome, {user.name || user.email}!</Text>
      <Button mt="md" onClick={() => signOut()}>Sign out</Button>
    </Container>
  );
}
