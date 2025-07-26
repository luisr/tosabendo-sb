'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Project, ProjectRole, User } from '@/lib/types'

export async function getProjectsAction(): Promise<Project[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Embora o middleware deva proteger, esta é uma verificação de segurança extra.
    return []
  }

  // Usamos o cliente admin (com a service_role) para buscar todos os projetos, ignorando a RLS.
  const { data: allProjects, error: projectsError } = await supabaseAdmin
    .from('projects')
    .select(`
      id, name, description, planned_start_date, planned_end_date,
      actual_start_date, actual_end_date, planned_budget, actual_cost,
      kpis, configuration,
      manager:users!projects_manager_id_fkey(*),
      team:project_team(role, user:users(*))
    `);

  if (projectsError) {
    console.error('Server Action Error fetching all projects:', JSON.stringify(projectsError, null, 2));
    // Em um cenário de produção, você poderia registrar isso em um serviço de log.
    // Retornar um array vazio é uma forma segura de lidar com o erro na UI.
    return [];
  }

  // Filtramos os projetos no servidor para retornar apenas aqueles aos quais o usuário pertence.
  const userProjects = (allProjects ?? []).filter(project =>
    project.team.some((member: any) => member.user?.id === user.id) ||
    (project.manager && project.manager.id === user.id)
  );

  // Mapeamento robusto com fallbacks.
  return userProjects.map((p: any) => ({
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
