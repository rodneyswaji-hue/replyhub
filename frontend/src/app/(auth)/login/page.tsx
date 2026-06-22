'use client';

import {
  Box, Button, Divider, Group, PasswordInput, Stack, Text, TextInput, Title, Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconHeadset, IconArrowRight } from '@tabler/icons-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email:    (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length >= 6 ? null : 'Password too short'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const { data } = await api.post('/auth/login', values);
      setAuth(data.user, data.workspace, data.token);
      router.push('/conversations');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      notifications.show({ color: 'red', title: 'Authentication failed', message: msg });
    }
  };

  return (
    <Box>
      {/* Mobile logo (hidden on md+) */}
      <Group gap="xs" mb={40} hiddenFrom="md" justify="center">
        <Box style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconHeadset size={18} color="#fff" />
        </Box>
        <Text fw={800} size="lg" style={{ color: '#fff' }}>ReplyHub</Text>
      </Group>

      <Stack gap={4} mb={32}>
        <Title order={2} fw={900} style={{ color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
          Welcome back
        </Title>
        <Text size="sm" c="dimmed">Sign in to your workspace</Text>
      </Stack>

      <Box style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        padding: 28,
        backdropFilter: 'blur(12px)',
      }}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email address"
              placeholder="you@company.com"
              type="email"
              size="md"
              {...form.getInputProps('email')}
              styles={{
                label: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 },
                input: {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#f1f5f9',
                  '&:focus': { borderColor: '#6366f1' },
                },
              }}
            />
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              size="md"
              {...form.getInputProps('password')}
              styles={{
                label: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 },
                input: {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#f1f5f9',
                  '&:focus': { borderColor: '#6366f1' },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              size="md"
              loading={form.submitting}
              rightSection={!form.submitting && <IconArrowRight size={16} />}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                fontWeight: 700,
                marginTop: 4,
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </Box>

      <Text ta="center" mt={20} size="sm" c="dimmed">
        Don&apos;t have a workspace?{' '}
        <Anchor component={Link} href="/register" fw={700} style={{ color: '#818cf8' }}>
          Create one free
        </Anchor>
      </Text>
    </Box>
  );
}
