// src/lib/supabase/service.ts
import { supabase as userSupabase } from './config'; // Cliente do usuário com RLS
import { supabaseAdmin } from './admin'; // Cliente privilegiado que ignora RLS
import type { Project, User, Task, TeamMember, ProjectRole } from '@/lib/types';

// ===== Funções de Usuários (sem alterações) =====
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await userSupabase.from('users').select('id, name, email, avatar, role, status');
  if (error) {
    console.error('Error fetching users:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data ?? [];
}

export async function createUser(userData: Omit<User, 'id'>): Promise<string> {
  const { data, error } = await userSupabase.from('users').insert(userData).select('id').single();
  if (error) {
    console.error('Error creating user:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data.id;
}

export async function updateUser(userData: User): Promise<void> {
  const { id, ...updateData } = userData;
  const { error } = await userSupabase.from('users').update(updateData).eq('id', id);
  if (error) {
    console.error('Error updating user:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await userSupabase.from('users').delete().eq('id', userId);
  if (error) {
    console.error('Error deleting user:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// ===== Funções de Projetos (REESCRITA FINAL) =====

export async function getProjects(): Promise<Project[]> {
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return [];

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
    console.error('Error fetching all projects with service role:', JSON.stringify(projectsError, null, 2));
    throw projectsError;
  }

  const userProjects = (allProjects ?? []).filter(project =>
    project.team.some((member: any) => member.user?.id === user.id) ||
    (project.manager && project.manager.id === user.id)
  );

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


export async function getProject(id: string): Promise<Project | undefined> {
    const { data: projectData, error: projectError } = await userSupabase
        .from('projects')
        .select(`
            *,
            manager:users!projects_manager_id_fkey(*),
            team:project_team(role, user:users(*))
        `)
        .eq('id', id)
        .single();

    if (projectError) {
        if (projectError.code === 'PGRST116') return undefined;
        console.error('Error fetching project:', JSON.stringify(projectError, null, 2));
        throw projectError;
    }

    if (!projectData) return undefined;
    
    const tasks = await getTasks(id);

    return {
      id: projectData.id,
      name: projectData.name ?? 'Projeto sem nome',
      description: projectData.description ?? '',
      manager: (Array.isArray(projectData.manager) ? projectData.manager[0] : projectData.manager) ?? null,
      team: (projectData.team ?? []).map((tm: any) => ({ user: tm.user, role: tm.role as ProjectRole })),
      plannedStartDate: projectData.planned_start_date,
      plannedEndDate: projectData.planned_end_date,
      actualStartDate: projectData.actual_start_date,
      actualEndDate: projectData.actual_end_date,
      plannedBudget: projectData.planned_budget ?? 0,
      actualCost: projectData.actual_cost ?? 0,
      tasks,
      kpis: projectData.kpis ?? {},
      configuration: projectData.configuration ?? {},
    } as Project;
}


export async function updateProject(projectId: string, data: Partial<Omit<Project, 'id'>>) {
  // ... (código existente mantido)
}

// ===== Funções de Tarefas =====
export async function getTasks(projectId: string): Promise<Task[]> {
  // ... (código existente mantido)
}
export async function createTask(taskData: Omit<Task, 'id' | 'subTasks' | 'changeHistory'>): Promise<string> {
  // ... (código existente mantido)
}
export async function updateTask(taskId: string, taskData: Partial<Omit<Task, 'id' | 'subTasks' | 'changeHistory'>>): Promise<void> {
  // ... (código existente mantido)
}
export async function deleteTask(taskId: string): Promise<void> {
  // ... (código existente mantido)
}
