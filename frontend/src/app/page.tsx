'use client';

import {
  Box, Button, Container, Group, SimpleGrid, Stack, Text, Title, Badge, Anchor,
  ThemeIcon, Avatar,
} from '@mantine/core';
import Link from 'next/link';
import {
  IconArrowRight, IconBoltFilled, IconChartBar, IconHeadset, IconMessage2,
  IconShieldCheck, IconStar, IconTicket, IconUsers, IconCheck, IconSparkles,
  IconBrandTwitter, IconQuote,
} from '@tabler/icons-react';

/* ─── Dashboard Mockup SVG ─────────────────────────────────── */
function DashboardMockup() {
  return (
    <svg viewBox="0 0 900 560" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 860, display: 'block' }}>
      {/* Window chrome */}
      <rect width="900" height="560" rx="16" fill="#0e1220" />
      <rect width="900" height="40" rx="0" fill="#111827" />
      <rect width="900" height="40" rx="16" fill="#111827" />
      <rect y="24" width="900" height="16" fill="#111827" />
      <circle cx="24" cy="20" r="6" fill="#ef4444" />
      <circle cx="44" cy="20" r="6" fill="#f59e0b" />
      <circle cx="64" cy="20" r="6" fill="#22c55e" />
      <rect x="88" y="10" width="200" height="20" rx="6" fill="#1e2737" />

      {/* Sidebar */}
      <rect x="0" y="40" width="200" height="520" fill="#090e18" />
      {/* Logo */}
      <rect x="16" y="56" width="32" height="32" rx="8" fill="url(#logoGrad)" />
      <text x="56" y="77" fill="#f1f5f9" fontFamily="Inter" fontSize="14" fontWeight="700">ReplyHub</text>
      {/* Nav items */}
      {[['Conversations', 96, true], ['Tickets', 130, false], ['Analytics', 164, false], ['Agents', 198, false], ['Settings', 232, false]].map(([label, y, active]) => (
        <g key={String(label)}>
          {active && <rect x="8" y={Number(y) - 6} width="184" height="28" rx="8" fill="rgba(99,102,241,0.15)" />}
          <rect x="20" y={Number(y) - 2} width="14" height="14" rx="3" fill={active ? '#6366f1' : '#374155'} />
          <text x="44" y={Number(y) + 9} fill={active ? '#e0e7ff' : '#64748b'} fontFamily="Inter" fontSize="12" fontWeight={active ? '600' : '400'}>{String(label)}</text>
          {active && <rect x="192" y={Number(y) - 6} width="3" height="28" rx="2" fill="#6366f1" />}
        </g>
      ))}
      {/* Online badge */}
      <rect x="12" y="480" width="176" height="36" rx="10" fill="#0d1f0d" />
      <circle cx="28" cy="498" r="6" fill="#22c55e" />
      <text x="42" y="503" fill="#86efac" fontFamily="Inter" fontSize="11">3 agents online</text>

      {/* Conversation list panel */}
      <rect x="200" y="40" width="240" height="520" fill="#0d1220" />
      <rect x="208" y="52" width="224" height="28" rx="8" fill="#1a2035" />
      <text x="224" y="71" fill="#64748b" fontFamily="Inter" fontSize="11">Search conversations…</text>

      {[
        { name: 'Aria Chen', msg: 'The export button isn\'t work…', time: '2m', unread: 3, online: true },
        { name: 'Marco Silva', msg: 'Can I change my billing plan?', time: '8m', unread: 0, online: false },
        { name: 'Fatima Al-Rashid', msg: 'Thanks, that fixed it! 🎉', time: '12m', unread: 0, online: true },
        { name: 'James Okonkwo', msg: 'I need a refund for order #…', time: '1h', unread: 1, online: false },
        { name: 'Priya Nair', msg: 'Typing…', time: '2h', unread: 0, online: true },
      ].map((c, i) => {
        const y = 96 + i * 70;
        const active = i === 0;
        return (
          <g key={c.name}>
            {active && <rect x="200" y={y - 8} width="240" height="66" fill="rgba(99,102,241,0.08)" />}
            <circle cx="224" cy={y + 16} r="20" fill={['#4f46e5','#7c3aed','#0891b2','#065f46','#b45309'][i]} />
            <text x="224" y={y + 21} fill="#fff" fontFamily="Inter" fontSize="11" fontWeight="700" textAnchor="middle">{c.name[0]}</text>
            {c.online && <circle cx="240" cy={y + 32} r="5" fill="#22c55e" stroke="#0d1220" strokeWidth="2" />}
            <text x="252" y={y + 10} fill="#e2e8f0" fontFamily="Inter" fontSize="12" fontWeight="600">{c.name}</text>
            <text x="412" y={y + 10} fill="#475569" fontFamily="Inter" fontSize="10" textAnchor="end">{c.time}</text>
            <text x="252" y={y + 26} fill={i === 4 ? '#6366f1' : '#64748b'} fontFamily="Inter" fontSize="11">{c.msg.length > 22 ? c.msg.slice(0, 22) + '…' : c.msg}</text>
            {c.unread > 0 && (
              <>
                <circle cx="410" cy={y + 22} r="9" fill="#6366f1" />
                <text x="410" y={y + 26} fill="#fff" fontFamily="Inter" fontSize="9" fontWeight="700" textAnchor="middle">{c.unread}</text>
              </>
            )}
          </g>
        );
      })}

      {/* Main chat panel */}
      <rect x="440" y="40" width="460" height="520" fill="#090e18" />
      {/* Chat header */}
      <rect x="440" y="40" width="460" height="56" fill="#0d1220" />
      <circle cx="468" cy="68" r="18" fill="#4f46e5" />
      <text x="468" y="73" fill="#fff" fontFamily="Inter" fontSize="10" fontWeight="700" textAnchor="middle">A</text>
      <text x="496" y="62" fill="#e2e8f0" fontFamily="Inter" fontSize="13" fontWeight="700">Aria Chen</text>
      <text x="496" y="78" fill="#22c55e" fontFamily="Inter" fontSize="10">● Online</text>
      <rect x="800" y="52" width="84" height="28" rx="8" fill="rgba(99,102,241,0.15)" />
      <text x="842" y="70" fill="#818cf8" fontFamily="Inter" fontSize="11" textAnchor="middle">Resolve</text>

      {/* Chat messages */}
      {/* Visitor bubble */}
      <rect x="452" y="116" width="220" height="44" rx="12" fill="#1a2035" />
      <text x="466" y="136" fill="#cbd5e1" fontFamily="Inter" fontSize="11">Hey! The export button on</text>
      <text x="466" y="152" fill="#cbd5e1" fontFamily="Inter" fontSize="11">my dashboard isn't working.</text>
      <text x="468" y="170" fill="#475569" fontFamily="Inter" fontSize="9">10:14 AM</text>

      {/* Agent bubble */}
      <rect x="628" y="184" width="256" height="56" rx="12" fill="url(#agentBubble)" />
      <text x="642" y="204" fill="#fff" fontFamily="Inter" fontSize="11">Hi Aria! Let me look into</text>
      <text x="642" y="220" fill="#fff" fontFamily="Inter" fontSize="11">that right away. Which browser</text>
      <text x="642" y="236" fill="#fff" fontFamily="Inter" fontSize="11">are you using?</text>
      <text x="876" y="252" fill="rgba(255,255,255,0.4)" fontFamily="Inter" fontSize="9" textAnchor="end">10:15 AM ✓✓</text>

      {/* Visitor bubble */}
      <rect x="452" y="268" width="180" height="30" rx="12" fill="#1a2035" />
      <text x="466" y="287" fill="#cbd5e1" fontFamily="Inter" fontSize="11">Chrome 124 on Mac.</text>
      <text x="468" y="306" fill="#475569" fontFamily="Inter" fontSize="9">10:16 AM</text>

      {/* Typing indicator */}
      <rect x="452" y="318" width="70" height="28" rx="14" fill="#1a2035" />
      <circle cx="470" cy="332" r="4" fill="#6366f1" />
      <circle cx="484" cy="332" r="4" fill="#8b5cf6" />
      <circle cx="498" cy="332" r="4" fill="#a78bfa" />

      {/* Reply box */}
      <rect x="440" y="462" width="460" height="98" fill="#0d1220" />
      <rect x="452" y="472" width="436" height="56" rx="10" fill="#1a2035" />
      <text x="468" y="503" fill="#475569" fontFamily="Inter" fontSize="11">Type a reply… (or /shortcut for canned responses)</text>
      <rect x="820" y="478" width="56" height="32" rx="8" fill="url(#logoGrad)" />
      <text x="848" y="499" fill="#fff" fontFamily="Inter" fontSize="11" fontWeight="700" textAnchor="middle">Send</text>

      {/* Right info panel strip */}
      <rect x="764" y="96" width="136" height="358" rx="0" fill="rgba(255,255,255,0.02)" />
      <text x="772" y="116" fill="#475569" fontFamily="Inter" fontSize="10" fontWeight="700">VISITOR INFO</text>
      <text x="772" y="132" fill="#64748b" fontFamily="Inter" fontSize="10">Page</text>
      <text x="772" y="146" fill="#94a3b8" fontFamily="Inter" fontSize="10">/dashboard</text>
      <text x="772" y="166" fill="#64748b" fontFamily="Inter" fontSize="10">Browser</text>
      <text x="772" y="180" fill="#94a3b8" fontFamily="Inter" fontSize="10">Chrome 124</text>
      <text x="772" y="200" fill="#64748b" fontFamily="Inter" fontSize="10">Country</text>
      <text x="772" y="214" fill="#94a3b8" fontFamily="Inter" fontSize="10">🇺🇸 United States</text>
      <text x="772" y="236" fill="#475569" fontFamily="Inter" fontSize="10" fontWeight="700">TICKET</text>
      <rect x="772" y="244" width="52" height="18" rx="4" fill="rgba(245,158,11,0.15)" />
      <text x="778" y="256" fill="#f59e0b" fontFamily="Inter" fontSize="9" fontWeight="600">OPEN</text>
      <text x="772" y="280" fill="#475569" fontFamily="Inter" fontSize="10" fontWeight="700">CSAT</text>
      <text x="772" y="296" fill="#f59e0b" fontFamily="Inter" fontSize="16">★★★★★</text>

      {/* Defs */}
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="agentBubble" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Widget Preview SVG ──────────────────────────────────── */
function WidgetPreview() {
  return (
    <svg viewBox="0 0 320 420" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 280, display: 'block', margin: '0 auto' }}>
      <rect width="320" height="420" rx="20" fill="#0d1220" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      {/* Header */}
      <rect width="320" height="72" rx="20" fill="url(#widgetHead)" />
      <rect y="52" width="320" height="20" fill="url(#widgetHead)" />
      <circle cx="32" cy="36" r="18" fill="rgba(255,255,255,0.2)" />
      <text x="32" y="41" fill="#fff" fontFamily="Inter" fontSize="11" fontWeight="700" textAnchor="middle">R</text>
      <circle cx="46" cy="48" r="5" fill="#22c55e" stroke="#4f46e5" strokeWidth="1.5" />
      <text x="60" y="30" fill="#fff" fontFamily="Inter" fontSize="13" fontWeight="700">ReplyHub Support</text>
      <text x="60" y="46" fill="rgba(255,255,255,0.7)" fontFamily="Inter" fontSize="10">● We reply in under 2 min</text>
      {/* Messages */}
      <rect x="12" y="88" width="180" height="38" rx="10" fill="#1a2035" />
      <text x="24" y="106" fill="#cbd5e1" fontFamily="Inter" fontSize="10">Hi! How can I help you</text>
      <text x="24" y="120" fill="#cbd5e1" fontFamily="Inter" fontSize="10">today? 👋</text>
      <rect x="128" y="140" width="180" height="30" rx="10" fill="url(#widgetHead)" />
      <text x="142" y="159" fill="#fff" fontFamily="Inter" fontSize="10">I need help with billing</text>
      <rect x="12" y="186" width="160" height="30" rx="10" fill="#1a2035" />
      <text x="24" y="205" fill="#cbd5e1" fontFamily="Inter" fontSize="10">Sure! Let me pull up your</text>
      {/* Typing */}
      <rect x="12" y="230" width="60" height="24" rx="12" fill="#1a2035" />
      <circle cx="28" cy="242" r="3.5" fill="#6366f1" />
      <circle cx="40" cy="242" r="3.5" fill="#8b5cf6" />
      <circle cx="52" cy="242" r="3.5" fill="#a78bfa" />
      {/* Input */}
      <rect x="12" y="368" width="296" height="40" rx="10" fill="#1a2035" />
      <text x="24" y="392" fill="#475569" fontFamily="Inter" fontSize="10">Message us…</text>
      <rect x="270" y="374" width="28" height="28" rx="8" fill="url(#widgetHead)" />
      <text x="284" y="392" fill="#fff" fontFamily="Inter" fontSize="12" textAnchor="middle">↑</text>
      {/* Quick replies */}
      <rect x="12" y="272" width="90" height="24" rx="12" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      <text x="57" y="288" fill="#818cf8" fontFamily="Inter" fontSize="9" textAnchor="middle">Billing issue</text>
      <rect x="112" y="272" width="80" height="24" rx="12" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      <text x="152" y="288" fill="#818cf8" fontFamily="Inter" fontSize="9" textAnchor="middle">Cancel sub</text>
      <rect x="202" y="272" width="68" height="24" rx="12" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
      <text x="236" y="288" fill="#818cf8" fontFamily="Inter" fontSize="9" textAnchor="middle">Technical</text>
      {/* Code snippet */}
      <rect x="12" y="310" width="296" height="46" rx="8" fill="#070b14" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
      <text x="24" y="328" fill="#475569" fontFamily="monospace" fontSize="9">{'// Add to your site'}</text>
      <text x="24" y="344" fill="#818cf8" fontFamily="monospace" fontSize="9">{'<script src="replyhub.js"'}</text>
      <text x="24" y="356" fill="#818cf8" fontFamily="monospace" fontSize="9">{'  data-key="rh_...">'}</text>
      <defs>
        <linearGradient id="widgetHead" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Analytics Mockup ───────────────────────────────────── */
