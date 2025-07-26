'use client'

import { createContext, useContext, ReactNode } from 'react';
import type { User } from '@/lib/types';

const AuthContext = createContext<User | null>(null);

export function AuthProvider({ user, children }: { user: User | null; children: ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
