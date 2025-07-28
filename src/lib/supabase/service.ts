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

export async function createUser(userData: Omit<User, 'id'>): Promise<string> {
    const { data, error } = await supabase.from('users').insert(userData).select('id').single();
    if (error) { throw error; }
    return data.id;
}


// ===== Funções de Projetos =====

export async function getProject(id: string): Promise<Project | undefined> {
    const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`*, manager:users(*), team:project_team(role, user:users(*))`)
        .eq('id', id)
        .single();

    if (projectError) { throw projectError; }
    if (!projectData) return undefined;
    
    const tasks = await getTasks(id);

    return { ...projectData, tasks } as Project;
}

// ===== Funções de Tarefas =====

export async function getTasks(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*, assignee:users(*)').eq('project_id', projectId);
    if (error) { throw error; }
    return data as Task[] ?? [];
}

export async function createTask(taskData: Omit<Task, 'id' | 'subTasks' | 'changeHistory'>): Promise<string> {
  const { dependencies, assignee, ...restTaskData } = taskData;
  const { data, error } = await supabase.from('tasks').insert({ ...restTaskData, assignee_id: assignee?.id }).select('id').single();
  if (error) { throw error; }
  
  const newTaskId = data.id;
  if (dependencies && dependencies.length > 0) {
    const dependencyInserts = dependencies.map(depId => ({ task_id: newTaskId, depends_on_task_id: depId }));
    const { error: depError } = await supabase.from('task_dependencies').insert(dependencyInserts);
    if (depError) { throw depError; }
  }
  return newTaskId;
}

export async function updateTask(taskId: string, taskData: Partial<Omit<Task, 'id' | 'subTasks'>>) {
  const { dependencies, assignee, changeHistory, ...restTaskData } = taskData;
  const taskToUpdate: { [key: string]: any } = { ...restTaskData, assignee_id: assignee?.id, change_history: changeHistory };
  Object.keys(taskToUpdate).forEach(key => taskToUpdate[key] === undefined && delete taskToUpdate[key]);

  const { error } = await supabase.from('tasks').update(taskToUpdate).eq('id', taskId);
  if (error) { throw error; }

  if (dependencies) {
    await supabase.from('task_dependencies').delete().eq('task_id', taskId);
    if (dependencies.length > 0) {
      const dependencyInserts = dependencies.map(depId => ({ task_id: taskId, depends_on_task_id: depId }));
      await supabase.from('task_dependencies').insert(dependencyInserts);
    }
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) { throw error; }
}
