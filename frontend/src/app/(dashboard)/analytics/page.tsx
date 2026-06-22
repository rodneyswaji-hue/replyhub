'use client';

import { AreaChart } from '@mantine/charts';
import {
  Avatar, Badge, Box, Group, Loader, NumberFormatter, Paper, Progress,
  RingProgress, Select, SimpleGrid, Stack, Text, ThemeIcon,
} from '@mantine/core';
import {
  IconArrowUpRight, IconArrowDownRight, IconClock, IconMessage2,
  IconCheck, IconStar, IconTrendingUp, IconUsers,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import type { AnalyticsOverview } from '@/types';

const formatDuration = (secs: number) => {
  if (secs < 60)   return `${Math.round(secs)}s`;
  if (secs < 3600) return `${Math.round(secs / 60)}m`;
  return `${(secs / 3600).toFixed(1)}h`;
};

const AGENT_PALETTE = ['#6366f1', '#8b5cf6', '#0891b2', '#059669', '#d97706'];

export default function AnalyticsPage() {
  const [days, setDays] = useState('30');

  const { data: overview, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics-overview', days],
    queryFn:  () => api.get('/analytics/overview', { params: { days } }).then((r) => r.data),
  });

  const { data: volume = [] } = useQuery({
    queryKey: ['analytics-volume', days],
    queryFn:  () => api.get('/analytics/volume', { params: { days } }).then((r) => r.data),
  });

  const { data: agentPerf = [] } = useQuery({
    queryKey: ['analytics-agents', days],
    queryFn:  () => api.get('/analytics/agents', { params: { days } }).then((r) => r.data),
  });

  const csatPct = overview?.csat_avg ? Math.round(overview.csat_avg * 20) : 0;
  const resolutionRate = overview
    ? Math.round(((overview.resolved_conversations ?? 0) / (overview.total_conversations || 1)) * 100)
    : 0;

  return (
    <Box style={{ background: '#090e18', minHeight: '100vh', padding: '32px 32px 60px' }}>
      {/* ── Header ── */}
      <Group justify="space-between" mb={32} align="flex-end">
        <Box>
          <Text fw={900} size="xl" style={{ color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: 4 }}>
            Analytics
          </Text>
          <Text size="sm" c="dimmed">
            Track your team&apos;s performance and customer satisfaction
          </Text>
        </Box>
        <Select
          value={days}
          onChange={(v) => v && setDays(v)}
          data={[
            { value: '7',  label: 'Last 7 days'  },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
          ]}
          w={150}
          size="sm"
          styles={{
            input: {
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0',
            },
          }}
        />
      </Group>

      {isLoading ? (
        <Box ta="center" py={80}><Loader color="indigo" /></Box>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb={24}>
            <KpiCard
              label="Total conversations"
              value={overview?.total_conversations ?? 0}
              icon={<IconMessage2 size={18} />}
              color="#6366f1"
              bgColor="rgba(99,102,241,0.1)"
              trend={+12}
            />
            <KpiCard
              label="Avg first reply"
              value={formatDuration(overview?.avg_first_reply_secs ?? 0)}
              icon={<IconClock size={18} />}
              color="#22d3ee"
              bgColor="rgba(34,211,238,0.1)"
              isText
              trend={-8}
              trendLabel="faster"
            />
            <KpiCard
              label="Resolved"
              value={overview?.resolved_conversations ?? 0}
              icon={<IconCheck size={18} />}
              color="#22c55e"
              bgColor="rgba(34,197,94,0.1)"
              trend={+5}
            />
            <KpiCard
              label="CSAT score"
              value={csatPct ? `${csatPct}%` : 'N/A'}
              icon={<IconStar size={18} />}
              color="#f59e0b"
              bgColor="rgba(245,158,11,0.1)"
              isText
              trend={+3}
              trendLabel="pts"
            />
          </SimpleGrid>

          {/* ── Queue + Resolution ── */}
          <SimpleGrid cols={{ base: 1, md: 2 }} mb={24}>
            {/* Queue status */}
            <Paper p="xl" style={{
              background: '#0d1220',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
            }}>
              <Group justify="space-between" mb="lg">
                <Text fw={700} style={{ color: '#e2e8f0' }}>Queue status</Text>
                <ThemeIcon size="sm" variant="light" color="indigo">
                  <IconMessage2 size={14} />
                </ThemeIcon>
              </Group>
              <Group gap="xl" align="center">
                <RingProgress
                  size={110}
                  thickness={10}
                  roundCaps
                  sections={[
                    { value: overview ? (overview.open_conversations / (overview.total_conversations || 1)) * 100 : 0, color: '#6366f1', tooltip: `Open: ${overview?.open_conversations ?? 0}` },
                    { value: overview ? (overview.pending_conversations / (overview.total_conversations || 1)) * 100 : 0, color: '#f59e0b', tooltip: `Pending: ${overview?.pending_conversations ?? 0}` },
                    { value: resolutionRate, color: '#22c55e', tooltip: `Resolved: ${overview?.resolved_conversations ?? 0}` },
                  ]}
                  label={
                    <Text ta="center" fw={800} style={{ color: '#fff', fontSize: 18 }}>
                      {resolutionRate}%
                    </Text>
                  }
                />
                <Stack gap="xs" flex={1}>
                  {[
                    { label: 'Open',     color: '#6366f1', count: overview?.open_conversations ?? 0 },
                    { label: 'Pending',  color: '#f59e0b', count: overview?.pending_conversations ?? 0 },
                    { label: 'Resolved', color: '#22c55e', count: overview?.resolved_conversations ?? 0 },
                  ].map(({ label, color, count }) => (
                    <Box key={label}>
                      <Group justify="space-between" mb={4}>
                        <Group gap={6}>
                          <Box style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                          <Text size="xs" c="dimmed">{label}</Text>
                        </Group>
                        <Text size="xs" fw={700} style={{ color: '#e2e8f0' }}>{count}</Text>
                      </Group>
                      <Progress
                        value={overview ? (count / (overview.total_conversations || 1)) * 100 : 0}
                        color={color} size={4} radius="xl"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Group>
            </Paper>

            {/* Response times */}
            <Paper p="xl" style={{
              background: '#0d1220',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
            }}>
              <Group justify="space-between" mb="lg">
                <Text fw={700} style={{ color: '#e2e8f0' }}>Response times</Text>
                <ThemeIcon size="sm" variant="light" color="cyan">
                  <IconClock size={14} />
                </ThemeIcon>
              </Group>
              <Stack gap="xl">
                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" c="dimmed">First reply time</Text>
                    <Text fw={800} size="xl" style={{ color: '#6366f1', letterSpacing: '-1px' }}>
                      {formatDuration(overview?.avg_first_reply_secs ?? 0)}
                    </Text>
                  </Group>
                  <Progress
                    value={Math.min(100, ((overview?.avg_first_reply_secs ?? 0) / 300) * 100)}
                    color="indigo" size={6} radius="xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
                  <Text size="xs" c="dimmed" mt={4}>Target: under 5 min</Text>
                </Box>
                <Box>
                  <Group justify="space-between" mb={8}>
                    <Text size="sm" c="dimmed">Resolution time</Text>
                    <Text fw={800} size="xl" style={{ color: '#22c55e', letterSpacing: '-1px' }}>
                      {formatDuration(overview?.avg_resolution_secs ?? 0)}
                    </Text>
                  </Group>
                  <Progress
                    value={Math.min(100, ((overview?.avg_resolution_secs ?? 0) / 3600) * 100)}
                    color="green" size={6} radius="xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
                  <Text size="xs" c="dimmed" mt={4}>Target: under 1 hour</Text>
                </Box>
              </Stack>
            </Paper>
          </SimpleGrid>

          {/* ── Volume chart ── */}
          {volume.length > 0 && (
            <Paper p="xl" mb={24} style={{
              background: '#0d1220',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
            }}>
              <Group justify="space-between" mb="lg">
                <Box>
                  <Text fw={700} style={{ color: '#e2e8f0', marginBottom: 2 }}>
                    Conversation volume
                  </Text>
                  <Text size="xs" c="dimmed">Total vs resolved over time</Text>
                </Box>
                <Group gap="lg">
                  {[{ label: 'Total', color: '#6366f1' }, { label: 'Resolved', color: '#22c55e' }].map(l => (
                    <Group key={l.label} gap={6}>
                      <Box style={{ width: 10, height: 3, borderRadius: 2, background: l.color }} />
                      <Text size="xs" c="dimmed">{l.label}</Text>
                    </Group>
                  ))}
                </Group>
              </Group>
              <AreaChart
                h={200}
                data={volume.map((d: { date: string; total: number; resolved: number }) => ({
                  date:     d.date,
                  Total:    d.total,
                  Resolved: d.resolved,
                }))}
                dataKey="date"
                series={[
                  { name: 'Total',    color: 'indigo.5' },
                  { name: 'Resolved', color: 'green.5'  },
                ]}
                curveType="monotone"
                fillOpacity={0.1}
                gridAxis="none"
                withDots={false}
              />
            </Paper>
          )}

          {/* ── Agent performance ── */}
          {agentPerf.length > 0 && (
            <Paper p="xl" style={{
              background: '#0d1220',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
            }}>
              <Group justify="space-between" mb="lg">
                <Box>
                  <Text fw={700} style={{ color: '#e2e8f0', marginBottom: 2 }}>Agent performance</Text>
                  <Text size="xs" c="dimmed">Ranked by resolution rate</Text>
                </Box>
                <ThemeIcon size="sm" variant="light" color="indigo">
                  <IconUsers size={14} />
                </ThemeIcon>
              </Group>
              <Stack gap="xs">
                {agentPerf.map((agent: {
                  id: number; name: string; status: string;
                  total_assigned: number; resolved: number; avg_first_reply: number | null;
                }, idx: number) => {
                  const resolveRate = agent.total_assigned
                    ? Math.round((agent.resolved / agent.total_assigned) * 100) : 0;
                  const color = AGENT_PALETTE[idx % AGENT_PALETTE.length];
                  const statusColor = agent.status === 'online' ? '#22c55e' : agent.status === 'away' ? '#f59e0b' : '#374155';
                  return (
                    <Box key={agent.id} style={{
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 10,
                    }}>
                      <Group justify="space-between" mb={8}>
                        <Group gap="sm">
                          <Box style={{ position: 'relative' }}>
                            <Avatar size={32} radius="xl" style={{ background: color, color: '#fff', fontWeight: 700, fontSize: 13 }}>
                              {agent.name[0]}
                            </Avatar>
                            <Box style={{
                              position: 'absolute', bottom: 0, right: 0,
                              width: 10, height: 10, borderRadius: '50%',
                              background: statusColor,
                              border: '2px solid #0d1220',
                            }} />
                          </Box>
                          <Box>
                            <Text size="sm" fw={600} style={{ color: '#e2e8f0' }}>{agent.name}</Text>
                            <Text size="xs" c="dimmed">
                              {agent.total_assigned} assigned · {agent.resolved} resolved
                            </Text>
                          </Box>
                        </Group>
                        <Group gap="md">
                          <Box ta="right">
                            <Text size="xs" c="dimmed">Avg reply</Text>
                            <Text size="sm" fw={700} style={{ color: '#818cf8' }}>
                              {agent.avg_first_reply ? formatDuration(agent.avg_first_reply) : '—'}
                            </Text>
                          </Box>
                          <Box ta="right" w={48}>
                            <Text size="xs" c="dimmed">Rate</Text>
                            <Text size="sm" fw={700} style={{ color: resolveRate >= 70 ? '#22c55e' : resolveRate >= 40 ? '#f59e0b' : '#ef4444' }}>
                              {resolveRate}%
                            </Text>
                          </Box>
                        </Group>
                      </Group>
                      <Progress
                        value={resolveRate}
                        color={resolveRate >= 70 ? 'green' : resolveRate >= 40 ? 'yellow' : 'red'}
                        size={4} radius="xl"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

/* ── KPI Card ──────────────────────────────────────────────── */
function KpiCard({
  label, value, icon, color, bgColor, trend, trendLabel = '%', isText = false,
}: {
  label: string; value: number | string; icon: React.ReactNode;
  color: string; bgColor: string; trend?: number; trendLabel?: string; isText?: boolean;
}) {
  const positive = (trend ?? 0) > 0;
  const neutral  = trend === 0 || trend === undefined;
  return (
    <Paper p="lg" style={{
      background: '#0d1220',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle corner glow */}
      <Box style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <Group justify="space-between" mb={16}>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.06em' }}>
          {label}
        </Text>
        <Box style={{
          width: 34, height: 34, borderRadius: 10,
          background: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </Box>
      </Group>
      {isText ? (
        <Text fw={900} style={{ fontSize: 32, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>
          {value}
        </Text>
      ) : (
        <Text fw={900} style={{ fontSize: 32, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1 }}>
          <NumberFormatter value={Number(value)} thousandSeparator />
        </Text>
      )}
      {!neutral && trend !== undefined && (
        <Group gap={4} mt={8}>
          <Box style={{ color: positive ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center' }}>
            {positive ? <IconArrowUpRight size={14} /> : <IconArrowDownRight size={14} />}
          </Box>
          <Text size="xs" style={{ color: positive ? '#22c55e' : '#ef4444' }}>
            {positive ? '+' : ''}{trend}{trendLabel}
          </Text>
          <Text size="xs" c="dimmed">vs last period</Text>
        </Group>
      )}
    </Paper>
  );
}
