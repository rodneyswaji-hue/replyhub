'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Workspace } from '@/types';

interface AuthState {
  user: User | null;
  workspace: Workspace | null;
  token: string | null;
  setAuth: (user: User, workspace: Workspace, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  updateWorkspace: (workspace: Partial<Workspace>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      workspace: null,
      token: null,
      setAuth: (user, workspace, token) => {
        if (typeof window !== 'undefined') localStorage.setItem('rh_token', token);
        set({ user, workspace, token });
      },
      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),
      updateWorkspace: (partial) =>
        set((s) => ({ workspace: s.workspace ? { ...s.workspace, ...partial } : null })),
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('rh_token');
        set({ user: null, workspace: null, token: null });
      },
    }),
    { name: 'rh_auth' }
  )
);
