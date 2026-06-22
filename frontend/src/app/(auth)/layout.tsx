'use client';

import { Box, Group, Text } from '@mantine/core';
import { IconHeadset, IconCheck } from '@tabler/icons-react';

const HIGHLIGHTS = [
  'Live chat widget — one script tag',
  'Real-time bidirectional messaging',
  'Smart auto-ticketing when offline',
  'CSAT ratings & analytics built-in',
  'Multi-workspace SaaS architecture',
];

const AVATARS = ['#6366f1', '#8b5cf6', '#0891b2', '#059669', '#d97706'];
const NAMES   = ['Sarah C.', 'Marcus O.', 'Aisha N.', 'James K.', 'Priya M.'];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box style={{ display: 'flex', minHeight: '100vh', background: 'var(--rh-bg)' }}>

      {/* ── Left panel (hidden on mobile) ─────────────────────── */}
      <Box
        visibleFrom="md"
        style={{
          width: 480, flexShrink: 0, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(160deg, #0f0f23 0%, #111827 50%, #0a0f1e 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          padding: '48px 48px 40px',
        }}
      >
        {/* Gradient blobs */}
        <Box style={{
          position: 'absolute', top: '-15%', left: '-20%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box style={{
          position: 'absolute', bottom: '-10%', right: '-20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Noise overlay */}
        <Box style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Group gap="xs" mb={56} style={{ position: 'relative' }}>
          <Box style={{
            width: 36, height: 36, borderRadius: 11,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>
            <IconHeadset size={20} color="#fff" />
          </Box>
          <Text fw={800} size="lg" style={{ color: '#fff', letterSpacing: '-0.5px' }}>ReplyHub</Text>
        </Group>

        {/* Headline */}
        <Box style={{ position: 'relative', flex: 1 }}>
          <Text style={{
            fontSize: 36, fontWeight: 900, lineHeight: 1.1,
            letterSpacing: '-1.5px', color: '#fff', marginBottom: 12,
          }}>
            Support your customers{' '}
            <span style={{
              background: 'linear-gradient(135deg, #818cf8, #c4b5fd)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              in real time
            </span>
          </Text>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.7, marginBottom: 40, maxWidth: 320 }}>
            Join teams who reply faster, resolve smarter, and never let a conversation slip through the cracks.
          </Text>

          {/* Feature bullets */}
          <Box style={{ marginBottom: 48 }}>
            {HIGHLIGHTS.map(h => (
              <Group key={h} gap="xs" mb="xs">
                <Box style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconCheck size={11} color="#818cf8" />
                </Box>
                <Text size="sm" style={{ color: '#94a3b8' }}>{h}</Text>
              </Group>
            ))}
          </Box>

          {/* Social proof */}
          <Box style={{
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
          }}>
            <Group gap="xs" mb={10}>
              {AVATARS.map((color, i) => (
                <Box key={i} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: color,
                  border: '2px solid #111827',
                  marginLeft: i > 0 ? -8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#fff',
                }}>
                  {NAMES[i][0]}
                </Box>
              ))}
              <Text size="xs" c="dimmed" ml={4}>+200 teams</Text>
            </Group>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
              "ReplyHub cut our average response time from 4 hours to under 3 minutes."
            </Text>
            <Text size="xs" style={{ color: '#6366f1', marginTop: 4, fontWeight: 600 }}>
              — Sarah Chen, Head of Support @ Orbit
            </Text>
          </Box>
        </Box>

        {/* Bottom badge */}
        <Group gap={6} mt={32} style={{ position: 'relative' }}>
          <Box style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <Text size="xs" c="dimmed">All systems operational · 99.9% uptime</Text>
        </Group>
      </Box>

      {/* ── Right panel (the form) ─────────────────────────────── */}
      <Box style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: 'var(--rh-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow behind the form */}
        <Box style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
