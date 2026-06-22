'use client';

import {
  Box, Button, Card, Code, ColorInput, CopyButton, Divider, Group, Paper,
  Select, Stack, Switch, Text, Textarea, TextInput, Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { IconCheck, IconCopy, IconPalette } from '@tabler/icons-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function WidgetSettingsPage() {
  const { workspace, updateWorkspace } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      widget_color: workspace?.widget_color ?? '#6366f1',
      widget_position: (workspace?.widget_position as 'bottom-right' | 'bottom-left') ?? 'bottom-right',
      widget_greeting: workspace?.widget_greeting ?? 'Hi there! How can we help you today?',
      widget_agent_label: workspace?.widget_agent_label ?? 'Support Team',
      show_branding: workspace?.show_branding ?? true,
    },
  });

  useEffect(() => {
    if (workspace) {
      form.setValues({
        widget_color: workspace.widget_color,
        widget_position: workspace.widget_position,
        widget_greeting: workspace.widget_greeting,
        widget_agent_label: workspace.widget_agent_label,
        show_branding: workspace.show_branding,
      });
    }
  }, [workspace?.id]);

  const handleSave = async (values: typeof form.values) => {
    setSaving(true);
    try {
      const { data } = await api.patch('/workspace', values);
      updateWorkspace(data);
      notifications.show({ color: 'green', message: 'Widget settings saved' });
    } catch {
      notifications.show({ color: 'red', message: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const scriptTag = `<script>
  window.ReplyHubConfig = {
    apiKey: "${workspace?.api_key ?? 'YOUR_API_KEY'}",
    color: "${form.values.widget_color}",
  };
</script>
<script src="https://widget.replyhub.io/widget.js" async></script>`;

  return (
    <Box p="xl" style={{ maxWidth: 800 }}>
      <Text fw={800} size="xl" style={{ color: '#fff' }} mb="xs">Widget</Text>
      <Text size="sm" c="dimmed" mb="xl">Customize your chat widget and get the embed code</Text>

      <Box style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Settings form */}
        <Box flex={1}>
          <form onSubmit={form.onSubmit(handleSave)}>
            <Stack gap="lg">
              <Paper p="lg" style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }} radius="lg">
                <Text fw={600} mb="md" style={{ color: '#e2e8f0' }}>Appearance</Text>
                <Stack gap="md">
                  <ColorInput
                    label="Brand color"
                    format="hex"
                    {...form.getInputProps('widget_color')}
                    styles={{ input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rh-border)' } }}
                  />
                  <Select
                    label="Position"
                    data={[
                      { value: 'bottom-right', label: 'Bottom right' },
                      { value: 'bottom-left', label: 'Bottom left' },
                    ]}
                    {...form.getInputProps('widget_position')}
                    styles={{ input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rh-border)' } }}
                  />
                </Stack>
              </Paper>

              <Paper p="lg" style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }} radius="lg">
                <Text fw={600} mb="md" style={{ color: '#e2e8f0' }}>Content</Text>
                <Stack gap="md">
                  <TextInput
                    label="Agent label"
                    placeholder="Support Team"
                    {...form.getInputProps('widget_agent_label')}
                    styles={{ input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rh-border)' } }}
                  />
                  <Textarea
                    label="Greeting message"
                    placeholder="Hi there! How can we help?"
                    rows={3}
                    {...form.getInputProps('widget_greeting')}
                    styles={{ input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--rh-border)' } }}
                  />
                </Stack>
              </Paper>

              <Paper p="lg" style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }} radius="lg">
                <Text fw={600} mb="md" style={{ color: '#e2e8f0' }}>Options</Text>
                <Switch
                  label="Show 'Powered by ReplyHub' branding"
                  {...form.getInputProps('show_branding', { type: 'checkbox' })}
                />
              </Paper>

              <Button type="submit" loading={saving} size="md">Save changes</Button>
            </Stack>
          </form>
        </Box>

        {/* Preview */}
        <Box w={260} style={{ flexShrink: 0 }}>
          <Paper p="lg" style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', position: 'sticky', top: 24 }} radius="lg">
            <Text fw={600} mb="md" size="sm" style={{ color: '#e2e8f0' }}>Preview</Text>

            {/* Mock widget */}
            <Box style={{ height: 340, background: '#0f0f13', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
              {/* Chat window */}
              <Box style={{
                position: 'absolute', bottom: 60, right: 12,
                width: 220, borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                background: '#1a1a24',
              }}>
                <Box style={{ background: form.values.widget_color, padding: '14px 16px' }}>
                  <Text size="sm" fw={700} style={{ color: '#fff' }}>{form.values.widget_agent_label}</Text>
                  <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>We reply in minutes</Text>
                </Box>
                <Box p="sm">
                  <Box style={{
                    background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px', marginBottom: 8,
                  }}>
                    <Text size="xs" style={{ color: '#e2e8f0' }}>{form.values.widget_greeting}</Text>
                  </Box>
                </Box>
              </Box>

              {/* Chat bubble */}
              <Box style={{
                position: 'absolute', bottom: 12, right: 12,
                width: 44, height: 44, borderRadius: '50%',
                background: form.values.widget_color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 20px ${form.values.widget_color}66`,
              }}>
                <Text size="lg">💬</Text>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Embed code */}
      <Paper p="lg" mt="xl" style={{ background: 'var(--rh-surface)', border: '1px solid var(--rh-border)' }} radius="lg">
        <Group justify="space-between" mb="md">
          <Text fw={600} style={{ color: '#e2e8f0' }}>Install code</Text>
          <CopyButton value={scriptTag}>
            {({ copied, copy }) => (
              <Button
                size="xs" variant="light" leftSection={copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                color={copied ? 'green' : 'indigo'}
                onClick={copy}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
          </CopyButton>
        </Group>
        <Text size="xs" c="dimmed" mb="sm">
          Paste this snippet before the closing <Code>&lt;/body&gt;</Code> tag on your website.
        </Text>
        <Code block style={{ background: 'rgba(0,0,0,0.4)', fontSize: 12 }}>
          {scriptTag}
        </Code>
      </Paper>
    </Box>
  );
}
