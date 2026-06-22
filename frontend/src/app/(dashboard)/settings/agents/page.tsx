'use client';

import {
  ActionIcon, Avatar, Badge, Box, Button, Group, Loader, Modal, Select,
  Stack, Text, TextInput, Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconMail, IconTrash, IconUserPlus } from '@tabler/icons-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types';

const STATUS_COLORS = { online: '#22c55e', away: '#f59e0b', offline: '#6b7280' };
const ROLE_COLORS = { owner: 'violet', admin: 'indigo', agent: 'gray' };

export default function AgentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);

  const { data: agents = [], isLoading } = useQuery<User[]>({
    queryKey: ['agents'],
    queryFn: () => api.get('/workspace/agents').then((r) => r.data),
  });

  const inviteForm = useForm({
    initialValues: { email: '', role: 'agent' },
    validate: { email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email') },
  });

  const inviteMutation = useMutation({
    mutationFn: (values: { email: string; role: string }) => api.post('/workspace/invite', values),
    onSuccess: () => {
      notifications.show({ color: 'green', message: 'Invitation sent!' });
      close();
      inviteForm.reset();
    },
    onError: () => notifications.show({ color: 'red', message: 'Failed to send invitation' }),
  });

  const removeMutation = useMutation({
    mutationFn: (agentId: number) => api.delete(`/workspace/agents/${agentId}`),
    onSuccess: () => {
      notifications.show({ color: 'green', message: 'Agent removed' });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  return (
    <Box p="xl" style={{ maxWidth: 800 }}>
      <Group justify="space-between" mb="xl">
        <Box>
          <Text fw={800} size="xl" style={{ color: '#fff' }}>Agents</Text>
          <Text size="sm" c="dimmed">Manage your support team</Text>
        </Box>
        {user?.role && ['owner', 'admin'].includes(user.role) && (
          <Button leftSection={<IconUserPlus size={15} />} onClick={open}>
            Invite agent
          </Button>
        )}
      </Group>

      {isLoading ? (
        <Box ta="center" py="xl"><Loader /></Box>
      ) : (
        <Stack gap="sm">
          {agents.map((agent) => (
            <Box
              key={agent.id}
              p="md"
              style={{
                background: 'var(--rh-surface)', border: '1px solid var(--rh-border)', borderRadius: 12,
              }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  <Box style={{ position: 'relative' }}>
                    <Avatar size={42} src={agent.avatar} color="indigo" radius="xl">
                      {agent.name[0].toUpperCase()}
                    </Avatar>
                    <Box style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 12, height: 12, borderRadius: '50%',
                      background: STATUS_COLORS[agent.status],
                      border: '2px solid var(--rh-surface)',
                    }} />
                  </Box>
                  <Box>
                    <Group gap="xs">
                      <Text fw={600} size="sm" style={{ color: '#e2e8f0' }}>{agent.name}</Text>
                      {agent.id === user?.id && <Badge size="xs" variant="outline" color="indigo">You</Badge>}
                    </Group>
                    <Group gap={6}>
                      <Text size="xs" c="dimmed">{agent.email}</Text>
                      <Badge size="xs" color={ROLE_COLORS[agent.role] as string} variant="light">
                        {agent.role}
                      </Badge>
                    </Group>
                  </Box>
                </Group>

                <Group gap="xs">
                  <Text size="xs" c="dimmed" tt="capitalize">{agent.status}</Text>
                  {agent.role !== 'owner' && agent.id !== user?.id && (
                    <Tooltip label="Remove agent">
                      <ActionIcon
                        variant="subtle" color="red" size="sm"
                        loading={removeMutation.isPending}
                        onClick={() => removeMutation.mutate(agent.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>
            </Box>
          ))}
        </Stack>
      )}

      <Modal
        opened={opened} onClose={close} title="Invite team member"
        styles={{ content: { background: '#1a1a24', border: '1px solid var(--rh-border)' } }}
      >
        <form onSubmit={inviteForm.onSubmit((v) => inviteMutation.mutate(v))}>
          <Stack gap="md">
            <TextInput
              label="Email address"
              placeholder="colleague@company.com"
              leftSection={<IconMail size={15} />}
              {...inviteForm.getInputProps('email')}
            />
            <Select
              label="Role"
              data={[
                { value: 'agent', label: 'Agent — can reply to conversations' },
                { value: 'admin', label: 'Admin — full access' },
              ]}
              {...inviteForm.getInputProps('role')}
            />
            <Button type="submit" loading={inviteMutation.isPending} leftSection={<IconMail size={14} />}>
              Send invitation
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
