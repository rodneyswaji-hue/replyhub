'use client';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Echo = require('laravel-echo');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Pusher = require('pusher-js');

type EchoInstance = InstanceType<typeof Echo>;

let echo: EchoInstance | null = null;

export function getEcho(): EchoInstance {
  if (echo) return echo;
  if (typeof window === 'undefined') throw new Error('Echo only available on client');

  (window as unknown as { Pusher: unknown }).Pusher = Pusher;

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('rh_token') : null;

  echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? 'replyhub-key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        Accept: 'application/json',
      },
    },
  });

  return echo;
}

export function disconnectEcho() {
  echo?.disconnect();
  echo = null;
}
