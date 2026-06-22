'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'lg',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    fontWeight: '800',
  },
  colors: {
    dark: [
      '#c8cdd8',
      '#a8b0c0',
      '#8892a8',
      '#5c6a84',
      '#374155',
      '#1e2537',
      '#141926',
      '#0e1220',
      '#09101b',
      '#070b14',
    ],
  },
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
      },
    },
    TextInput: { defaultProps: { radius: 'md' } },
    PasswordInput: { defaultProps: { radius: 'md' } },
    Select: { defaultProps: { radius: 'md' } },
    Textarea: { defaultProps: { radius: 'md' } },
    Paper: { defaultProps: { radius: 'lg' } },
    Card: { defaultProps: { radius: 'lg' } },
    Badge: { defaultProps: { radius: 'sm' } },
    Modal: { defaultProps: { radius: 'lg' } },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <ModalsProvider>
          <Notifications position="top-right" zIndex={9999} />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
