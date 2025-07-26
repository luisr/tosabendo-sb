// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task } from '@/lib/types';
import { DEFAULT_PASSWORD, DEFAULT_AVATAR } from '../constants';

// ===== Funções de Usuários Refatoradas =====

/**
 * Busca todos os usuários do banco de dados.
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');

  if (error) {
    console.error('Error fetching users:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data || [];
}

/**
 * Cria um novo usuário no banco de dados.
 * @param userData - Os dados do usuário a serem criados.
 * @returns O ID do novo usuário.
 */
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

/**
 * Atualiza um usuário existente no banco de dados.
 * @param userData - O objeto de usuário completo contendo o ID e os novos dados.
 */
export async function updateUser(userData: User): Promise<void> {
  const { id, ...updateData } = userData;

  const { error } = await supabase
    .from('users')
    .update({
      name: updateData.name,
      email: updateData.email,
      password: updateData.password,
      role: updateData.role,
      avatar: updateData.avatar,
      status: updateData.status,
      phone: updateData.phone,
      must_change_password: updateData.mustChangePassword,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating user:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Deleta um usuário do banco de dados.
 * @param userId - O ID do usuário a ser deletado.
 */
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


// ===== Funções Antigas (Manter por compatibilidade, se necessário) =====

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
            team:project_team(role, user:users(*))
        `)
        .eq('id', id)
        .single();

    if (projectError) {
        if (projectError.code === 'PGRST116') return undefined; // Not found
        console.error('Error fetching project:', JSON.stringify(projectError, null, 2));
        throw projectError;
    }

    const tasks = await getTasks(id);

    return {
        ...projectData,
        manager: Array.isArray(projectData.manager) ? projectData.manager[0] : projectData.manager,
        plannedStartDate: projectData.planned_start_date,
        plannedEndDate: projectData.planned_end_date,
        actualStartDate: projectData.actual_start_date,
        actualEndDate: projectData.actual_end_date,
        plannedBudget: projectData.planned_budget,
        actualCost: projectData.actual_cost,
        tasks,
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

// ===== Funções de Tarefas =====

export async function getTasks(projectId: string): Promise<Task[]> {
    const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:users(*),
            status:statuses(*),
            dependencies:task_dependencies!task_id(depends_on_task_id)
        `)
        .eq('project_id', projectId);

    if (tasksError) {
        console.error('Error fetching tasks:', JSON.stringify(tasksError, null, 2));
        throw tasksError;
    }

    const tasksMap = new Map<string, Task>();
    const tasks: Task[] = (tasksData || []).map((task: any) => {
        const mappedTask: Task = {
            id: task.id,
            name: task.name,
            description: task.description,
            assignee: task.assignee,
            status: task.status.name, // Assumindo que status é um objeto e queremos o nome
            priority: task.priority,
            plannedStartDate: task.planned_start_date,
            plannedEndDate: task.planned_end_date,
            actualStartDate: task.actual_start_date,
            actualEndDate: task.actual_end_date,
            plannedHours: task.planned_hours,
            actualHours: task.actual_hours,
            dependencies: task.dependencies.map((dep: any) => dep.depends_on_task_id),
            isCritical: task.is_critical,
            isMilestone: task.is_milestone,
            changeHistory: [], // O histórico pode ser carregado separadamente se necessário
            subTasks: [], // Subtarefas serão aninhadas a seguir
            parentId: task.parent_id,
        };
        tasksMap.set(mappedTask.id, mappedTask);
        return mappedTask;
    });

    const taskTree: Task[] = [];
    tasks.forEach(task => {
        if (task.parentId && tasksMap.has(task.parentId)) {
            const parent = tasksMap.get(task.parentId);
            parent?.subTasks?.push(task);
        } else {
            taskTree.push(task);
        }
    });

    return taskTree;
}

export async function createTask(taskData: Omit<Task, 'id' | 'subTasks' | 'changeHistory'>): Promise<string> {
    const { dependencies, ...rest } = taskData;

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            ...rest,
            planned_start_date: rest.plannedStartDate,
            planned_end_date: rest.plannedEndDate,
            actual_start_date: rest.actualStartDate,
            actual_end_date: rest.actualEndDate,
            planned_hours: rest.plannedHours,
            actual_hours: rest.actualHours,
            is_critical: rest.isCritical,
            is_milestone: rest.isMilestone,
            parent_id: rest.parentId,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error creating task:', JSON.stringify(error, null, 2));
        throw error;
    }

    if (dependencies && dependencies.length > 0) {
        const dependencyInserts = dependencies.map(depId => ({
            task_id: data.id,
            depends_on_task_id: depId,
        }));
        const { error: depError } = await supabase.from('task_dependencies').insert(dependencyInserts);
        if (depError) {
            console.error('Error setting task dependencies:', JSON.stringify(depError, null, 2));
            // Considerar deletar a tarefa criada se a dependência falhar
            throw depError;
        }
    }

    return data.id;
}

export async function updateTask(taskId: string, taskData: Partial<Omit<Task, 'id' | 'subTasks' | 'changeHistory'>>): Promise<void> {
    const { dependencies, ...rest } = taskData;

    const { error } = await supabase
        .from('tasks')
        .update({
            ...rest,
            planned_start_date: rest.plannedStartDate,
            planned_end_date: rest.plannedEndDate,
            actual_start_date: rest.actualStartDate,
            actual_end_date: rest.actualEndDate,
            planned_hours: rest.plannedHours,
            actual_hours: rest.actualHours,
            is_critical: rest.isCritical,
            is_milestone: rest.isMilestone,
            parent_id: rest.parentId,
        })
        .eq('id', taskId);

    if (error) {
        console.error('Error updating task:', JSON.stringify(error, null, 2));
        throw error;
    }

    if (dependencies) {
        // Remove old dependencies
        await supabase.from('task_dependencies').delete().eq('task_id', taskId);

        // Add new dependencies
        if (dependencies.length > 0) {
            const dependencyInserts = dependencies.map(depId => ({
                task_id: taskId,
                depends_on_task_id: depId,
            }));
            const { error: depError } = await supabase.from('task_dependencies').insert(dependencyInserts);
            if (depError) {
                console.error('Error updating task dependencies:', JSON.stringify(depError, null, 2));
                throw depError;
            }
        }
    }
}

export async function deleteTask(taskId: string): Promise<void> {
    // Primeiro, delete as dependências associadas para evitar violação de chave estrangeira
    await supabase.from('task_dependencies').delete().eq('task_id', taskId);
    await supabase.from('task_dependencies').delete().eq('depends_on_task_id', taskId);

    // Agora, delete a tarefa
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (error) {
        console.error('Error deleting task:', JSON.stringify(error, null, 2));
        throw error;
    }
}
