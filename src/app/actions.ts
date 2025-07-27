'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Project, ProjectRole, User } from '@/lib/types'

// Função auxiliar para buscar o perfil do usuário logado
async function getAuthenticatedUserProfile(supabase: any): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();
  
  return userProfile as User;
}

export async function getProjectsAction(): Promise<Project[]> {
  const supabase = createClient(); // Cliente que respeita a RLS
  const user = await getAuthenticatedUserProfile(supabase);

  if (!user) {
    return [];
  }

  let projectIds: string[];

  // Se o usuário for Super Admin, ele tem acesso a todos os projetos.
  if (user.role === 'Super Admin') {
    const { data, error } = await supabaseAdmin.from('projects').select('id');
    if (error) {
      console.error('Error fetching all project IDs for Super Admin:', error);
      return [];
    }
    projectIds = data.map(p => p.id);
  } else {
    // Para outros usuários, fazemos uma consulta simples que a RLS pode resolver sem recursão.
    const { data, error } = await supabase.from('projects').select('id');
    if (error) {
      console.error('Error fetching user project IDs:', error);
      return [];
    }
    projectIds = data.map(p => p.id);
  }

  if (projectIds.length === 0) {
    return [];
  }

  // Agora, com os IDs seguros, usamos o cliente admin para buscar todos os dados completos.
  // Esta consulta ignora a RLS e evita qualquer possibilidade de recursão.
  const { data: projects, error } = await supabaseAdmin
    .from('projects')
    .select(`
      id, name, description, planned_start_date, planned_end_date,
      actual_start_date, actual_end_date, planned_budget, actual_cost,
      kpis, configuration,
      manager:users!projects_manager_id_fkey(*),
      team:project_team(role, user:users(*))
    `)
    .in('id', projectIds);

  if (error) {
    console.error('Error fetching full projects data with admin client:', error);
    return [];
  }

  // Mapeamento robusto com fallbacks.
  return (projects ?? []).map((p: any) => ({
    id: p.id,
    name: p.name ?? 'Projeto sem nome',
    description: p.description ?? '',
    manager: p.manager ?? null,
    plannedStartDate: p.planned_start_date,
    plannedEndDate: p.planned_end_date,
    actualStartDate: p.actual_start_date,
    actualEndDate: p.actual_end_date,
    plannedBudget: p.planned_budget ?? 0,
    actualCost: p.actual_cost ?? 0,
    team: (p.team ?? []).map((tm: any) => ({ user: tm.user, role: tm.role as ProjectRole })).filter(tm => tm.user),
    tasks: [],
    kpis: p.kpis ?? {},
    configuration: p.configuration ?? {},
  }));
}
