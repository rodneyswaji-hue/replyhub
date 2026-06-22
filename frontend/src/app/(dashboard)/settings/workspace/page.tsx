'use client';

import {
  Box, Button, Code, CopyButton, Divider, Group, Paper, Stack, Text, TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { IconCheck, IconCopy, IconRefresh } from '@tabler/icons-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function WorkspaceSettingsPage() {
  const { workspace, updateWorkspace } = useAuthStore();
  const [regenerating, setSaving] = useState(false);
  const [saving, setSavingWorkspace] = useState(false);

  const form = useForm({
    initialValues: { name: workspace?.name ?? '' },
    validate: { name: (v) => (v.length >= 2 ? null : 'Too short') },
  });

  useEffect(() => {
    if (workspace) form.setValues({ name: workspace.name });
  }, [workspace?.id]);

  const handleSave = async (values: typeof form.values) => {
    setSavingWorkspace(true);
    try {
      const { data } = await api.patch('/workspace', values);
      updateWorkspace(data);
      notifications.show({ color: 'green', message: 'Workspace updated' });
    } catch {
      notifications.show({ color: 'red', message: 'Failed to save' });
    } finally {
      setSavingWorkspace(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate API key? Your current widget will stop working until you update the script tag.')) return;
    setSaving(true);
    try {
      const { data } = await api.post('/workspace/api-key');
      updateWorkspace({ api_key: data.api_key });
      notifications.show({ color: 'green', message: 'API key regenerated' });
    } catch {
      notifications.show({ color: 'red', message: 'Failed to regenerate key' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p="xl" style={{ maxWidth: 700 }}>
      <Text fw={800} size="xl" style={{ color: '#fff' }} mb="xs">Workspace settings</Text>
      <Text size="sm" c="dimmed" mb="xl">Manage your workspace name and API credentials</Text>

      <Stack gap="lg">
        <Paper p="lg" style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }} radius="lg">
          <Text fw={600} mb="md" style={{ color: '#e2e8f0' }}>General</Text>
          <form onSubmit={form.onSubmit(handleSave)}>
            <Stack gap="md">
              <TextInput
                label="Workspace name"
                {...form.getInputProps('name')}
                styles={{ input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rh-border)' } }}
              />
              <Box>
                <Text size="xs" c="dimmed" mb={4}>Workspace slug</Text>
                <Code style={{ background: 'rgba(255,255,255,0.04)' }}>{workspace?.slug}</Code>
              </Box>
              <Button type="submit" loading={saving} w="fit-content">Save changes</Button>
            </Stack>
          </form>
        </Paper>

        <Paper p="lg" style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }} radius="lg">
          <Text fw={600} mb="xs" style={{ color: '#e2e8f0' }}>API Key</Text>
          <Text size="xs" c="dimmed" mb="md">
            Use this key in your widget script tag. Keep it secret.
          </Text>
          <Group gap="sm">
            <Code
              style={{ background: 'rgba(255,255,255,0.04)', fontSize: 13, flex: 1, padding: '8px 12px' }}
            >
              {workspace?.api_key}
            </Code>
            <CopyButton value={workspace?.api_key ?? ''}>
              {({ copied, copy }) => (
                <Button
                  size="sm" variant="light"
                  leftSection={copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                  color={copied ? 'green' : 'gray'}
                  onClick={copy}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              )}
            </CopyButton>
            <Button
              size="sm" variant="subtle" color="red"
              leftSection={<IconRefresh size={13} />}
              loading={regenerating}
              onClick={handleRegenerate}
            >
              Regenerate
            </Button>
          </Group>
        </Paper>

        <Paper p="lg" style={{ background: 'var(--rh-surface)', border: '1px solid rgba(239,68,68,0.2)' }} radius="lg">
          <Text fw={600} mb="xs" style={{ color: '#e2e8f0' }}>Danger zone</Text>
          <Text size="xs" c="dimmed" mb="md">
            Destructive actions cannot be undone.
          </Text>
          <Button variant="light" color="red" size="sm" disabled>
            Delete workspace (contact support)
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
}
