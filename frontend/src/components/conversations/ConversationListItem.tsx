'use client';

import { Avatar, Badge, Box, Group, Text, UnstyledButton } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Conversation } from '@/types';

dayjs.extend(relativeTime);

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

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#0891b2', '#059669', '#d97706', '#ec4899'];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ConversationListItem({ conversation: c }: { conversation: Conversation }) {
  const pathname = usePathname();
  const isActive = pathname === `/conversations/${c.id}`;

  const displayName = c.contact?.name ?? c.contact?.email ?? 'Anonymous';
  const initials    = c.contact?.name
    ? c.contact.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : c.contact?.email?.[0]?.toUpperCase() ?? '?';

  const avatarColor = getAvatarColor(displayName);
  const preview     = c.subject ?? c.latest_message?.content ?? 'No messages yet';
  const timeAgo     = c.last_message_at ? dayjs(c.last_message_at).fromNow(true) : '';

  return (
    <UnstyledButton
      component={Link}
      href={`/conversations/${c.id}`}
      style={{
        display: 'block',
        padding: '11px 16px 11px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
        borderLeft: `3px solid ${isActive ? '#6366f1' : PRIORITY_STRIP[c.priority] ?? 'transparent'}`,
        transition: 'background 0.12s ease',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      <Group gap="sm" wrap="nowrap">
        {/* Avatar with ticket/online indicator */}
        <Box style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar size={36} radius="xl" style={{ background: avatarColor, fontWeight: 700, fontSize: 13, color: '#fff' }}>
            {initials}
          </Avatar>
          {c.is_ticket && (
            <Box style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 16, height: 16, borderRadius: '50%',
              background: '#f59e0b',
              border: '2px solid #090e18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 800, color: '#fff',
            }}>
              T
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box flex={1} style={{ overflow: 'hidden', minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap" mb={2}>
            <Text size="sm" fw={isActive ? 700 : 600} truncate
              style={{ color: isActive ? '#e0e7ff' : '#cbd5e1' }}>
              {displayName}
            </Text>
            <Text size="10px" c="dimmed" style={{ flexShrink: 0, marginLeft: 4 }}>
              {timeAgo}
            </Text>
          </Group>

          <Text size="xs" truncate mb={5}
            style={{ color: '#4b5563', lineHeight: 1.4, maxWidth: '95%' }}>
            {preview}
          </Text>

          <Group gap={4} wrap="nowrap">
            <Badge
              size="xs"
              color={STATUS_COLORS[c.status]}
              variant="light"
              style={{ textTransform: 'capitalize', flexShrink: 0 }}
            >
              {c.status}
            </Badge>
            {c.priority === 'urgent' && (
              <Badge size="xs" color="red" variant="filled" style={{ flexShrink: 0 }}>
                Urgent
              </Badge>
            )}
            {c.priority === 'high' && (
              <Badge size="xs" color="orange" variant="light" style={{ flexShrink: 0 }}>
                High
              </Badge>
            )}
            {c.labels?.slice(0, 2).map((l) => (
              <Badge
                key={l.id}
                size="xs"
                variant="dot"
                style={{ '--badge-dot-color': l.color, flexShrink: 0 } as React.CSSProperties}
              >
                {l.name}
              </Badge>
            ))}
            {c.assigned_agent && (
              <Text size="10px" c="dimmed" truncate ml="auto">
                {c.assigned_agent.name.split(' ')[0]}
              </Text>
            )}
          </Group>
        </Box>
      </Group>
    </UnstyledButton>
  );
}
