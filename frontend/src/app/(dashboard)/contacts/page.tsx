'use client';

import {
  Avatar, Badge, Box, Group, Loader, Stack, Text, TextInput,
} from '@mantine/core';
import { IconSearch, IconUsers } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import type { Contact } from '@/types';

export default function ContactsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', search],
    queryFn: () =>
      api.get('/contacts', { params: { search: search || undefined } }).then((r) => r.data),
    retry: false,
  });

  const contacts: Contact[] = data?.data ?? data ?? [];

  return (
    <Box p="xl" style={{ maxWidth: 900 }}>
      <Group justify="space-between" mb="xl">
        <Box>
          <Text fw={800} size="xl" style={{ color: '#fff' }}>Contacts</Text>
          <Text size="sm" c="dimmed">People who have contacted your team</Text>
        </Box>
      </Group>

      <TextInput
        placeholder="Search contacts..."
        leftSection={<IconSearch size={15} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="lg"
        styles={{ input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rh-border)' } }}
      />

      {isLoading ? (
        <Box ta="center" py="xl"><Loader /></Box>
      ) : contacts.length === 0 ? (
        <Box ta="center" py="xl">
          <IconUsers size={48} color="#374151" />
          <Text c="dimmed" mt="sm">No contacts yet</Text>
        </Box>
      ) : (
        <Stack gap="sm">
          {contacts.map((contact) => (
            <Box
              key={contact.id}
              p="md"
              style={{
                background: 'var(--rh-surface)',
                border: '1px solid var(--rh-border)',
                borderRadius: 12,
              }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <Avatar size={40} color="indigo" radius="xl">
                    {(contact.name ?? contact.email ?? 'A')[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Text fw={600} size="sm" style={{ color: '#e2e8f0' }}>
                      {contact.name ?? 'No name'}
                    </Text>
                    <Text size="xs" c="dimmed">{contact.email}</Text>
                  </Box>
                </Group>
                <Group gap="xs">
                  {contact.country && <Badge size="xs" variant="outline" color="gray">{contact.country}</Badge>}
                  {contact.browser && <Badge size="xs" variant="outline" color="gray">{contact.browser}</Badge>}
                </Group>
              </Group>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
