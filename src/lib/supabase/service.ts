// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task, TeamMember, ProjectRole } from '@/lib/types';

// ===== Funções de Usuários =====

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data ?? [];
}

export async function createUser(userData: Omit<User, 'id'>): Promise<string> {
  const { data, error } = await supabase.from('users').insert(userData).select('id').single();
  if (error) {
    console.error('Error creating user:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data.id;
}

export async function updateUser(userData: User): Promise<void> {
  const { id, ...updateData } = userData;
  const { error } = await supabase.from('users').update(updateData).eq('id', id);
  if (error) {
    console.error('Error updating user:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) {
    console.error('Error deleting user:', JSON.stringify(error, null, 2));
    throw error;
  }
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

  if (projectError) {
    console.error('Error creating project:', JSON.stringify(projectError, null, 2));
    throw projectError;
  }

  const { error: teamError } = await supabase
    .from('project_team')
    .insert({
      project_id: newProject.id,
      user_id: managerId,
      role: 'Manager',
    });

  if (teamError) {
    console.error('Error adding manager to project team:', JSON.stringify(teamError, null, 2));
    throw teamError;
  }

  return {
    ...newProject,
    manager: { id: managerId } as User,
    team: [],
    tasks: [],
  } as Project;
}

// ... (resto das funções de projeto e tarefas mantidas como estão) ...
