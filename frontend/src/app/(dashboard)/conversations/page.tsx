'use client';

import {
  ActionIcon, Badge, Box, Group, Loader, ScrollArea, SegmentedControl,
  Stack, Text, TextInput, Tooltip,
} from '@mantine/core';
import { IconSearch, IconRefresh, IconInbox, IconMessage2 } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { Conversation } from '@/types';
import { getEcho } from '@/lib/echo';
import { useAuthStore } from '@/stores/auth';
import ConversationListItem from '@/components/conversations/ConversationListItem';

const STATUS_TABS = [
  { value: 'open',     label: 'Open'     },
  { value: 'pending',  label: 'Pending'  },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed',   label: 'Closed'   },
];

export default function ConversationsPage() {
  const { workspace } = useAuthStore();
  const [status,     setStatus]     = useState('open');
  const [search,     setSearch]     = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['conversations', status, search],
    queryFn: () =>
      api.get('/conversations', { params: { status, search: search || undefined } })
        .then((r) => r.data),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!workspace) return;
    const echo    = getEcho();
    const channel = echo.private(`workspace.${workspace.id}`);
    channel.listen('.MessageSent',          () => refetch());
    channel.listen('.ConversationUpdated',  () => refetch());
    return () => { echo.leave(`workspace.${workspace.id}`); };
  }, [workspace, refetch]);

  const conversations: Conversation[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? conversations.length;

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* ── Header ── */}
      <Box style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, #0d1220 0%, #090e18 100%)',
        flexShrink: 0,
      }}>
        {/* Title row */}
        <Box px="lg" pt="lg" pb="md">
          <Group justify="space-between" mb={12}>
            <Group gap="xs">
              <Text fw={800} size="lg" style={{ color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                Conversations
              </Text>
              {total > 0 && (
                <Badge variant="light" color="indigo" size="sm" radius="sm">
                  {total}
                </Badge>
              )}
            </Group>
            <Tooltip label="Refresh">
              <ActionIcon variant="subtle" color="gray" onClick={() => refetch()} size="sm">
                <IconRefresh size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <TextInput
            placeholder="Search by name, email, or subject…"
            leftSection={<IconSearch size={14} color="#475569" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="sm"
            styles={{
              input: {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#e2e8f0',
                fontSize: 13,
                '&::placeholder': { color: '#4b5563' },
              },
            }}
          />
        </Box>

        {/* Status tabs */}
        <Box px="md" pb="sm">
          <SegmentedControl
            value={status}
            onChange={setStatus}
            data={STATUS_TABS}
            fullWidth
            size="xs"
            styles={{
              root: {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
              },
              label: { fontSize: 12, fontWeight: 500, color: '#64748b' },
              indicator: { background: 'rgba(99,102,241,0.2)', borderRadius: 6 },
            }}
          />
        </Box>
      </Box>

      {/* ── List ── */}
      <ScrollArea flex={1} style={{ background: '#090e18' }}>
        {isLoading ? (
          <Box py={60} ta="center">
            <Loader size="sm" color="indigo" />
          </Box>
        ) : conversations.length === 0 ? (
          <Box py={80} ta="center" px="xl">
            <Box style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <IconInbox size={28} color="#6366f1" />
            </Box>
            <Text fw={600} style={{ color: '#e2e8f0', marginBottom: 6 }}>
              {search ? 'No results found' : `No ${status} conversations`}
            </Text>
            <Text size="sm" c="dimmed" maw={220} mx="auto">
              {search ? `Try a different search term` : 'New conversations will appear here in real time.'}
            </Text>
          </Box>
        ) : (
          <Stack gap={0}>
            {conversations.map((conv) => (
              <ConversationListItem key={conv.id} conversation={conv} />
            ))}
            {/* Count footer */}
            <Box py="md" ta="center">
              <Text size="xs" c="dimmed">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</Text>
            </Box>
          </Stack>
        )}
      </ScrollArea>
    </Box>
  );
}
