'use client';

import {
  Box, Button, Group, PasswordInput, Stack, Text, TextInput, Title, Anchor, Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconHeadset, IconArrowRight, IconBuilding, IconUser, IconMail, IconLock } from '@tabler/icons-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const INPUT_STYLES = {
  label: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: '#f1f5f9',
    '&:focus': { borderColor: '#6366f1' },
  },
};

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const form = useForm({
    initialValues: {
      workspace_name: '', name: '', email: '', password: '', password_confirmation: '',
    },
    validate: {
      workspace_name:       (v) => (v.length >= 2 ? null : 'Workspace name too short'),
      name:                 (v) => (v.length >= 2 ? null : 'Name too short'),
      email:                (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      password:             (v) => (v.length >= 8 ? null : 'Min 8 characters'),
      password_confirmation:(v, vals) => (v === vals.password ? null : 'Passwords do not match'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const { data } = await api.post('/auth/register', values);
      setAuth(data.user, data.workspace, data.token);
      router.push('/conversations');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      notifications.show({ color: 'red', title: 'Error', message: msg });
    }
  };

  return (
    <Box>
      {/* Mobile logo */}
      <Group gap="xs" mb={32} hiddenFrom="md" justify="center">
        <Box style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconHeadset size={18} color="#fff" />
        </Box>
        <Text fw={800} size="lg" style={{ color: '#fff' }}>ReplyHub</Text>
      </Group>

      <Stack gap={4} mb={28}>
        <Title order={2} fw={900} style={{ color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
          Create your workspace
        </Title>
        <Text size="sm" c="dimmed">Free forever. No credit card required.</Text>
      </Stack>

      <Box style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        padding: 28,
        backdropFilter: 'blur(12px)',
      }}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              label="Workspace name"
              placeholder="Acme Inc."
              size="md"
              leftSection={<IconBuilding size={15} color="#475569" />}
              {...form.getInputProps('workspace_name')}
              styles={INPUT_STYLES}
            />

            <Divider style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

            <TextInput
              label="Your name"
              placeholder="Jane Smith"
              size="md"
              leftSection={<IconUser size={15} color="#475569" />}
              {...form.getInputProps('name')}
              styles={INPUT_STYLES}
            />
            <TextInput
              label="Email address"
              placeholder="you@company.com"
              type="email"
              size="md"
              leftSection={<IconMail size={15} color="#475569" />}
              {...form.getInputProps('email')}
              styles={INPUT_STYLES}
            />
            <PasswordInput
              label="Password"
              placeholder="Min 8 characters"
              size="md"
              leftSection={<IconLock size={15} color="#475569" />}
              {...form.getInputProps('password')}
              styles={INPUT_STYLES}
            />
            <PasswordInput
              label="Confirm password"
              placeholder="••••••••"
              size="md"
              leftSection={<IconLock size={15} color="#475569" />}
              {...form.getInputProps('password_confirmation')}
              styles={INPUT_STYLES}
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
                marginTop: 8,
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              Create workspace
            </Button>
          </Stack>
        </form>
      </Box>

      <Text ta="center" mt={20} size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
        By signing up you agree to our{' '}
        <Anchor component={Link} href="#" size="xs" style={{ color: '#6366f1' }}>Terms</Anchor>
        {' '}and{' '}
        <Anchor component={Link} href="#" size="xs" style={{ color: '#6366f1' }}>Privacy Policy</Anchor>
      </Text>
      <Text ta="center" mt={12} size="sm" c="dimmed">
        Already have a workspace?{' '}
        <Anchor component={Link} href="/login" fw={700} style={{ color: '#818cf8' }}>Sign in</Anchor>
      </Text>
    </Box>
  );
}
