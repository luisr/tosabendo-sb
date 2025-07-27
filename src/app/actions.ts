'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Project, ProjectRole, User } from '@/lib/types'

async function getUserWithRole(supabase: any) {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: userProfile } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', authUser.id)
    .single();
  
  return userProfile as User;
}

export async function getProjectsAction(): Promise<Project[]> {
  const supabase = createClient(); // Cliente que respeita a RLS
  const user = await getUserWithRole(supabase);

  if (!user) {
    return [];
  }

  let query;

  // Se o usuário for Super Admin, use o cliente admin para buscar TODOS os projetos.
  if (user.role === 'Super Admin') {
    query = supabaseAdmin
      .from('projects')
      .select(`
        id, name, description, planned_start_date, planned_end_date,
        actual_start_date, actual_end_date, planned_budget, actual_cost,
        kpis, configuration,
        manager:users!projects_manager_id_fkey(*),
        team:project_team(role, user:users(*))
      `);
  } else {
    // Para todos os outros usuários, use o cliente padrão que respeita a RLS
    // que acabamos de configurar. O banco de dados fará a filtragem para nós.
    query = supabase
      .from('projects')
      .select(`
        id, name, description, planned_start_date, planned_end_date,
        actual_start_date, actual_end_date, planned_budget, actual_cost,
        kpis, configuration,
        manager:users!projects_manager_id_fkey(*),
        team:project_team(role, user:users(*))
      `);
  }

  const { data: projects, error } = await query;

  if (error) {
    console.error('Error fetching projects in Server Action:', JSON.stringify(error, null, 2));
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
