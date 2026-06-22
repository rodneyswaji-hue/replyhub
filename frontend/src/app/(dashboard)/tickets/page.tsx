'use client';

import {
  Avatar, Badge, Box, Group, Loader, SegmentedControl, Stack, Text, TextInput,
} from '@mantine/core';
import { IconSearch, IconTicket, IconClock, IconUser } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '@/lib/api';
import type { Conversation } from '@/types';

dayjs.extend(relativeTime);

const PRIORITY_COLORS: Record<string, string> = {
  low:    'gray',
  normal: 'indigo',
  high:   'orange',
  urgent: 'red',
};

const STATUS_COLORS: Record<string, string> = {
  open:     'green',
  pending:  'yellow',
  resolved: 'blue',
  closed:   'gray',
};

const PRIORITY_STRIP: Record<string, string> = {
  low:    'transparent',
  normal: 'transparent',
  high:   '#f59e0b',
  urgent: '#ef4444',
};

const AVATAR_PALETTE = ['#6366f1', '#8b5cf6', '#0891b2', '#059669', '#d97706', '#ec4899'];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

export default function TicketsPage() {
  const [status, setStatus] = useState('open');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', status, search],
    queryFn: () =>
      api.get('/conversations', { params: { status, search: search || undefined, is_ticket: true } })
        .then((r) => r.data),
  });

  const tickets: Conversation[] = data?.data ?? [];

  return (
    <Box style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#090e18' }}>
      {/* ── Header ── */}
      <Box px="xl" pt="xl" pb="md" style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, #0d1220 0%, #090e18 100%)',
        flexShrink: 0,
      }}>
        <Group justify="space-between" mb="lg">
          <Box>
            <Group gap="xs" mb={4}>
              <Text fw={800} size="xl" style={{ color: '#f1f5f9', letterSpacing: '-0.5px' }}>Tickets</Text>
              {tickets.length > 0 && (
                <Badge variant="light" color="amber" size="sm" radius="sm">{tickets.length}</Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">Follow-up conversations that need attention</Text>
          </Box>
        </Group>

        <Group gap="md" wrap="nowrap">
          <TextInput
            placeholder="Search tickets…"
            leftSection={<IconSearch size={14} color="#475569" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            flex={1}
            size="sm"
            styles={{
              input: {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#e2e8f0',
                fontSize: 13,
              },
            }}
          />
          <SegmentedControl
            value={status}
            onChange={setStatus}
            data={[
              { value: 'open',     label: 'Open'     },
              { value: 'pending',  label: 'Pending'  },
              { value: 'resolved', label: 'Resolved' },
            ]}
            size="sm"
            styles={{
              root: {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
              },
              label: { fontSize: 12, fontWeight: 500 },
              indicator: { background: 'rgba(99,102,241,0.2)', borderRadius: 6 },
            }}
          />
        </Group>
      </Box>

      {/* ── List ── */}
      <Box flex={1} style={{ overflowY: 'auto', padding: '16px 24px' }}>
        {isLoading ? (
          <Box ta="center" py={60}><Loader size="sm" color="indigo" /></Box>
        ) : tickets.length === 0 ? (
          <Box ta="center" py={80}>
            <Box style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <IconTicket size={32} color="#f59e0b" />
            </Box>
            <Text fw={600} style={{ color: '#e2e8f0', marginBottom: 8 }}>
              {search ? 'No matching tickets' : `No ${status} tickets`}
            </Text>
            <Text size="sm" c="dimmed" maw={260} mx="auto">
              {search
                ? 'Try a different search term'
                : 'Tickets are created automatically when no agents are online.'}
            </Text>
          </Box>
        ) : (
          <Stack gap="sm">
            {tickets.map((ticket, idx) => {
              const name    = ticket.contact?.name ?? ticket.contact?.email ?? 'Anonymous';
              const initial = name[0].toUpperCase();
              const bg      = avatarColor(name);
              return (
                <Box
                  key={ticket.id}
                  component={Link}
                  href={`/conversations/${ticket.id}`}
                  style={{
                    display: 'block',
                    padding: '16px 18px',
                    background: '#0d1220',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: `3px solid ${PRIORITY_STRIP[ticket.priority] ?? 'transparent'}`,
                    borderRadius: 12,
                    textDecoration: 'none',
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = '#111827';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = '#0d1220';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <Group justify="space-between" mb={10} wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                      <Avatar size={36} radius="xl" style={{ background: bg, color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {initial}
                      </Avatar>
                      <Box style={{ minWidth: 0 }}>
                        <Text fw={700} size="sm" truncate style={{ color: '#e2e8f0' }}>
                          {ticket.subject ?? 'No subject'}
                        </Text>
                        <Group gap={6}>
                          <IconUser size={11} color="#475569" />
                          <Text size="xs" c="dimmed" truncate>{name}</Text>
                        </Group>
                      </Box>
                    </Group>
                    <Group gap="xs" style={{ flexShrink: 0 }}>
                      <Badge size="xs" color={PRIORITY_COLORS[ticket.priority] as string} variant="light">
                        {ticket.priority}
                      </Badge>
                      <Badge size="xs" color={STATUS_COLORS[ticket.status] as string} variant="filled">
                        {ticket.status}
                      </Badge>
                    </Group>
                  </Group>

                  <Text size="xs" c="dimmed" truncate style={{ marginBottom: 10, paddingLeft: 44 }}>
                    {ticket.latest_message?.content ?? 'No messages yet'}
                  </Text>

                  <Group justify="space-between" style={{ paddingLeft: 44 }}>
                    {ticket.assigned_agent ? (
                      <Group gap={6}>
                        <Avatar size={18} radius="xl" color="indigo" style={{ fontSize: 9, fontWeight: 700 }}>
                          {ticket.assigned_agent.name[0]}
                        </Avatar>
                        <Text size="xs" c="dimmed">{ticket.assigned_agent.name}</Text>
                      </Group>
                    ) : (
                      <Text size="xs" style={{ color: '#374155' }}>Unassigned</Text>
                    )}
                    <Group gap={4}>
                      <IconClock size={11} color="#374155" />
                      <Text size="xs" c="dimmed">
                        {ticket.last_message_at ? dayjs(ticket.last_message_at).fromNow() : '—'}
                      </Text>
                    </Group>
                  </Group>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
