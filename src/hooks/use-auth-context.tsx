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

export function AuthProvider({ user, children }: { user: User | null; children: React.Node }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    console.log("DEBUG (context): Iniciando busca de projetos no cliente...");
    setLoading(true);
    try {
      const fetchedProjects = await getProjectsAction();
      console.log(`DEBUG (context): Recebidos ${fetchedProjects.length} projetos da Server Action.`);
      setProjects(fetchedProjects ?? []); // Garante que nunca seja nulo
    } catch (error) {
      console.error("DEBUG (context): Erro ao buscar projetos:", error);
      setProjects([]); // Fallback para array vazio em caso de erro
    } finally {
      setLoading(false);
      console.log("DEBUG (context): Busca de projetos finalizada.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const refreshProjects = () => {
    fetchProjects();
  };

  const value = {
    user,
    projects: projects ?? [], // Garante que o valor do contexto nunca seja nulo
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
