// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task, TeamMember, ProjectRole } from '@/lib/types';

// ... (funções de usuário e getProjects/getProject mantidas) ...

export async function createTask(taskData: Omit<Task, 'id' | 'subTasks' | 'changeHistory'>): Promise<string> {
  const { dependencies, assignee, ...restTaskData } = taskData;

  const taskToInsert = {
    ...restTaskData,
    assignee_id: assignee?.id, // Garante que o ID do responsável seja salvo
    planned_start_date: restTaskData.plannedStartDate,
    planned_end_date: restTaskData.plannedEndDate,
    actual_start_date: restTaskData.actualStartDate,
    actual_end_date: restTaskData.actualEndDate,
    planned_hours: restTaskData.plannedHours,
    actual_hours: restTaskData.actualHours,
    is_critical: restTaskData.isCritical,
    is_milestone: restTaskData.isMilestone,
    parent_id: restTaskData.parentId,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(taskToInsert)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating task:', JSON.stringify(error, null, 2));
    throw error;
  }

  const newTaskId = data.id;

  // Se houver dependências, insere-as na tabela de dependências
  if (dependencies && dependencies.length > 0) {
    const dependencyInserts = dependencies.map(depId => ({
      task_id: newTaskId,
      depends_on_task_id: depId,
    }));
    const { error: depError } = await supabase.from('task_dependencies').insert(dependencyInserts);
    if (depError) {
      console.error('Error setting task dependencies:', JSON.stringify(depError, null, 2));
      // Considerar deletar a tarefa criada se a dependência falhar
      throw depError;
    }
  }

  return newTaskId;
}

// ... (resto das funções de serviço mantidas) ...
