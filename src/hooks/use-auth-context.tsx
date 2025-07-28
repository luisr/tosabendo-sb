// src/hooks/use-auth-context.tsx
'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { User, Project } from '@/lib/types';
import { getProjectsAction } from '@/app/actions';

interface AuthContextType {
  user: User | null;
  projects: Project[];
  loading: boolean;
  refreshProjects: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ user, children }: { user: User | null; children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const fetchedProjects = await getProjectsAction();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Failed to fetch projects in context:", error);
      setProjects([]); // Em caso de erro, define como vazio
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const refreshProjects = () => {
    fetchProjects();
  };

  const value = {
    user,
    projects,
    loading,
    refreshProjects,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
