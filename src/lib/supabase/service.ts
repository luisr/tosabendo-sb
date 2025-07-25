// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task } from '@/lib/types';
import { DEFAULT_PASSWORD, DEFAULT_AVATAR } from '../constants';

// ===== Funções de Usuários =====

export async function getUsers(): Promise<User[]> {
  const superAdmin: User = {
    id: 'super-admin-001',
    name: 'Luis Ribeiro',
    email: 'luis.ribeiro@beachpark.com.br',
    password: DEFAULT_PASSWORD,
    role: 'Admin',
    avatar: DEFAULT_AVATAR,
    status: 'active',
    mustChangePassword: false,
    phone: undefined,
  };

  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error('Error fetching users:', JSON.stringify(error, null, 2));
    throw error;
  }

  const userList: User[] = data || [];
  const adminExists = userList.some(u => u.email === superAdmin.email);

  if (!adminExists) {
    return [superAdmin, ...userList];
  }
  return [superAdmin, ...userList.filter(u => u.email !== superAdmin.email)];
}

export async function createUser(userData: Omit<User, 'id'>): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      avatar: userData.avatar,
      status: userData.status,
      phone: userData.phone,
      must_change_password: userData.mustChangePassword,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating user:', JSON.stringify(error, null, 2));
    throw error;
  }

  return data.id;
}

export async function updateUser(userId: string, userData: Partial<Omit<User, 'id'>>): Promise<void> {
  const updateData: any = {};

  if (userData.name !== undefined) updateData.name = userData.name;
  if (userData.email !== undefined) updateData.email = userData.email;
  if (userData.password !== undefined) updateData.password = userData.password;
  if (userData.role !== undefined) updateData.role = userData.role;
  if (userData.avatar !== undefined) updateData.avatar = userData.avatar;
  if (userData.status !== undefined) updateData.status = userData.status;
  if (userData.phone !== undefined) updateData.phone = userData.phone;
  if (userData.mustChangePassword !== undefined) updateData.must_change_password = userData.mustChangePassword;

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// ===== Funções de Projetos =====

export async function getProjects(): Promise<Project[]> {
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      planned_start_date,
      planned_end_date,
      actual_start_date,
      actual_end_date,
      planned_budget,
      actual_cost,
      kpis,
      configuration,
      manager:users!projects_manager_id_fkey(*),
      team:project_team(
        role,
        user:users(*)
      )
    `);

  if (projectsError) {
    console.error('Error fetching projects:', JSON.stringify(projectsError, null, 2));
    throw projectsError;
  }

  const projects = projectsData || [];

  return projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description,
    // CORREÇÃO: Pega o primeiro item do array 'manager' para corresponder ao tipo 'User'
    manager: Array.isArray(project.manager) ? project.manager[0] : project.manager,
    plannedStartDate: project.planned_start_date,
    plannedEndDate: project.planned_end_date,
    actualStartDate: project.actual_start_date,
    actualEndDate: project.actual_end_date,
    plannedBudget: project.planned_budget,
    actualCost: project.actual_cost,
    team: project.team,
    tasks: [], // Tarefas não são buscadas na lista geral para performance
    kpis: project.kpis || {},
    configuration: project.configuration || {},
  })) as Project[];
}

export async function getProject(id: string): Promise<Project | undefined> {
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      manager:users!projects_manager_id_fkey(*),
      team:project_team(
        role,
        user:users(*)
      )
    `)
    .eq('id', id)
    .single();

  if (projectError) {
    if (projectError.code === 'PGRST116') return undefined; // Not found
    console.error('Error fetching project:', JSON.stringify(projectError, null, 2));
    throw projectError;
  }
  
  // TODO: Buscar as tarefas relacionadas a este projeto
  
  return {
    ...projectData,
    tasks: [] // Adicionar a busca de tarefas aqui
  } as Project;
}

export async function updateProject(projectId: string, data: Partial<Omit<Project, 'id'>>): Promise<void> {
  const updateData: any = {};
  
  if (data.name) updateData.name = data.name;
  if (data.description) updateData.description = data.description;
  if (data.manager) updateData.manager_id = data.manager.id;
  if (data.plannedStartDate) updateData.planned_start_date = data.plannedStartDate;
  if (data.plannedEndDate) updateData.planned_end_date = data.plannedEndDate;
  if (data.actualStartDate) updateData.actual_start_date = data.actualStartDate;
  if (data.actualEndDate) updateData.actual_end_date = data.actualEndDate;
  if (data.plannedBudget !== undefined) updateData.planned_budget = data.plannedBudget;
  if (data.actualCost !== undefined) updateData.actual_cost = data.actualCost;
  if (data.kpis) updateData.kpis = data.kpis;
  if (data.configuration) updateData.configuration = data.configuration;
  if (data.criticalPath) updateData.critical_path = data.criticalPath;

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project:', JSON.stringify(error, null, 2));
    throw error;
  }

  if (data.team) {
    await supabase.from('project_team').delete().eq('project_id', projectId);
    if (data.team.length > 0) {
      const teamInserts = data.team.map(member => ({
        project_id: projectId,
        user_id: member.user.id,
        role: member.role,
      }));
      const { error: teamError } = await supabase.from('project_team').insert(teamInserts);
      if (teamError) {
        console.error('Error updating team members:', JSON.stringify(teamError, null, 2));
        throw teamError;
      }
    }
  }
}
