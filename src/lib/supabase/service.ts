// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task, ChangeLog } from '@/lib/types'; // Adicionado ChangeLog

// ... (outras funções mantidas como estão) ...

// A função updateUser já está correta, mas vamos garantir que ela passe os dados do perfil
export async function updateUser(userId: string, userData: Partial<Omit<User, 'id'>>): Promise<void> {
    const { error } = await supabase.from('users').update(userData).eq('id', userId);
    if (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

// ... (outras funções de projeto mantidas) ...

export async function updateTask(taskId: string, taskData: Partial<Omit<Task, 'id' | 'subTasks'>>) {
  const { dependencies, assignee, changeHistory, ...restTaskData } = taskData;

  const taskToUpdate: { [key: string]: any } = {
    ...restTaskData,
    assignee_id: assignee?.id,
    planned_start_date: restTaskData.plannedStartDate,
    planned_end_date: restTaskData.plannedEndDate,
    actual_start_date: restTaskData.actualStartDate,
    actual_end_date: restTaskData.actualEndDate,
    planned_hours: restTaskData.plannedHours,
    actual_hours: restTaskData.actualHours,
    is_critical: restTaskData.isCritical,
    is_milestone: restTaskData.isMilestone,
    parent_id: restTaskData.parentId,
    // Adiciona o novo histórico ao objeto de atualização
    change_history: changeHistory, 
  };

  // Remove campos undefined para não sobrescrever com null no banco
  Object.keys(taskToUpdate).forEach(key => taskToUpdate[key] === undefined && delete taskToUpdate[key]);

  const { error } = await supabase
    .from('tasks')
    .update(taskToUpdate)
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task:', JSON.stringify(error, null, 2));
    throw error;
  }

  // Lógica para atualizar dependências
  if (dependencies) {
    await supabase.from('task_dependencies').delete().eq('task_id', taskId);
    if (dependencies.length > 0) {
        const dependencyInserts = dependencies.map(depId => ({
            task_id: taskId,
            depends_on_task_id: depId,
        }));
        const { error: depError } = await supabase.from('task_dependencies').insert(dependencyInserts);
        if (depError) {
            console.error('Error updating dependencies:', depError);
            throw depError;
        }
    }
  }
}

// ... (resto do arquivo mantido) ...
