'use client';

import {
  ActionIcon, Box, Button, ColorInput, Group, Loader, Modal, Stack, Text, TextInput, Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { IconPlus, IconTag, IconTrash } from '@tabler/icons-react';
import api from '@/lib/api';
import type { Label } from '@/types';

export default function LabelsPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);

  const { data: labels = [], isLoading } = useQuery<Label[]>({
    queryKey: ['labels'],
    queryFn: () => api.get('/labels').then((r) => r.data),
  });

  const form = useForm({
    initialValues: { name: '', color: '#6366f1' },
    validate: { name: (v) => (v.length > 0 ? null : 'Required') },
  });

  const createMutation = useMutation({
    mutationFn: (values: { name: string; color: string }) => api.post('/labels', values),
    onSuccess: () => {
      notifications.show({ color: 'green', message: 'Label created' });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      close();
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/labels/${id}`),
    onSuccess: () => {
      notifications.show({ color: 'green', message: 'Deleted' });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });

  return (
    <Box p="xl" style={{ maxWidth: 700 }}>
      <Group justify="space-between" mb="xl">
        <Box>
          <Text fw={800} size="xl" style={{ color: '#fff' }}>Labels</Text>
          <Text size="sm" c="dimmed">Categorize conversations with colored labels</Text>
        </Box>
        <Button leftSection={<IconPlus size={15} />} onClick={open}>New label</Button>
      </Group>

      {isLoading ? (
        <Box ta="center" py="xl"><Loader /></Box>
      ) : labels.length === 0 ? (
        <Box ta="center" py="xl">
          <IconTag size={48} color="#374151" />
          <Text c="dimmed" mt="sm">No labels yet</Text>
        </Box>
      ) : (
        <Stack gap="sm">
          {labels.map((label) => (
            <Box
              key={label.id}
              p="md"
              style={{
                background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 12,
              }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <Box style={{ width: 16, height: 16, borderRadius: 4, background: label.color }} />
                  <Text fw={600} size="sm" style={{ color: '#e2e8f0' }}>{label.name}</Text>
                </Group>
                <Tooltip label="Delete">
                  <ActionIcon
                    variant="subtle" color="red" size="sm"
                    loading={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(label.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Box>
          ))}
        </Stack>
      )}

      <Modal
        opened={opened} onClose={close} title="New label"
        styles={{ content: { background: '#1a1a24', border: '1px solid var(--rh-border)' } }}
      >
        <form onSubmit={form.onSubmit((v) => createMutation.mutate(v))}>
          <Stack gap="md">
            <TextInput label="Label name" placeholder="e.g. Billing" {...form.getInputProps('name')} />
            <ColorInput label="Color" format="hex" {...form.getInputProps('color')} />
            <Button type="submit" loading={createMutation.isPending}>Create label</Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