function AnalyticsMockup() {
  const bars = [42, 67, 54, 78, 91, 65, 83, 72, 96, 58, 74, 88];
  return (
    <svg viewBox="0 0 380 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', display: 'block' }}>
      <rect width="380" height="220" rx="14" fill="#090e18" />
      <text x="16" y="28" fill="#e2e8f0" fontFamily="Inter" fontSize="13" fontWeight="700">Conversation Volume</text>
      <text x="16" y="44" fill="#64748b" fontFamily="Inter" fontSize="10">Last 30 days</text>
      <text x="340" y="28" fill="#22c55e" fontFamily="Inter" fontSize="13" fontWeight="700" textAnchor="end">+24%</text>
      {bars.map((h, i) => {
        const x = 16 + i * 29;
        const barH = (h / 100) * 120;
        const y = 178 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width="20" height={barH} rx="4"
              fill={i === 10 ? 'url(#barGrad)' : 'rgba(99,102,241,0.25)'} />
          </g>
        );
      })}
      <line x1="16" y1="178" x2="364" y2="178" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <text x="16" y="200" fill="#475569" fontFamily="Inter" fontSize="9">Jun 1</text>
      <text x="190" y="200" fill="#475569" fontFamily="Inter" fontSize="9" textAnchor="middle">Jun 15</text>
      <text x="364" y="200" fill="#475569" fontFamily="Inter" fontSize="9" textAnchor="end">Jun 30</text>
      {/* Hover tooltip */}
      <rect x="275" y="38" width="88" height="38" rx="8" fill="#1a2035" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
      <text x="319" y="54" fill="#e2e8f0" fontFamily="Inter" fontSize="10" fontWeight="600" textAnchor="middle">Jun 20</text>
      <text x="319" y="68" fill="#818cf8" fontFamily="Inter" fontSize="11" fontWeight="700" textAnchor="middle">96 chats</text>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f46e5" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <Box style={{ background: 'var(--rh-bg)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <Box component="nav" style={{
        borderBottom: '1px solid var(--rh-border)',
        background: 'rgba(7,8,15,0.85)',
        backdropFilter: 'blur(24px)',
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        <Container size="xl">
          <Group h={64} justify="space-between">
            <Group gap="xs">
              <Box style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(99,102,241,0.4)',
              }}>
                <IconHeadset size={18} color="#fff" />
              </Box>
              <Text fw={800} size="lg" style={{ color: '#fff', letterSpacing: '-0.5px' }}>ReplyHub</Text>
            </Group>
            <Group gap="sm" visibleFrom="sm">
              <Anchor component={Link} href="#features" size="sm" c="dimmed" style={{ textDecoration: 'none' }}>Features</Anchor>
              <Anchor component={Link} href="#pricing" size="sm" c="dimmed" style={{ textDecoration: 'none' }}>Pricing</Anchor>
              <Anchor component={Link} href="/login" size="sm" c="dimmed" style={{ textDecoration: 'none' }}>Sign in</Anchor>
              <Button component={Link} href="/register" size="sm"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
                Get started free
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* ── Hero ── */}
      <Box style={{ position: 'relative', paddingTop: 100, paddingBottom: 60, overflow: 'hidden' }}>
        {/* Background glows */}
        <Box style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 700,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <Box style={{
          position: 'absolute', top: '20%', right: '-5%',
          width: 500, height: 500,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <Container size="xl" style={{ position: 'relative' }}>
          <Stack align="center" mb={64}>
            <Badge variant="light" color="indigo" size="lg" px="xl" py={6}
              style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)' }}>
              <Group gap="xs">
                <IconSparkles size={14} />
                <span>Powered by Laravel Reverb — sub-50ms delivery</span>
              </Group>
            </Badge>
            <Title ta="center" style={{
              fontSize: 'clamp(2.8rem, 7.5vw, 5.5rem)', fontWeight: 900,
              lineHeight: 1.04, letterSpacing: '-2.5px', color: '#fff',
              maxWidth: 820,
            }}>
              Customer support that feels{' '}
              <span style={{
                background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c4b5fd)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                like magic
              </span>
            </Title>
            <Text size="xl" c="dimmed" maw={600} ta="center" style={{ lineHeight: 1.65 }}>
              One script tag. Instant live chat. Smart ticket management. Real-time agent collaboration.
              Everything your support team needs — without the enterprise price tag.
            </Text>
            <Group gap="md" justify="center" mt="sm">
              <Button component={Link} href="/register" size="lg"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', height: 54, paddingInline: 40, fontSize: 16, fontWeight: 700,
                  boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                }}
                rightSection={<IconArrowRight size={18} />}
              >
                Start for free
              </Button>
              <Button component={Link} href="/login" size="lg" variant="default"
                style={{ height: 54, paddingInline: 32, borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                Sign in
              </Button>
            </Group>
            <Group gap="xl" mt="xs">
              {['No credit card required', 'Free forever plan', 'Setup in 60 seconds'].map(t => (
                <Group key={t} gap={6}>
                  <IconCheck size={14} color="#22c55e" />
                  <Text size="xs" c="dimmed">{t}</Text>
                </Group>
              ))}
            </Group>
          </Stack>

          {/* Dashboard mockup */}
          <Box style={{
            position: 'relative', borderRadius: 20,
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1), 0 0 80px rgba(99,102,241,0.08)',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <Box style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
            }} />
            <DashboardMockup />
          </Box>
        </Container>
      </Box>

      {/* ── Social proof ticker ── */}
      <Box style={{ borderTop: '1px solid var(--rh-border)', borderBottom: '1px solid var(--rh-border)', padding: '16px 0', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}>
        <div className="rh-ticker-wrap">
          <div className="rh-ticker-track">
            {[...COMPANIES, ...COMPANIES].map((c, i) => (
              <Group key={i} gap="xs" style={{ paddingInline: 32, opacity: 0.45, whiteSpace: 'nowrap' }}>
                <Text size="sm" fw={700} style={{ color: '#94a3b8', letterSpacing: '0.05em' }}>{c}</Text>
                <Box style={{ width: 4, height: 4, borderRadius: '50%', background: '#374155' }} />
              </Group>
            ))}
          </div>
        </div>
      </Box>

      {/* ── Features bento grid ── */}
      <Box id="features" py={120} style={{ position: 'relative' }}>
        <Container size="xl">
          <Stack align="center" mb={72}>
            <Badge variant="outline" color="indigo" size="md" style={{ borderColor: 'rgba(99,102,241,0.4)' }}>Features</Badge>
            <Title order={2} ta="center" style={{ color: '#fff', letterSpacing: '-1.5px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Built for teams who care about speed
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={520}>
              Every feature is designed around one goal: reply faster, resolve better.
            </Text>
          </Stack>

          {/* Bento layout */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
            gridTemplateAreas: `"a a b" "c d e" "f f g"` }}>

            {/* Big feature: Dashboard mockup */}
            <BentoCard area="a" accent="#6366f1" title="Real-time agent dashboard"
              description="Every conversation, every agent, every message — updated live. No page refresh, no polling. Just instant state.">
              <Box mt="auto" pt="lg">
                <Box style={{
                  border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, overflow: 'hidden',
                  background: '#070b14',
                }}>
                  <DashboardMockup />
                </Box>
              </Box>
            </BentoCard>

            {/* Widget */}
            <BentoCard area="b" accent="#8b5cf6" title="One-line embed"
              description="Drop a single script tag anywhere. The chat bubble appears instantly, styled to your brand.">
              <Box mt="auto" pt="lg">
                <WidgetPreview />
              </Box>
            </BentoCard>

            {/* Small cards row */}
            <BentoCard area="c" accent="#22c55e" title="Agent presence"
              description="Live online/away/offline status. Visitors see real availability."
              icon={IconUsers} />
            <BentoCard area="d" accent="#f59e0b" title="Smart ticketing"
              description="No agents online? Conversations auto-become tickets."
              icon={IconTicket} />
            <BentoCard area="e" accent="#22d3ee" title="Visitor intel"
              description="Page, browser, OS, and country — automatically."
              icon={IconShieldCheck} />

            {/* Analytics */}
            <BentoCard area="f" accent="#6366f1" title="Built-in analytics"
              description="Track response times, CSAT scores, agent performance, and volume trends — no third-party tool needed.">
              <Box mt="auto" pt="lg">
                <AnalyticsMockup />
              </Box>
            </BentoCard>

            <BentoCard area="g" accent="#ec4899" title="CSAT ratings"
              description="Auto-request feedback after each conversation. Beautiful reports."
              icon={IconStar} />
          </Box>

          {/* Secondary feature row */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mt="xl">
            {SMALL_FEATURES.map(f => (
              <Box key={f.title} p="lg" className="rh-card-hover" style={{
                background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 14,
              }}>
                <ThemeIcon size={40} radius="md" variant="light" color={f.color} mb="md">
                  <f.icon size={20} />
                </ThemeIcon>
                <Text fw={700} mb={4} style={{ color: '#e2e8f0' }}>{f.title}</Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>{f.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── How it works ── */}
      <Box py={100} style={{ borderTop: '1px solid var(--rh-border)', background: 'rgba(255,255,255,0.01)' }}>
        <Container size="lg">
          <Stack align="center" mb={72}>
            <Badge variant="outline" color="violet" size="md" style={{ borderColor: 'rgba(139,92,246,0.4)' }}>Setup</Badge>
            <Title order={2} ta="center" style={{ color: '#fff', letterSpacing: '-1.5px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Live in under 60 seconds
            </Title>
          </Stack>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing={40}>
            {STEPS.map((s, i) => (
              <Box key={s.title} style={{ position: 'relative' }}>
                {i < 2 && (
                  <Box visibleFrom="md" style={{
                    position: 'absolute', top: 24, left: '60%', width: '80%', height: 1,
                    background: 'linear-gradient(90deg, rgba(99,102,241,0.4), transparent)',
                  }} />
                )}
                <Group mb="lg" gap="md">
                  <Box style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Text fw={900} style={{ color: '#818cf8', fontSize: 18 }}>{i + 1}</Text>
                  </Box>
                  <Text fw={700} size="lg" style={{ color: '#e2e8f0' }}>{s.title}</Text>
                </Group>
                <Text c="dimmed" style={{ lineHeight: 1.7 }}>{s.description}</Text>
                {s.code && (
                  <Box mt="md" p="md" style={{
                    background: '#070b14', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 10, fontFamily: 'monospace', fontSize: 12, color: '#818cf8',
                  }}>
                    {s.code}
                  </Box>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Testimonials ── */}
      <Box py={100} style={{ borderTop: '1px solid var(--rh-border)' }}>
        <Container size="xl">
          <Stack align="center" mb={72}>
            <Badge variant="outline" color="green" size="md" style={{ borderColor: 'rgba(34,197,94,0.4)' }}>Testimonials</Badge>
            <Title order={2} ta="center" style={{ color: '#fff', letterSpacing: '-1.5px', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Teams love ReplyHub
            </Title>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {TESTIMONIALS.map(t => (
              <Box key={t.name} p="xl" className="rh-card-hover rh-glass" style={{
                borderRadius: 16, position: 'relative', overflow: 'hidden',
              }}>
                <Box style={{
                  position: 'absolute', top: 16, right: 20, opacity: 0.06,
                }}>
                  <IconQuote size={64} color="#6366f1" />
                </Box>
                <Text style={{ color: '#f59e0b', marginBottom: 12, fontSize: 14 }}>{'★'.repeat(5)}</Text>
                <Text size="sm" c="dimmed" style={{ lineHeight: 1.75, marginBottom: 20 }}>{t.quote}</Text>
                <Group gap="sm">
                  <Avatar size={40} radius="xl" color={t.color} style={{ fontWeight: 700 }}>
                    {t.name[0]}
                  </Avatar>
                  <Box>
                    <Text size="sm" fw={700} style={{ color: '#e2e8f0' }}>{t.name}</Text>
                    <Text size="xs" c="dimmed">{t.role}</Text>
                  </Box>
                </Group>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Stats ── */}
      <Box py={80} style={{ borderTop: '1px solid var(--rh-border)', background: 'rgba(99,102,241,0.03)' }}>
        <Container size="xl">
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
            {STATS.map(s => (
              <Box key={s.label} ta="center" p="lg">
                <Text fw={900} style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>
                  {s.value}
                </Text>
                <Text c="dimmed" size="sm" mt="xs">{s.label}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── Pricing ── */}
      <Box id="pricing" py={120} style={{ borderTop: '1px solid var(--rh-border)' }}>
        <Container size="xl">
          <Stack align="center" mb={72}>
            <Badge variant="outline" color="indigo" size="md" style={{ borderColor: 'rgba(99,102,241,0.4)' }}>Pricing</Badge>
            <Title order={2} ta="center" style={{ color: '#fff', letterSpacing: '-1.5px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Simple, transparent pricing
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={460}>
              Start free, scale when you're ready. No hidden fees.
            </Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" style={{ alignItems: 'start' }}>
            {PLANS.map((plan, i) => (
              <Box key={plan.name} p="xl" style={{
                background: plan.featured ? 'rgba(99,102,241,0.08)' : 'var(--rh-surface)',
                border: plan.featured ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--rh-border)',
                borderRadius: 20, position: 'relative',
                boxShadow: plan.featured ? '0 0 60px rgba(99,102,241,0.12)' : 'none',
              }}>
                {plan.featured && (
                  <Badge
                    style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
                    }}
                    size="md"
                  >
                    Most Popular
                  </Badge>
                )}
                <Text fw={700} style={{ color: '#e2e8f0', marginBottom: 4 }}>{plan.name}</Text>
                <Group align="baseline" gap={4} mb="sm">
                  <Text fw={900} style={{ fontSize: 40, color: '#fff', lineHeight: 1, letterSpacing: '-2px' }}>{plan.price}</Text>
                  {plan.price !== 'Free' && <Text c="dimmed" size="sm">/month</Text>}
                </Group>
                <Text c="dimmed" size="sm" mb="xl" style={{ lineHeight: 1.6 }}>{plan.description}</Text>
                <Button
                  component={Link} href="/register" fullWidth size="md"
                  variant={plan.featured ? 'filled' : 'default'}
                  style={plan.featured ? {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
                  } : { borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
                >
                  {plan.cta}
                </Button>
                <Box mt="xl">
                  {plan.features.map(f => (
                    <Group key={f} gap="xs" mb="xs">
                      <IconCheck size={14} color={plan.featured ? '#818cf8' : '#22c55e'} style={{ flexShrink: 0 }} />
                      <Text size="sm" c="dimmed">{f}</Text>
                    </Group>
                  ))}
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box py={140} style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--rh-border)' }}>
        <Box style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <Container size="sm" style={{ position: 'relative', textAlign: 'center' }}>
          <Badge variant="light" color="indigo" size="lg" mb="xl" px="xl" py={6}
            style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)' }}>
            Get started today — it's free
          </Badge>
          <Title style={{
            color: '#fff', letterSpacing: '-2px', marginBottom: 20,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1,
          }}>
            Ready to transform your support?
          </Title>
          <Text c="dimmed" size="lg" mb={48} style={{ lineHeight: 1.7 }}>
            Join support teams who reply in real time, not hours. Set up in 60 seconds — no credit card needed.
          </Text>
          <Button component={Link} href="/register" size="xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              height: 60, paddingInline: 56, fontSize: 17, fontWeight: 700,
              boxShadow: '0 12px 40px rgba(99,102,241,0.4)',
            }}
            rightSection={<IconArrowRight size={20} />}
          >
            Create your workspace
          </Button>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box style={{ borderTop: '1px solid var(--rh-border)' }} py={48}>
        <Container size="xl">
          <Group justify="space-between" align="flex-start" style={{ flexWrap: 'wrap', gap: 32 }}>
            <Box>
              <Group gap="xs" mb="xs">
                <Box style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconHeadset size={14} color="#fff" />
                </Box>
                <Text fw={800} style={{ color: '#fff' }}>ReplyHub</Text>
              </Group>
              <Text size="xs" c="dimmed" maw={220} style={{ lineHeight: 1.6 }}>
                Real-time support infrastructure for modern teams.
              </Text>
            </Box>
            <SimpleGrid cols={3} spacing={40}>
              {FOOTER_LINKS.map(col => (
                <Box key={col.heading}>
                  <Text size="xs" fw={700} style={{ color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                    {col.heading}
                  </Text>
                  <Stack gap={8}>
                    {col.links.map(l => (
                      <Anchor key={l} component={Link} href="#" size="sm" c="dimmed" style={{ textDecoration: 'none' }}>{l}</Anchor>
                    ))}
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </Group>
          <Box style={{ borderTop: '1px solid var(--rh-border)', marginTop: 40, paddingTop: 24 }}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">© {new Date().getFullYear()} ReplyHub. All rights reserved.</Text>
              <Group gap="md">
                <Anchor component={Link} href="#" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>Privacy</Anchor>
                <Anchor component={Link} href="#" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>Terms</Anchor>
              </Group>
            </Group>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

/* ─── Bento card ─────────────────────────────────────────── */
function BentoCard({ area, accent, title, description, icon: Icon, children }: {
  area: string; accent: string; title: string; description: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <Box style={{
      gridArea: area,
      background: 'var(--rh-surface)',
      border: '1px solid var(--rh-border)',
      borderRadius: 20, padding: 28,
      display: 'flex', flexDirection: 'column',
      transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      overflow: 'hidden',
      minHeight: children ? 'auto' : 180,
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${accent}40`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}20`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--rh-border)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {Icon && (
        <Box style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${accent}18`, border: `1px solid ${accent}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <Icon size={22} color={accent} />
        </Box>
      )}
      <Text fw={700} size="lg" style={{ color: '#e2e8f0', marginBottom: 8 }}>{title}</Text>
      <Text size="sm" c="dimmed" style={{ lineHeight: 1.65 }}>{description}</Text>
      {children}
    </Box>
  );
}

/* ─── Data ───────────────────────────────────────────────── */
const COMPANIES = [
  'Stripe', 'Linear', 'Vercel', 'Notion', 'Figma', 'Loom', 'Retool', 'Clerk',
  'PlanetScale', 'Resend', 'Cal.com', 'Sanity',
];

const SMALL_FEATURES = [
  { icon: IconMessage2, title: 'Typing indicators', color: 'blue',
    description: 'Both agents and visitors see "…is typing" in real time.' },
  { icon: IconBoltFilled, title: 'Canned responses', color: 'violet',
    description: 'Save replies, insert with /shortcut. Reply 5× faster.' },
  { icon: IconChartBar, title: 'Response metrics', color: 'cyan',
    description: 'First-reply time, resolution time, CSAT — all tracked.' },
  { icon: IconBrandTwitter, title: 'Multi-workspace', color: 'indigo',
    description: 'Each client gets their own isolated workspace and widget.' },
];

const STEPS = [
  {
    title: 'Create your workspace',
    description: 'Sign up in seconds. Your workspace is ready immediately — unique API key generated automatically.',
    code: null,
  },
  {
    title: 'Drop the script tag',
    description: 'Paste one line of HTML anywhere on your site. The chat bubble appears styled and ready.',
    code: `<script src="https://cdn.replyhub.io/widget.js"\n  data-key="rh_live_..."></script>`,
  },
  {
    title: 'Start replying',
    description: 'Your team opens the dashboard. Visitors start chatting. You reply in real time — or tickets are created automatically.',
    code: null,
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen', role: 'Head of Support @ Orbit', color: 'indigo',
    quote: '"We cut average response time from 4 hours to under 3 minutes. The real-time dashboard makes it feel like we\'re all in the same room even though we\'re remote."',
  },
  {
    name: 'Marcus Oliveira', role: 'CTO @ Stackform', color: 'violet',
    quote: '"The one-script embed is genuinely magic. We deployed it in a PR review cycle and were handling live chats before the review was even done."',
  },
  {
    name: 'Aisha Nwosu', role: 'Customer Success @ Pixel', color: 'cyan',
    quote: '"The auto-ticket conversion when agents are offline is a game changer. Nothing falls through the cracks anymore, and CSAT went from 72% to 94%."',
  },
];

const STATS = [
  { value: '<50ms', label: 'Message delivery latency' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '1 line', label: 'Of code to embed' },
  { value: '∞', label: 'Conversations per workspace' },
];

const PLANS = [
  {
    name: 'Starter', price: 'Free', featured: false, cta: 'Get started free',
    description: 'Perfect for indie developers and small teams getting started.',
    features: ['1 workspace', '2 agents', '500 conversations/month', 'Live chat widget', 'Basic analytics', 'Community support'],
  },
  {
    name: 'Pro', price: '$29', featured: true, cta: 'Start Pro trial',
    description: 'For growing teams who need more power and customization.',
    features: ['3 workspaces', '10 agents', 'Unlimited conversations', 'Canned responses', 'CSAT ratings', 'Visitor intelligence', 'Priority support', 'Custom widget branding'],
  },
  {
    name: 'Scale', price: '$99', featured: false, cta: 'Contact sales',
    description: 'For established businesses with high-volume support needs.',
    features: ['Unlimited workspaces', 'Unlimited agents', 'Unlimited conversations', 'Advanced analytics', 'SLA dashboard', 'SSO / SAML', 'Dedicated support', 'Custom SLA'],
  },
];

const FOOTER_LINKS = [
  { heading: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
  { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Privacy'] },
  { heading: 'Developers', links: ['Docs', 'API', 'Widget SDK', 'Status'] },
];
