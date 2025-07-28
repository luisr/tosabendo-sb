'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Project, ProjectRole, User } from '@/lib/types'

// Função auxiliar para buscar o perfil completo do usuário autenticado
async function getUserWithRole(supabase: any): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: userProfile } = await supabase
    .from('users')
    .select('*') // Busca todos os campos, incluindo a 'role'
    .eq('id', authUser.id)
    .single();
  
  return userProfile as User;
}

export async function getProjectsAction(): Promise<Project[]> {
  const supabase = createClient();
  const user = await getUserWithRole(supabase);

  if (!user) {
    console.log("DEBUG (actions.ts): Usuário não autenticado. Retornando array vazio.");
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
    projectIds = (data ?? []).map(p => p.id);
  } else {
    // Para outros usuários, fazemos uma consulta simples que a RLS pode resolver.
    const { data, error } = await supabase.from('projects').select('id');
    if (error) {
      console.error('Error fetching user project IDs:', error);
      return [];
    }
    projectIds = (data ?? []).map(p => p.id);
  }

  if (projectIds.length === 0) {
    return [];
  }

  // Com os IDs seguros, usamos o cliente admin para buscar todos os dados completos.
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

  // Mapeamento defensivo.
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
