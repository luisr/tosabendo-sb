// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task } from '@/lib/types';

// ===== Funções de Usuários =====
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error("Erro ao buscar todos os usuários:", error);
    throw error;
  }
  return data ?? [];
}

export async function updateUser(userId: string, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase.from('users').update(userData).eq('id', userId);
    if (error) {
        console.error("Erro ao atualizar usuário:", error);
        throw error;
    }
}

// ===== Funções de Projetos =====

export async function createProject(projectData: Partial<Project>): Promise<string> {
    const { data, error } = await supabase
        .from('projects')
        .insert([
            { 
                name: projectData.name,
                description: projectData.description,
                planned_start_date: projectData.plannedStartDate,
                planned_end_date: projectData.plannedEndDate,
                planned_budget: projectData.plannedBudget,
            },
        ])
        .select('id')
        .single();

    if (error) {
        console.error("Erro ao criar projeto:", error);
        throw error;
    }
    return data.id;
}


/**
 * Busca os detalhes de um projeto usando uma consulta select padrão.
 * As políticas de segurança (RLS) agora devem estar configuradas para permitir isso sem recursão.
 * @param id - O UUID do projeto a ser buscado.
 * @returns O objeto do projeto completo ou undefined se não for encontrado.
 */
export async function getProject(id: string): Promise<Project | undefined> {
    const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
            *,
            manager:users!projects_manager_id_fkey(*),
            team:project_team(role, user:users(*))
        `)
        .eq('id', id)
        .single();

    if (projectError) {
        if (projectError.code === 'PGRST116') return undefined; // Nenhum projeto encontrado, não é um erro.
        console.error('Erro ao buscar projeto:', JSON.stringify(projectError, null, 2));
        throw error;
    }

    if (!projectData) return undefined;
    
    const tasks = await getTasks(projectData.id);

    return {
      id: projectData.id,
      name: projectData.name ?? 'Projeto sem nome',
      description: projectData.description ?? '',
      manager: projectData.manager,
      team: (projectData.team ?? []).map((tm: any) => ({ user: tm.user, role: tm.role })),
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

// ===== Funções de Tarefas =====
export async function getTasks(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);
        
    if (error) { 
        console.error('Error fetching tasks:', error);
        return [];
    }
    return data as Task[] ?? [];
}
