'use client';

import {
  ActionIcon, AppShell, Avatar, Badge, Box, Divider, Group, Menu,
  NavLink, Stack, Text, Tooltip, UnstyledButton,
} from '@mantine/core';
import {
  IconBolt, IconChartBar, IconChecklist, IconChevronDown,
  IconHeadset, IconInbox, IconLogout, IconMessage2,
  IconSettings, IconTag, IconUser, IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { disconnectEcho } from '@/lib/echo';

const NAV_ITEMS = [
  { icon: IconInbox,    label: 'Inbox',     href: '/conversations' },
  { icon: IconChecklist,label: 'Tickets',   href: '/tickets'       },
  { icon: IconUsers,    label: 'Contacts',  href: '/contacts'      },
  { icon: IconChartBar, label: 'Analytics', href: '/analytics'     },
];

const SETTINGS_ITEMS = [
  { icon: IconSettings, label: 'Workspace',       href: '/settings/workspace'        },
  { icon: IconUsers,    label: 'Agents',           href: '/settings/agents'           },
  { icon: IconMessage2, label: 'Widget',           href: '/settings/widget'           },
  { icon: IconBolt,     label: 'Canned Responses', href: '/settings/canned-responses' },
  { icon: IconTag,      label: 'Labels',           href: '/settings/labels'           },
];

const STATUS_COLORS: Record<string, string> = {
  online:  '#22c55e',
  away:    '#f59e0b',
  offline: '#4b5563',
};

const STATUS_LABELS: Record<string, string> = {
  online:  'Online',
  away:    'Away',
  offline: 'Offline',
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, workspace, logout } = useAuthStore();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    disconnectEcho();
    logout();
    router.push('/login');
  };

  const handleStatusChange = async (status: 'online' | 'away' | 'offline') => {
    await api.patch('/auth/status', { status });
    useAuthStore.getState().updateUser({ status });
  };

  if (!user) return null;

  return (
    <AppShell
      navbar={{ width: 248, breakpoint: 'sm' }}
      padding={0}
      styles={{
        root:   { height: '100vh', background: 'var(--rh-bg)' },
        navbar: {
          background: '#090e18',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
        },
        main: { background: 'var(--rh-bg)', overflow: 'auto' },
      }}
    >
      <AppShell.Navbar>

        {/* ── Logo ── */}
        <Box px="lg" style={{ height: 60, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Group gap="xs">
            <Box style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99,102,241,0.35)',
            }}>
              <IconHeadset size={18} color="#fff" />
            </Box>
            <Text fw={800} size="sm" style={{ color: '#fff', letterSpacing: '-0.4px' }}>ReplyHub</Text>
          </Group>
        </Box>

        {/* ── Workspace badge ── */}
        <Box px="sm" py="xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Box style={{
            padding: '8px 10px', borderRadius: 10,
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <Group gap="xs">
              <Avatar size={26} radius="sm" color="indigo" style={{ fontWeight: 700, fontSize: 12 }}>
                {workspace?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box flex={1} style={{ overflow: 'hidden' }}>
                <Text size="xs" fw={700} truncate style={{ color: '#c7d2fe' }}>{workspace?.name}</Text>
                <Text size="10px" c="dimmed" tt="capitalize">{workspace?.plan} plan</Text>
              </Box>
            </Group>
          </Box>
        </Box>

        {/* ── Main nav ── */}
        <Box flex={1} py="sm" px="xs" style={{ overflowY: 'auto' }}>

          <Text size="10px" fw={700} c="dimmed" px="xs" mb={6} tt="uppercase" style={{ letterSpacing: '0.08em' }}>
            Support
          </Text>
          <Stack gap={2}>
            {NAV_ITEMS.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<item.icon size={16} />}
                  active={active}
                  styles={{
                    root: {
                      borderRadius: 9,
                      color: active ? '#c7d2fe' : '#64748b',
                      background: active ? 'rgba(99,102,241,0.14)' : 'transparent',
                      borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
                      paddingLeft: active ? 'calc(var(--navlink-padding-x) - 2px)' : undefined,
                      fontWeight: active ? 600 : 400,
                      '&:hover': { background: 'rgba(255,255,255,0.04)', color: '#94a3b8' },
                    },
                    label: { fontSize: 13 },
                  }}
                />
              );
            })}
          </Stack>

          <Divider my="md" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Text size="10px" fw={700} c="dimmed" px="xs" mb={6} tt="uppercase" style={{ letterSpacing: '0.08em' }}>
            Configuration
          </Text>
          <Stack gap={2}>
            {SETTINGS_ITEMS.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<item.icon size={15} />}
                  active={active}
                  styles={{
                    root: {
                      borderRadius: 9,
                      color: active ? '#c7d2fe' : '#4b5563',
                      background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                      '&:hover': { background: 'rgba(255,255,255,0.03)', color: '#64748b' },
                    },
                    label: { fontSize: 12, fontWeight: active ? 600 : 400 },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* ── User section ── */}
        <Box style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 8px' }}>
          <Menu position="top" withArrow shadow="xl" offset={8}>
            <Menu.Target>
              <UnstyledButton style={{
                width: '100%', padding: '9px 10px', borderRadius: 10,
                transition: 'background 0.15s ease',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Group gap="xs">
                  <Box style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar size={36} src={user.avatar} radius="xl" color="indigo"
                      style={{ fontWeight: 700 }}>
                      {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box style={{
                      position: 'absolute', bottom: 1, right: 1,
                      width: 10, height: 10, borderRadius: '50%',
                      background: STATUS_COLORS[user.status ?? 'offline'],
                      border: '1.5px solid #090e18',
                    }} />
                  </Box>
                  <Box flex={1} style={{ overflow: 'hidden' }}>
                    <Text size="xs" fw={600} truncate style={{ color: '#e2e8f0' }}>{user.name}</Text>
                    <Group gap={4}>
                      <Box style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: STATUS_COLORS[user.status ?? 'offline'],
                      }} />
                      <Text size="10px" c="dimmed">{STATUS_LABELS[user.status ?? 'offline']}</Text>
                    </Group>
                  </Box>
                  <IconChevronDown size={13} color="#374155" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown style={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              minWidth: 180,
            }}>
              <Menu.Label style={{ color: '#475569', fontSize: 10 }}>Set status</Menu.Label>
              <Menu.Item
                leftSection={<Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />}
                onClick={() => handleStatusChange('online')}
                style={{ fontSize: 13, color: '#e2e8f0' }}
              >
                Online
              </Menu.Item>
              <Menu.Item
                leftSection={<Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />}
                onClick={() => handleStatusChange('away')}
                style={{ fontSize: 13, color: '#e2e8f0' }}
              >
                Away
              </Menu.Item>
              <Menu.Item
                leftSection={<Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#4b5563' }} />}
                onClick={() => handleStatusChange('offline')}
                style={{ fontSize: 13, color: '#e2e8f0' }}
              >
                Offline
              </Menu.Item>
              <Menu.Divider style={{ borderColor: 'rgba(255,255,255,0.07)' }} />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={handleLogout}
                style={{ fontSize: 13 }}
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
