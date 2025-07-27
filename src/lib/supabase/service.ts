// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task, ChangeLog } from '@/lib/types';

// ===== Funções de Usuários =====
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) { throw error; }
  return data ?? [];
}

export async function updateUser(userId: string, userData: Partial<Omit<User, 'id'>>): Promise<void> {
    const { error } = await supabase.from('users').update(userData).eq('id', userId);
    if (error) { throw error; }
}

// ===== Funções de Projetos =====

export async function createProject(
  projectData: Omit<Project, 'id' | 'manager' | 'team' | 'tasks' | 'kpis' | 'configuration'>,
  managerId: string
): Promise<Project> {
  const { data: newProject, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: projectData.name,
      description: projectData.description,
      manager_id: managerId,
      planned_start_date: projectData.plannedStartDate,
      planned_end_date: projectData.plannedEndDate,
      planned_budget: projectData.plannedBudget,
    })
    .select('*')
    .single();

  if (projectError) { throw projectError; }

  const { error: teamError } = await supabase
    .from('project_team')
    .insert({
      project_id: newProject.id,
      user_id: managerId,
      role: 'Manager',
    });

  if (teamError) { throw teamError; }

  return {
    ...newProject,
    manager: { id: managerId } as User,
    team: [],
    tasks: [],
  } as Project;
}

// ===== Funções de Tarefas =====

export async function createTask(taskData: Omit<Task, 'id' | 'subTasks' | 'changeHistory'>): Promise<string> {
  const { dependencies, assignee, ...restTaskData } = taskData;
  const { error } = await supabase.from('tasks').insert({ ...restTaskData, assignee_id: assignee?.id });
  if (error) { throw error; }
  // Simplificado por enquanto, a lógica completa de dependências pode ser adicionada depois
  return "new-task-id"; // Placeholder
}


export async function updateTask(taskId: string, taskData: Partial<Omit<Task, 'id' | 'subTasks'>>) {
  const { dependencies, assignee, changeHistory, ...restTaskData } = taskData;
  const taskToUpdate: { [key: string]: any } = {
    ...restTaskData,
    assignee_id: assignee?.id,
    change_history: changeHistory, 
  };
  Object.keys(taskToUpdate).forEach(key => taskToUpdate[key] === undefined && delete taskToUpdate[key]);
  const { error } = await supabase.from('tasks').update(taskToUpdate).eq('id', taskId);
  if (error) { throw error; }
  if (dependencies) {
    // ... (lógica de dependências) ...
  }
}
