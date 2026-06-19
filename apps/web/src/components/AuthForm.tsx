'use client';

import { Anchor, Button, Container, Group, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/utils/network';

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password should include at least 6 characters' }),
});

export function AuthForm({ type }: { type: 'sign-in' | 'sign-up' }) {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      name: '',
    },
    validate: zodResolver(authSchema),
  });

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const endpoint = type === 'sign-in' ? '/api/auth/sign-in' : '/api/auth/sign-up';
      const res = await fetch(`${getApiUrl()}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate');
      return data;
    },
    onSuccess: (data) => {
      signIn(data.user);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  if (loading || user) return null;

  return (
    <Container size={420} my={40}>
      <Title ta="center">{type === 'sign-in' ? 'Welcome back!' : 'Create an account'}</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
          {type === 'sign-up' && (
            <TextInput label="Name" placeholder="Your name" required {...form.getInputProps('name')} />
          )}
          <TextInput label="Email" placeholder="you@example.dev" required mt="md" {...form.getInputProps('email')} />
          <PasswordInput label="Password" placeholder="Your password" required mt="md" {...form.getInputProps('password')} />
          <Button fullWidth mt="xl" type="submit" loading={mutation.isPending}>
            {type === 'sign-in' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>
        <Group justify="space-between" mt="lg">
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            {type === 'sign-in' ? 'Do not have an account yet?' : 'Already have an account?'}
            <Anchor size="sm" component="button" ml={5} onClick={() => router.push(type === 'sign-in' ? '/sign-up' : '/sign-in')}>
              {type === 'sign-in' ? 'Create account' : 'Sign in'}
            </Anchor>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}
