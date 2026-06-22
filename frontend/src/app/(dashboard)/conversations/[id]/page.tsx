'use client';

import {
  ActionIcon, Avatar, Badge, Box, Button, Divider, Group, Kbd, Loader,
  Menu, Paper, ScrollArea, Select, Stack, Text, Textarea, Tooltip,
} from '@mantine/core';
import {
  IconAlertTriangle, IconArrowLeft, IconBolt, IconCheck, IconChevronDown,
  IconDotsVertical, IconLock, IconSend, IconTicket,
  IconUser, IconWorld, IconMapPin, IconClock, IconCalendar, IconStar,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';
import api from '@/lib/api';
import { getEcho } from '@/lib/echo';
import { useAuthStore } from '@/stores/auth';
import type { Conversation, Message, User, CannedResponse, TypingEvent } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  open: 'green', pending: 'yellow', resolved: 'blue', closed: 'gray',
};

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'normal', label: 'Normal' },
  { value: 'high',   label: 'High'   },
  { value: 'urgent', label: 'Urgent' },
];

const AVATAR_PALETTE = ['#6366f1', '#8b5cf6', '#0891b2', '#059669', '#d97706', '#ec4899'];
function contactColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [convId, setConvId] = useState<string>('');
  useEffect(() => { params.then((p) => setConvId(p.id)); }, [params]);

  const { user, workspace } = useAuthStore();
  const queryClient = useQueryClient();
  const [message,      setMessage]      = useState('');
  const [isPrivate,    setIsPrivate]    = useState(false);
  const [typing,       setTyping]       = useState<TypingEvent | null>(null);
  const [showCanned,   setShowCanned]   = useState(false);
  const [cannedSearch, setCannedSearch] = useState('');
  const scrollRef   = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: conversation, isLoading } = useQuery<Conversation>({
    queryKey: ['conversation', convId],
    queryFn:  () => api.get(`/conversations/${convId}`).then((r) => r.data),
    enabled:  !!convId,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ['messages', convId],
    queryFn:  () => api.get(`/conversations/${convId}/messages`).then((r) => r.data),
    enabled:  !!convId,
  });

  const { data: agents = [] } = useQuery<User[]>({
    queryKey: ['agents'],
    queryFn:  () => api.get('/workspace/agents').then((r) => r.data),
  });

  const { data: canned = [] } = useQuery<CannedResponse[]>({
    queryKey: ['canned'],
    queryFn:  () => api.get('/canned-responses').then((r) => r.data),
  });

  useEffect(() => {
    if (!convId) return;
    const echo    = getEcho();
    const channel = echo.private(`conversation.${convId}`);
    channel.listen('.MessageSent',        () => { refetchMessages(); queryClient.invalidateQueries({ queryKey: ['conversation', convId] }); });
    channel.listen('.ConversationUpdated',() => { queryClient.invalidateQueries({ queryKey: ['conversation', convId] }); });
    channel.listen('.TypingIndicator',    (e: TypingEvent) => {
      if (e.sender_type !== 'agent') {
        setTyping(e.is_typing ? e : null);
        if (e.is_typing) {
          if (typingTimer.current) clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setTyping(null), 4000);
        }
      }
    });
    return () => { echo.leave(`conversation.${convId}`); };
  }, [convId, refetchMessages, queryClient]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (body: { content: string; is_private: boolean }) =>
      api.post(`/conversations/${convId}/messages`, body),
    onSuccess: () => { setMessage(''); refetchMessages(); },
    onError:   () => notifications.show({ color: 'red', message: 'Failed to send message' }),
  });

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Conversation>) => api.patch(`/conversations/${convId}`, body),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['conversation', convId] }),
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({ content: message.trim(), is_private: isPrivate });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTyping = useCallback(() => {
    api.post(`/conversations/${convId}/typing`, { is_typing: true }).catch(() => {});
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      api.post(`/conversations/${convId}/typing`, { is_typing: false }).catch(() => {});
    }, 3000);
  }, [convId]);

  const filteredCanned = canned.filter(
    (c) => !cannedSearch || c.title.toLowerCase().includes(cannedSearch.toLowerCase()) || c.shortcut?.toLowerCase().includes(cannedSearch.toLowerCase())
  );

  if (!convId || isLoading) {
    return (
      <Box style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack align="center" gap="sm">
          <Loader color="indigo" size="md" />
          <Text size="xs" c="dimmed">Loading conversation…</Text>
        </Stack>
      </Box>
    );
  }
  if (!conversation) return null;

  const contact      = conversation.contact;
  const session      = conversation.visitor_session;
  const contactName  = contact?.name ?? contact?.email ?? 'Anonymous visitor';
  const avatarColor  = contactColor(contactName);

  return (
    <Box style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#090e18' }}>

      {/* ── Message thread ── */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <Box px="lg" py="sm" style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, #0d1220 0%, #0a0f1c 100%)',
          flexShrink: 0,
        }}>
          <Group justify="space-between">
            <Group gap="sm" wrap="nowrap">
              <ActionIcon component={Link} href="/conversations" variant="subtle" color="gray" size="sm">
                <IconArrowLeft size={16} />
              </ActionIcon>
              <Avatar size={38} radius="xl" style={{ background: avatarColor, color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {contactName[0].toUpperCase()}
              </Avatar>
              <Box style={{ minWidth: 0 }}>
                <Text fw={700} size="sm" truncate style={{ color: '#f1f5f9', letterSpacing: '-0.2px' }}>
                  {contactName}
                </Text>
                <Group gap={6} wrap="nowrap">
                  <Badge size="xs" color={STATUS_COLORS[conversation.status]} variant="light">
                    {conversation.status}
                  </Badge>
                  {conversation.is_ticket && (
                    <Badge size="xs" color="orange" variant="light" leftSection={<IconTicket size={9} />}>
                      ticket
                    </Badge>
                  )}
                  {conversation.labels?.map((l) => (
                    <Badge key={l.id} size="xs" variant="dot" style={{ '--badge-dot-color': l.color } as React.CSSProperties}>
                      {l.name}
                    </Badge>
                  ))}
                </Group>
              </Box>
            </Group>

            <Group gap="xs">
              {conversation.status !== 'resolved' && (
                <Button
                  size="xs"
                  leftSection={<IconCheck size={12} />}
                  loading={updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ status: 'resolved' })}
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 600 }}
                >
                  Resolve
                </Button>
              )}
              <Menu shadow="xl" position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconDotsVertical size={15} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Menu.Item leftSection={<IconTicket size={13} />}
                    style={{ color: '#e2e8f0', fontSize: 13 }}
                    onClick={() => updateMutation.mutate({ is_ticket: !conversation.is_ticket })}>
                    {conversation.is_ticket ? 'Remove ticket flag' : 'Mark as ticket'}
                  </Menu.Item>
                  <Menu.Item leftSection={<IconAlertTriangle size={13} />} color="red"
                    style={{ fontSize: 13 }}
                    onClick={() => updateMutation.mutate({ status: 'closed' })}>
                    Close conversation
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Box>

        {/* Messages */}
        <ScrollArea flex={1} viewportRef={scrollRef} px="xl" py="lg"
          style={{ background: '#090e18' }}>
          <Stack gap="md">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} currentUser={user!} />
            ))}
            {typing && (
              <Group gap="sm" align="flex-end">
                <Avatar size={28} radius="xl" style={{ background: '#374155', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                  {typing.sender_name[0]?.toUpperCase()}
                </Avatar>
                <Box style={{
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px 14px 14px 4px',
                }}>
                  <TypingDots />
                </Box>
              </Group>
            )}
          </Stack>
        </ScrollArea>

        {/* Canned responses */}
        {showCanned && (
          <Box px="xl" pb="sm" style={{ flexShrink: 0 }}>
            <Box style={{
              background: '#111827',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}>
              <Box p="sm" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Group gap="xs">
                  <IconBolt size={14} color="#6366f1" />
                  <input
                    autoFocus
                    placeholder="Search canned responses…"
                    value={cannedSearch}
                    onChange={(e) => setCannedSearch(e.target.value)}
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: '#e2e8f0', fontSize: 13,
                    }}
                  />
                </Group>
              </Box>
              <ScrollArea mah={220}>
                {filteredCanned.length === 0 ? (
                  <Text size="xs" c="dimmed" p="sm">No canned responses found</Text>
                ) : (
                  filteredCanned.map((cr) => (
                    <Box
                      key={cr.id}
                      onClick={() => { setMessage(cr.content); setShowCanned(false); setCannedSearch(''); }}
                      style={{
                        padding: '10px 14px', cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <Group justify="space-between" mb={2}>
                        <Text size="sm" fw={600} style={{ color: '#e2e8f0' }}>{cr.title}</Text>
                        {cr.shortcut && (
                          <Kbd size="xs" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: 10 }}>
                            /{cr.shortcut}
                          </Kbd>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed" truncate>{cr.content}</Text>
                    </Box>
                  ))
                )}
              </ScrollArea>
            </Box>
          </Box>
        )}

        {/* Compose area */}
        <Box style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: '#0d1220',
          padding: '12px 20px 16px',
          flexShrink: 0,
        }}>
          {/* Reply / Note toggle */}
          <Group mb={10} gap={6}>
            <Button
              size="xs" variant={!isPrivate ? 'filled' : 'subtle'}
              color={!isPrivate ? 'indigo' : 'gray'}
              onClick={() => setIsPrivate(false)}
              style={!isPrivate ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' } : { color: '#4b5563' }}
            >
              Reply
            </Button>
            <Button
              size="xs" variant={isPrivate ? 'filled' : 'subtle'}
              color={isPrivate ? 'yellow' : 'gray'}
              leftSection={<IconLock size={11} />}
              onClick={() => setIsPrivate(true)}
              style={isPrivate ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' } : { color: '#4b5563' }}
            >
              Internal note
            </Button>
          </Group>

          <Box style={{ position: 'relative' }}>
            <Textarea
              placeholder={isPrivate
                ? '💬 Add an internal note — only your team can see this…'
                : 'Type a reply… (Enter to send · Shift+Enter for new line)'}
              value={message}
              onChange={(e) => { setMessage(e.currentTarget.value); handleTyping(); }}
              onKeyDown={handleKeyDown}
              minRows={3}
              maxRows={8}
              autosize
              styles={{
                input: {
                  background:    isPrivate ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.04)',
                  border:        `1px solid ${isPrivate ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:  12,
                  paddingRight:  96,
                  paddingBottom: 44,
                  color:         '#e2e8f0',
                  fontSize:      13,
                  lineHeight:    1.6,
                  resize:        'none',
                  '&::placeholder': { color: '#374155' },
                },
              }}
            />
            <Group gap="xs" style={{ position: 'absolute', bottom: 10, right: 12 }}>
              <Tooltip label="Canned responses (⚡)" position="top">
                <ActionIcon
                  variant={showCanned ? 'filled' : 'subtle'}
                  color={showCanned ? 'indigo' : 'gray'}
                  size="sm"
                  onClick={() => setShowCanned((v) => !v)}
                  style={showCanned ? { background: 'rgba(99,102,241,0.2)' } : {}}
                >
                  <IconBolt size={14} />
                </ActionIcon>
              </Tooltip>
              <ActionIcon
                size="sm"
                loading={sendMutation.isPending}
                disabled={!message.trim()}
                onClick={handleSend}
                style={{
                  background: message.trim()
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(255,255,255,0.05)',
                  border: 'none',
                  boxShadow: message.trim() ? '0 2px 10px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                <IconSend size={14} color={message.trim() ? '#fff' : '#374155'} />
              </ActionIcon>
            </Group>
          </Box>
        </Box>
      </Box>

      {/* ── Right panel ── */}
      <Box w={272} style={{
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        background: '#0a0f1c',
        overflowY: 'auto',
        flexShrink: 0,
      }}>
        {/* Assign + Priority */}
        <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.1em', marginBottom: 10 }}>
            Assignment
          </Text>
          <Stack gap="sm">
            <Select
              placeholder="Unassigned"
              value={conversation.assigned_to?.toString() ?? null}
              onChange={(v) => updateMutation.mutate({ assigned_to: v ? Number(v) : null })}
              data={[{ value: '', label: 'Unassigned' }, ...agents.map((a) => ({ value: a.id.toString(), label: a.name }))]}
              clearable
              size="sm"
              label={<Text size="10px" c="dimmed" fw={600}>Assigned to</Text>}
              styles={{
                input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 12 },
              }}
            />
            <Select
              value={conversation.priority}
              onChange={(v) => v && updateMutation.mutate({ priority: v as Conversation['priority'] })}
              data={PRIORITY_OPTIONS}
              size="sm"
              label={<Text size="10px" c="dimmed" fw={600}>Priority</Text>}
              styles={{
                input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 12 },
              }}
            />
          </Stack>
        </Box>

        {/* Contact */}
        {contact && (
          <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.1em', marginBottom: 10 }}>
              Contact
            </Text>
            <Group gap="sm" mb="md">
              <Avatar size={36} radius="xl" style={{ background: avatarColor, color: '#fff', fontWeight: 700 }}>
                {contactName[0].toUpperCase()}
              </Avatar>
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" fw={600} truncate style={{ color: '#e2e8f0' }}>
                  {contact.name ?? 'Anonymous'}
                </Text>
                {contact.email && (
                  <Text size="xs" c="dimmed" truncate>{contact.email}</Text>
                )}
              </Box>
            </Group>
            {contact.browser && (
              <SideRow icon={<IconWorld size={12} />} label={`${contact.browser} · ${contact.os ?? ''}`} />
            )}
          </Box>
        )}

        {/* Visitor session */}
        {session && (
          <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.1em', marginBottom: 10 }}>
              Visitor session
            </Text>
            <Stack gap="xs">
              {session.current_url && (
                <SideRow icon={<IconMapPin size={12} />} label={session.current_url} />
              )}
              {session.browser && (
                <SideRow icon={<IconWorld size={12} />} label={`${session.browser} · ${session.os ?? ''}`} />
              )}
              {session.country && (
                <SideRow icon={<IconMapPin size={12} />} label={`${session.city ? session.city + ', ' : ''}${session.country}`} />
              )}
            </Stack>
          </Box>
        )}

        {/* Timeline */}
        <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.1em', marginBottom: 10 }}>
            Timeline
          </Text>
          <Stack gap="xs">
            <SideRow icon={<IconCalendar size={12} />} label={`Created ${dayjs(conversation.created_at).fromNow()}`} />
            {conversation.first_reply_at && (
              <SideRow icon={<IconClock size={12} />} label={`First reply ${dayjs(conversation.first_reply_at).fromNow()}`} />
            )}
            {conversation.resolved_at && (
              <SideRow icon={<IconCheck size={12} />} label={`Resolved ${dayjs(conversation.resolved_at).fromNow()}`} />
            )}
          </Stack>
        </Box>

        {/* CSAT */}
        {conversation.csat_rating && (
          <Box p="md">
            <Text size="10px" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.1em', marginBottom: 10 }}>
              Customer satisfaction
            </Text>
            <Group gap={3} mb={8}>
              {[1, 2, 3, 4, 5].map((n) => (
                <IconStar
                  key={n} size={18}
                  style={{
                    fill: n <= (conversation.csat_rating?.rating ?? 0) ? '#f59e0b' : 'transparent',
                    color: n <= (conversation.csat_rating?.rating ?? 0) ? '#f59e0b' : '#374155',
                  }}
                />
              ))}
              <Text size="xs" c="dimmed" ml={4}>
                {conversation.csat_rating.rating}/5
              </Text>
            </Group>
            {conversation.csat_rating.feedback && (
              <Box style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
              }}>
                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{conversation.csat_rating.feedback}"
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ─── MessageBubble ─────────────────────────────────────── */
function MessageBubble({ message: msg, currentUser }: { message: Message; currentUser: User }) {
  const isAgent  = msg.sender_type === 'agent';
  const isMe     = isAgent && msg.sender_id === currentUser.id;
  const isNote   = msg.is_private || msg.type === 'note';
  const isSystem = msg.sender_type === 'system';

  if (isSystem) {
    return (
      <Box ta="center" py="xs">
        <Box style={{
          display: 'inline-block',
          padding: '4px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
        }}>
          <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>{msg.content}</Text>
        </Box>
      </Box>
    );
  }

  const senderName  = msg.sender?.name ?? (isAgent ? 'Agent' : 'Visitor');
  const avatarColor = contactColor(senderName);

  return (
    <Group align="flex-end" gap="sm" justify={isAgent ? 'flex-end' : 'flex-start'} wrap="nowrap">
      {!isAgent && (
        <Avatar size={30} radius="xl" style={{ background: '#374155', color: '#e2e8f0', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
          {senderName[0].toUpperCase()}
        </Avatar>
      )}

      <Box style={{ maxWidth: '72%' }}>
        {!isMe && (
          <Text size="10px" c="dimmed" mb={4} px={4}>
            {senderName}
          </Text>
        )}
        <Box style={{
          padding: '10px 14px',
          background: isNote
            ? 'rgba(245,158,11,0.1)'
            : isAgent
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
            : 'rgba(255,255,255,0.07)',
          borderRadius: isAgent ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          border: isNote
            ? '1px solid rgba(245,158,11,0.25)'
            : isAgent
            ? 'none'
            : '1px solid rgba(255,255,255,0.06)',
          boxShadow: isAgent ? '0 2px 12px rgba(79,70,229,0.2)' : 'none',
        }}>
          {isNote && (
            <Group gap={4} mb={6}>
              <IconLock size={10} color="#f59e0b" />
              <Text size="10px" style={{ color: '#f59e0b', fontWeight: 600 }}>Internal note</Text>
            </Group>
          )}
          <Text size="sm" style={{ color: isAgent ? '#fff' : '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
            {msg.content}
          </Text>
        </Box>
        <Text size="10px" c="dimmed" mt={4} ta={isAgent ? 'right' : 'left'} px={4}>
          {dayjs(msg.created_at).format('HH:mm')}
        </Text>
      </Box>

      {isAgent && (
        <Avatar size={30} src={msg.sender?.avatar} radius="xl"
          style={{ background: avatarColor, color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
          {(msg.sender?.name ?? 'A')[0].toUpperCase()}
        </Avatar>
      )}
    </Group>
  );
}

/* ─── TypingDots ────────────────────────────────────────── */
function TypingDots() {
  return (
    <Group gap={4} align="center" style={{ height: 18 }}>
      {[0, 1, 2].map((i) => (
        <Box key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: '#6366f1',
          animation: `rhBounce 1.3s ease-in-out infinite`,
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
      <style>{`@keyframes rhBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
    </Group>
  );
}

/* ─── SideRow ───────────────────────────────────────────── */
function SideRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Group gap="xs" wrap="nowrap" align="flex-start">
      <Box style={{ color: '#374155', marginTop: 1, flexShrink: 0 }}>{icon}</Box>
      <Text size="xs" c="dimmed" style={{ lineHeight: 1.5, wordBreak: 'break-word' }}>{label}</Text>
    </Group>
  );
}
