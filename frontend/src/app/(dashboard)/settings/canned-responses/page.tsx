'use client';

import {
  ActionIcon, Box, Button, Group, Kbd, Loader, Modal, Stack, Text, Textarea, TextInput, Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { IconBolt, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import api from '@/lib/api';
import type { CannedResponse } from '@/types';

export default function CannedResponsesPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<CannedResponse | null>(null);
  const [search, setSearch] = useState('');

  const { data: canned = [], isLoading } = useQuery<CannedResponse[]>({
    queryKey: ['canned', search],
    queryFn: () => api.get('/canned-responses', { params: { search: search || undefined } }).then((r) => r.data),
  });

  const form = useForm({
    initialValues: { title: '', shortcut: '', content: '' },
    validate: {
      title: (v) => (v.length > 0 ? null : 'Required'),
      content: (v) => (v.length > 0 ? null : 'Required'),
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      editing
        ? api.patch(`/canned-responses/${editing.id}`, values)
        : api.post('/canned-responses', values),
    onSuccess: () => {
      notifications.show({ color: 'green', message: editing ? 'Updated' : 'Created' });
      queryClient.invalidateQueries({ queryKey: ['canned'] });
      close();
      form.reset();
      setEditing(null);
    },
    onError: () => notifications.show({ color: 'red', message: 'Failed to save' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/canned-responses/${id}`),
    onSuccess: () => {
      notifications.show({ color: 'green', message: 'Deleted' });
      queryClient.invalidateQueries({ queryKey: ['canned'] });
    },
  });

  const openCreate = () => { form.reset(); setEditing(null); open(); };
  const openEdit = (cr: CannedResponse) => {
    form.setValues({ title: cr.title, shortcut: cr.shortcut ?? '', content: cr.content });
    setEditing(cr);
    open();
  };

  return (
    <Box p="xl" style={{ maxWidth: 800 }}>
      <Group justify="space-between" mb="xl">
        <Box>
          <Text fw={800} size="xl" style={{ color: '#fff' }}>Canned Responses</Text>
          <Text size="sm" c="dimmed">Pre-written replies to use with a shortcut</Text>
        </Box>
        <Button leftSection={<IconPlus size={15} />} onClick={openCreate}>New response</Button>
      </Group>

      <TextInput
        placeholder="Search..."
        leftSection={<IconSearch size={15} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="lg"
        styles={{ input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rh-border)' } }}
      />

      {isLoading ? (
        <Box ta="center" py="xl"><Loader /></Box>
      ) : canned.length === 0 ? (
        <Box ta="center" py="xl">
          <IconBolt size={48} color="#374151" />
          <Text c="dimmed" mt="sm">No canned responses yet</Text>
          <Button mt="md" variant="light" onClick={openCreate}>Create your first</Button>
        </Box>
      ) : (
        <Stack gap="sm">
          {canned.map((cr) => (
            <Box
              key={cr.id}
              p="md"
              style={{
                background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 12,
              }}
            >
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  <Text fw={600} size="sm" style={{ color: '#e2e8f0' }}>{cr.title}</Text>
                  {cr.shortcut && <Kbd size="xs">/{cr.shortcut}</Kbd>}
                </Group>
                <Group gap="xs">
                  <Tooltip label="Edit">
                    <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => openEdit(cr)}>
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <ActionIcon
                      variant="subtle" color="red" size="sm"
                      loading={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(cr.id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
              <Text size="xs" c="dimmed" lineClamp={2}>{cr.content}</Text>
            </Box>
          ))}
        </Stack>
      )}

      <Modal
        opened={opened}
        onClose={() => { close(); setEditing(null); form.reset(); }}
        title={editing ? 'Edit canned response' : 'New canned response'}
        styles={{ content: { background: '#1a1a24', border: '1px solid var(--rh-border)' } }}
      >
        <form onSubmit={form.onSubmit((v) => saveMutation.mutate(v))}>
          <Stack gap="md">
            <TextInput
              label="Title"
              placeholder="e.g. Greeting"
              {...form.getInputProps('title')}
            />
            <TextInput
              label="Shortcut (optional)"
              placeholder="e.g. greet"
              leftSection={<Text size="sm" c="dimmed">/</Text>}
              {...form.getInputProps('shortcut')}
              description="Type /shortcut in the message box to insert this response"
            />
            <Textarea
              label="Content"
              placeholder="Write your response..."
              rows={5}
              {...form.getInputProps('content')}
            />
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
