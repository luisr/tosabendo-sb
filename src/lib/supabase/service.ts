// src/lib/supabase/service.ts
import { supabase } from './config';
// Ajustar imports para incluir todos os tipos necessários do seu projeto
import type { Project, User, Task, StatusDefinition, CustomFieldDefinition, ActiveAlert, TeamMember, KpiData, AlertRule, ChangeHistoryEntry, Attachment } from '@/lib/types';
import { DEFAULT_PASSWORD, DEFAULT_AVATAR } from '../constants';
import { v4 as uuidv4 } from 'uuid'; // Necessário para gerar IDs para novas entidades

// Helper para estruturar subtarefas recursivamente no backend (da Tarefa 201)
// Nota: Este helper assume que a consulta do DB retorna as tarefas de forma flat com parent_id
// A tipagem 'any' é usada aqui para simplificar o helper genérico
function structureSubtasks(tasks: any[], parentId: string | null = null): Task[] {
  const directChildren = tasks
    .filter(task => task.parent_id === parentId)
    .map(task => {
        // Mapear campos do DB (snake_case) para o tipo Task (camelCase) e estruturar relacionamentos
        const structuredTask: Task = {
           id: task.id,
           name: task.name,
           description: task.description,
           parentId: task.parent_id,
           assignee: task.assignee, // Assumindo que o JOIN para assignee já trouxe o objeto user aninhado
           status: task.status?.name || null, // Usar o nome do status do objeto status aninhado, pode ser null
           priority: task.priority,
           progress: task.progress,
           plannedStartDate: task.planned_start_date,
           plannedEndDate: task.planned_end_date,
           actualStartDate: task.actual_start_date,
           actualEndDate: task.actual_end_date,
           plannedHours: task.planned_hours,
           actualHours: task.actual_hours,
           // Mapear dependências do objeto aninhado 'dependencies' obtido pelo JOIN
           dependencies: task.dependencies ? task.dependencies.map((dep: any) => dep.depends_on_task_id) : [],
           isCritical: task.is_critical,
           isMilestone: task.is_milestone,
           baselineStartDate: task.baseline_start_date,
           baselineEndDate: task.baseline_end_date,
            // Estruturar custom fields do objeto aninhado 'custom_field_values'
           customFields: task.custom_field_values ? task.custom_field_values.reduce((acc: any, cfv: any) => {
               // Se o JOIN para custom_field trouxe o nome: acc[cfv.custom_field.name] = cfv.value;
               acc[cfv.custom_field_id] = cfv.value; // Usando custom_field_id como chave se o nome não for buscado
               return acc;
           }, {}) : {},
            // Estruturar histórico de mudanças do objeto aninhado 'change_history'
           changeHistory: task.change_history ? task.change_history.map((history: any) => ({
                fieldChanged: history.field_changed,
                oldValue: history.old_value,
                newValue: history.new_value,
                user: history.user, // Assumindo que o JOIN para user já trouxe o objeto user aninhado
                timestamp: history.timestamp,
                justification: history.justification,
           })) : [],
           attachments: [], // Assumindo que attachments não estão no DB relacional ainda
           subTasks: [], // Será preenchido recursivamente
           createdAt: task.created_at,
           updatedAt: task.updated_at,
       };
       return structuredTask;
    });

  return directChildren.map(task => ({
    ...task,
    subTasks: structureSubtasks(tasks, task.id), // Recursão para subtarefas
  }));
}


// Funções Originais (não refatoradas nas Tarefas 201/202)

export async function getUsers(): Promise<User[]> {
  // Super admin hardcoded - NOTA: Risco de segurança (PA 49). Deve ser removido (Tarefa 205).
  const superAdmin: User = {
    id: 'super-admin-001',
    name: 'Luis Ribeiro',
    email: 'luis.ribeiro@beachpark.com.br',
    password: DEFAULT_PASSWORD, // Nota: Senha hardcoded é um risco de segurança (PA 49)
    role: 'Admin',
    avatar: DEFAULT_AVATAR,
    status: 'active',
    mustChangePassword: false,
    phone: undefined, // Adicionado para completar o tipo User
  };

  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error fetching users:', JSON.stringify(error, null, 2));
    // Melhorar tratamento de erros (PA 50)
    throw error;
  }

  const userList: User[] = data || [];

  // Ensure the super admin is always present and is the first user
  const adminExists = userList.some(u => u.email === superAdmin.email);
  if (!adminExists) {
    return [superAdmin, ...userList];
  }

  // If admin exists from DB, make sure it's up-to-date and first
  // Filtering by email assuming email is unique and stable
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
    .select('id') // Selecionar o ID inserido
    .single();

  if (error) {
    console.error('Error creating user:', JSON.stringify(error, null, 2));
    // Melhorar tratamento de erros (PA 50)
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
     // Melhorar tratamento de erros (PA 50)
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
     // Melhorar tratamento de erros (PA 50)
    throw error;
  }
}


// Funções Refatoradas para Leitura (Tarefa Técnica 201)

export async function getProject(id: string): Promise<Project | undefined> {
  // Buscar dados básicos do projeto
  const { data: projectData, error: projectError } = await supabase
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
      baseline_saved_at,
      created_at,
      updated_at,
      manager:users!projects_manager_id_fkey(*),
      team:project_team(
        role,
        user:users(*)
      ),
      configuration, -- Temporariamente manter configuration JSONB se não foi totalmente migrado
      kpis, -- Temporariamente manter kpis JSONB se não foi totalmente migrado
      critical_path -- Temporariamente manter critical_path JSONB se não foi totalmente migrado
    `)
    .eq('id', id)
    .single();

  if (projectError) {
    if (projectError.code === 'PGRST116') {
      return undefined; // Not found
    }
    console.error('Error fetching project basics:', JSON.stringify(projectError, null, 2));
    // Melhorar tratamento de erros (PA 50)
    throw projectError;
  }

  if (!projectData) return undefined;

  // Buscar todas as tarefas para este projeto com seus relacionamentos via JOINs e Agregações
  // Usando agregação no DB para aninhar subtarefas, dependências, etc.
  // Esta consulta é mais complexa mas mais performática que reestruturar em código para grandes volumes.
  // Adapte os campos selecionados para corresponderem aos nomes no novo esquema relacional (snake_case)
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select(`
        id,
        project_id,
        parent_id,
        name,
        description,
        priority,
        planned_start_date,
        planned_end_date,
        actual_start_date,
        actual_end_date,
        planned_hours,
        actual_hours,
        progress,
        is_critical,
        is_milestone,
        baseline_start_date,
        baseline_end_date,
        created_at,
        updated_at,
        assignee:users!tasks_assignee_id_fkey(*), -- JOIN para responsável
        status:statuses!tasks_status_id_fkey(*), -- JOIN para status

        -- Agregação para dependências (tarefas que dependem desta)
        dependent_tasks:task_dependencies!task_dependencies_depends_on_task_id_fkey(
            task_id
        ),
        -- Agregação para dependências (tarefas das quais esta depende)
        dependencies:task_dependencies!task_dependencies_task_id_fkey(
            depends_on_task_id
        ),

        -- Agregação para valores de campos customizados
        custom_field_values:task_custom_field_values(
            custom_field_id,
            value,
            custom_field:custom_fields(name) -- Opcional: buscar nome do campo customizado
        ),
        -- Agregação para histórico de mudanças
        change_history:task_change_history(
            field_changed,
            old_value,
            new_value,
            "timestamp",
            justification,
            user:users(*) -- JOIN para usuário do histórico
        )
    `)
    .eq('project_id', id); // Buscar tarefas apenas para o projeto específico

  if (tasksError) {
    console.error('Error fetching tasks and related data:', JSON.stringify(tasksError, null, 2));
     // Melhorar tratamento de erros (PA 50)
    throw tasksError;
  }

  const allTasksFlat = tasksData || [];

   // Mapear campos do DB (snake_case) para o tipo Task (camelCase) e estruturar subtarefas em código
   // Nota: Se a agregação para subtarefas foi feita no DB, esta parte seria diferente.
   // Este helper ainda é necessário para mapear nomes de campos e estruturar relacionamentos aninhados já obtidos.
  const structuredTasks = structureSubtasks(allTasksFlat);


  // Reconstruir o objeto Project completo
  const project: Project = {
    id: projectData.id,
    name: projectData.name,
    description: projectData.description,
    manager: projectData.manager,
    plannedStartDate: projectData.planned_start_date,
    plannedEndDate: projectData.planned_end_date,
    actualStartDate: projectData.actual_start_date,
    actualEndDate: projectData.actual_end_date,
    plannedBudget: projectData.planned_budget,
    actualCost: projectData.actual_cost,
    tasks: structuredTasks, // Usar as tarefas estruturadas
    kpis: projectData.kpis, // KPIs ainda estão no JSONB do projeto se não foram migrados
    baselineSavedAt: projectData.baseline_saved_at,
    configuration: projectData.configuration, // Configuração ainda está no JSONB do projeto
    criticalPath: projectData.critical_path, // Caminho crítico ainda está no JSONB do projeto
    team: projectData.team, // Equipe já era relacional
    alerts: [], // Supondo que alertas não estavam no JSONB ou serão tratados separadamente
    createdAt: projectData.created_at,
    updatedAt: projectData.updated_at,
  };

  return project;
}

// Refatorar getProjects para usar o novo esquema relacional (Tarefa Técnica 201)
// Nota: Esta função geralmente não precisa buscar todos os detalhes das tarefas,
// apenas informações sumárias. A refatoração aqui pode ser mínima a menos que
// a lista de projetos precise de mais dados agregados das tarefas.
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
      baseline_saved_at,
      created_at,
      updated_at,
      manager:users!projects_manager_id_fkey(*),
      team:project_team(
        role,
        user:users(*)
      )
      -- Adicionar campos agregados de tarefas se necessário (ex: contagem de tarefas, progresso)
      /*
      (select count(*) from tasks where tasks.project_id = projects.id) as task_count,
      (select count(*) from tasks where tasks.project_id = projects.id and tasks.status_id = 'ID_DO_STATUS_CONCLUIDO') as completed_task_count
      */
    `);

    if (projectsError) {
        console.error('Error fetching projects:', JSON.stringify(projectsError, null, 2));
         // Melhorar tratamento de erros (PA 50)
        throw projectsError;
    }

    const projects = projectsData || [];

    // Mapear campos do DB (snake_case) para o tipo Project (camelCase)
    return projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        manager: project.manager,
        plannedStartDate: project.planned_start_date,
        plannedEndDate: project.planned_end_date,
        actualStartDate: project.actual_start_date,
        actualEndDate: project.actual_end_date,
        plannedBudget: project.planned_budget,
        actualCost: project.actual_cost,
        baselineSavedAt: project.baseline_saved_at,
        configuration: project.configuration, // JSONB original temporariamente
        criticalPath: project.critical_path, // JSONB original temporariamente
        kpis: project.kpis, // JSONB original temporariamente
        team: project.team,
        tasks: [], // Tarefas não são buscadas na lista, manter array vazio
        alerts: [],
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        // Incluir campos agregados aqui se forem adicionados no select (ex: taskCount: project.task_count)
    })) as Project[];
}


// Funções Refatoradas (Esboço Conceitual) para Escrita (Tarefa Técnica 202)

// Helper para sincronizar tarefas em um projeto (adicionar, atualizar, excluir)
// Este helper é complexo e é apenas um esboço conceitual
// Precisaria de lógica robusta para mapear IDs temporários do frontend para IDs reais do DB
async function syncProjectTasks(projectId: string, newTasks: Task[] | undefined) {
    if (newTasks === undefined) {
        // Se tasks não foi fornecido no update, não fazemos nada com as tarefas
        return;
    }

    // 1. Buscar o estado ATUAL das tarefas no banco de dados relacional
    // Selecionar todos os campos relevantes, incluindo IDs de relações para comparação
    const { data: currentTasks, error: fetchTasksError } = await supabase
        .from('tasks')
        .select(`
           id, project_id, parent_id, name, assignee_id, status_id, priority, planned_start_date, planned_end_date,
           actual_start_date, actual_end_date, planned_hours, actual_hours, progress, is_critical, is_milestone,
           baseline_start_date, baseline_end_date, created_at, updated_at,
           dependencies:task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id),
           custom_field_values:task_custom_field_values(custom_field_id, value),
           change_history:task_change_history(id) -- Buscar IDs do histórico para exclusão se necessário
        `)
        .eq('project_id', projectId);

    if (fetchTasksError) {
        console.error('Error fetching current tasks for sync:', fetchTasksError);
         // Melhorar tratamento de erros (PA 50)
        throw fetchTasksError;
    }

    const currentTaskMap = new Map(currentTasks?.map(task => [task.id, task]));
    const newTaskMap = new Map(newTasks.map(task => [task.id, task])); // Assumindo que newTasks tem IDs se forem tarefas existentes


    // 2. Identificar Tarefas para Excluir
    const tasksToDelete = Array.from(currentTaskMap.values()).filter(currentTask => !newTaskMap.has(currentTask.id));
    if (tasksToDelete.length > 0) {
         console.log(`Identificadas ${tasksToDelete.length} tarefas para excluir para o projeto ${projectId}.`);
         // Excluir tarefas no DB. ON DELETE CASCADE cuidará de dependências, custom values, histórico.
         const { error: deleteError } = await supabase
             .from('tasks')
             .delete()
             .in('id', tasksToDelete.map(task => task.id));
         if (deleteError) console.error(`Error deleting tasks for project ${projectId}:`, deleteError); // Melhorar log de erro
    }

    // 3. Identificar Tarefas para Adicionar ou Atualizar, e Sincronizar Relações
     const tasksToInsert: any[] = []; // Para inserção em lote
     // Processar atualizações e relações individualmente ou com helpers específicos

     // Mapear nomes de status para IDs (pode precisar buscar statuses do DB ou ter um mapa carregado)
     // Considerar carregar statuses globalmente e por projeto ANTES deste loop para eficiência
     const { data: allStatuses } = await supabase.from('statuses').select('id, name').or(`project_id.eq.${projectId},project_id.is.null()`);
     const statusNameToIdMap = new Map(allStatuses?.map(s => [s.name, s.id]));

      // Mapear nomes/IDs de campos customizados para IDs (pode precisar buscar fields do DB)
      // Considerar carregar custom fields ANTES deste loop para eficiência
     const { data: allCustomFields } = await supabase.from('custom_fields').select('id, name').eq('project_id', projectId);
     const customFieldNameOrIdToIdMap = new Map(allCustomFields?.map(cf => [cf.name, cf.id])); // Mapear por nome ou ID original

     for (const newTask of newTasks) {
         const currentTask = currentTaskMap.get(newTask.id);

         const statusId = statusNameToIdMap.get(newTask.status) || null;
         const assigneeId = newTask.assignee?.id || null;


         if (!currentTask) {
             // Tarefa é Nova (INSERT)
             console.log(`Identificada nova tarefa para inserir: ${newTask.name} para o projeto ${projectId}.`);
             // Gerar novo UUID para a nova tarefa se o frontend não forneceu um ID temporário único
             const id = newTask.id || uuidv4(); // Usar ID existente se fornecido (frontend?) ou gerar novo

             tasksToInsert.push({
                 id: id, // Usar o ID decidido (este será o ID real no DB)
                 project_id: projectId,
                 parent_id: newTask.parentId || null, // parentId pode ser o ID de uma tarefa JÁ existente ou uma nova (precisa de mapeamento posterior se o pai for novo)
                 assignee_id: assigneeId,
                 status_id: statusId, // Usar o status_id encontrado
                 name: newTask.name,
                 description: newTask.description,
                 priority: newTask.priority,
                 planned_start_date: newTask.plannedStartDate,
                 planned_end_date: newTask.plannedEndDate,
                 actual_start_date: newTask.actualStartDate,
                 actual_end_date: newTask.actualEndDate,
                 planned_hours: newTask.plannedHours || 0,
                 actual_hours: newTask.actualHours || 0,
                 progress: newTask.progress || 0,
                 is_critical: newTask.isCritical || false,
                 is_milestone: newTask.isMilestone || false,
                 baseline_start_date: newTask.baselineStartDate,
                 baseline_end_date: newTask.baselineEndDate,
                 // created_at, updated_at serão definidos pelo DB
             });

             // Nota: A inserção de dependências, custom fields e histórico para NOVAS tarefas
             // precisa ser feita APÓS a tarefa principal ser inserida e seu ID real obtido.
             // Isso pode ser feito em uma segunda passagem ou usando as funções individuais (createTask, updateTask)
             // se a lógica de syncProjectTasks for refatorada para chamá-las.

         } else {
             // Tarefa Existente (UPDATE)
              console.log(`Identificada tarefa existente para atualizar: ${newTask.name} (${newTask.id}) para o projeto ${projectId}.`);
             const updateData: any = {};
             // Comparar currentTask com newTask para identificar mudanças e construir updateData
             if (currentTask.parent_id !== (newTask.parentId || null)) updateData.parent_id = newTask.parentId;
             if (currentTask.assignee_id !== assigneeId) updateData.assignee_id = assigneeId;
             if (currentTask.status_id !== statusId) updateData.status_id = statusId;
             if (currentTask.name !== newTask.name) updateData.name = newTask.name;
             if (currentTask.description !== newTask.description) updateData.description = newTask.description;
             if (currentTask.priority !== newTask.priority) updateData.priority = newTask.priority;
             // Comparar datas e outros campos com cuidado, tratando nulls e formatos
             if (currentTask.planned_start_date?.toISOString() !== newTask.plannedStartDate?.toISOString()) updateData.planned_start_date = newTask.plannedStartDate;
             if (currentTask.planned_end_date?.toISOString() !== newTask.plannedEndDate?.toISOString()) updateData.planned_end_date = newTask.plannedEndDate;
             if (currentTask.actual_start_date?.toISOString() !== newTask.actualStartDate?.toISOString()) updateData.actual_start_date = newTask.actualStartDate;
             if (currentTask.actual_end_date?.toISOString() !== newTask.actualEndDate?.toISOString()) updateData.actual_end_date = newTask.actualEndDate;
             if (currentTask.planned_hours !== newTask.plannedHours) updateData.planned_hours = newTask.plannedHours;
             if (currentTask.actual_hours !== newTask.actualHours) updateData.actual_hours = newTask.actualHours;
             if (currentTask.progress !== newTask.progress) updateData.progress = newTask.progress;
             if (currentTask.is_critical !== newTask.isCritical) updateData.is_critical = newTask.isCritical;
             if (currentTask.is_milestone !== newTask.isMilestone) updateData.is_milestone = newTask.isMilestone;
             if (currentTask.baseline_start_date?.toISOString() !== newTask.baselineStartDate?.toISOString()) updateData.baseline_start_date = newTask.baselineStartDate;
             if (currentTask.baseline_end_date?.toISOString() !== newTask.baselineEndDate?.toISOString()) updateData.baseline_end_date = newTask.baselineEndDate;


             if (Object.keys(updateData).length > 0) {
                const { error: updateError } = await supabase.from('tasks').update(updateData).eq('id', newTask.id);
                if (updateError) console.error(`Error updating task ${newTask.id}:`, updateError); // Melhorar log de erro
             }

             // Lógica para sincronizar dependências, custom fields, histórico para TAREFAS EXISTENTES
             // Chamar helpers específicos para cada tipo de relação, passando os NOVOS dados
              await syncTaskDependencies(newTask.id, newTask.dependencies || []);
              await syncTaskCustomFields(newTask.id, newTask.customFields || {});
              // Adicionar entrada no histórico SE houver mudanças que a justifiquem (comparar currentTask com newTask campo a campo)
              // addHistoryEntry(...)
         }
     }

    // 4. Executar INSERTs em Lotes para Novas Tarefas
    if (tasksToInsert.length > 0) {
         console.log(`Executando inserção em lote de ${tasksToInsert.length} novas tarefas para o projeto ${projectId}.`);
         const { data: insertedTasks, error: bulkInsertError } = await supabase.from('tasks').insert(tasksToInsert).select('id, parent_id'); // Selecionar IDs e parent_ids das tarefas inseridas
         if (bulkInsertError) {
             console.error('Error in bulk inserting new tasks:', bulkInsertError); // Melhorar log de erro
             throw bulkInsertError; // Considerar reverter a transação do projeto se a inserção de tarefas falhar
         }
         console.log(`Inseridas ${insertedTasks.length} novas tarefas. Processando relações para tarefas inseridas.`);

         // Agora que temos os IDs reais das tarefas recém-inseridas, podemos processar suas relações
         const newTaskIdMap = new Map(insertedTasks.map(task => [task.id, task])); // Mapa de ID real para objeto inserido (útil para parent_id)

         // Segunda passagem para processar dependências, custom fields, histórico para TAREFAS RECÉM-INSERIDAS
         // Iterar sobre as tarefas originais (newTasks) que foram inseridas
         for (const newTask of newTasks.filter(task => !currentTaskMap.has(task.id))) { // Filtrar apenas as que foram inseridas
              const newTaskId = insertedTasks.find(t => t.parent_id === newTask.parentId && t.name === newTask.name /* outras condições para encontrar a tarefa inserida */)?.id; // Encontrar o ID real da tarefa inserida
               if (!newTaskId) {
                   console.warn(`Could not find newly inserted task ${newTask.name} to process relationships.`);
                   continue;
               }

              // Processar dependências, custom fields, histórico para esta TAREFA RECÉM-INSERIDA
               await syncTaskDependencies(newTaskId, newTask.dependencies || []);
               await syncTaskCustomFields(newTaskId, newTask.customFields || {});
               // addHistoryEntry(newTaskId, { fieldChanged: 'Tarefa Criada', oldValue: null, newValue: newTask.name, userId: newTask.assignee?.id || null, justification: 'Nova tarefa criada.' });
         }
          console.log("Relações para tarefas recém-inseridas processadas.");

    }


    // 5. Implementar helpers para sincronizar relações individualmente (usados acima)
    // Estes helpers comparariam o estado atual da relação no DB com o novo estado fornecido
    // e executariam INSERT/UPDATE/DELETE nas tabelas de relação (task_dependencies, task_custom_field_values)
    console.warn("Helpers syncTaskDependencies, syncTaskCustomFields, addHistoryEntry precisam ser implementados completamente e testados.");

}

// Helper para sincronizar dependências de uma tarefa (adicionar/remover)
// Compara as dependências atuais de uma tarefa no DB com uma nova lista e ajusta a tabela task_dependencies
async function syncTaskDependencies(taskId: string, newDependencies: string[]) {
    console.log(`Sincronizando dependências para tarefa ${taskId}.`);
    // Buscar dependências atuais para esta tarefa
    const { data: currentDeps, error: fetchDepsError } = await supabase
        .from('task_dependencies')
        .select('depends_on_task_id')
        .eq('task_id', taskId);

    if (fetchDepsError) {
        console.error(`Error fetching current dependencies for task ${taskId}:`, fetchDepsError);
         // Melhorar tratamento de erros (PA 50)
        throw fetchDepsError;
    }

    const currentDepIds = new Set(currentDeps?.map(dep => dep.depends_on_task_id) || []);
    const newDepIds = new Set(newDependencies);

    const depsToDelete = Array.from(currentDepIds).filter(depId => !newDepIds.has(depId));
    const depsToAdd = Array.from(newDepIds).filter(depId => !currentDepIds.has(depId));

    // Excluir dependências removidas
    if (depsToDelete.length > 0) {
         console.log(`Excluindo ${depsToDelete.length} dependências para tarefa ${taskId}.`);
         const { error: deleteDepsError } = await supabase
             .from('task_dependencies')
             .delete()
             .eq('task_id', taskId)
             .in('depends_on_task_id', depsToDelete);
         if (deleteDepsError) console.error(`Error deleting dependencies for task ${taskId}:`, deleteDepsError); // Melhorar log
    }

    // Adicionar novas dependências
    if (depsToAdd.length > 0) {
        console.log(`Adicionando ${depsToAdd.length} dependências para tarefa ${taskId}.`);
        const inserts = depsToAdd.map(depId => ({ task_id: taskId, depends_on_task_id: depId }));
        const { error: insertDepsError } = await supabase.from('task_dependencies').insert(inserts);
        if (insertDepsError) console.error(`Error adding dependencies for task ${taskId}:`, insertDepsError); // Melhorar log
    }
     console.log(`Sincronização de dependências para tarefa ${taskId} concluída.`);
}

// Helper para sincronizar valores de campos customizados de uma tarefa
// Compara os valores atuais de campos customizados de uma tarefa no DB com novos valores e ajusta task_custom_field_values
async function syncTaskCustomFields(taskId: string, newCustomFieldValues: Task['customFields']) {
    console.log(`Sincronizando valores de campo customizado para tarefa ${taskId}.`);
    // Buscar valores de campos customizados atuais para esta tarefa
    const { data: currentCFVs, error: fetchCFVsError } = await supabase
        .from('task_custom_field_values')
        .select('custom_field_id, value')
        .eq('task_id', taskId);

     if (fetchCFVsError) {
        console.error(`Error fetching current custom field values for task ${taskId}:`, fetchCFVsError);
         // Melhorar tratamento de erros (PA 50)
        throw fetchCFVsError;
    }

    const currentCFVMap = new Map(currentCFVs?.map(cfv => [cfv.custom_field_id, cfv.value]) || []);
    // Precisamos mapear o nome/ID do campo customizado no newCustomFieldValues para o custom_field_id real
    // Isso exigiria buscar os custom_fields ou ter um mapa disponível aqui.
    console.warn("Mapeamento de chaves de newCustomFieldValues (nome/id) para custom_field_id no DB é necessário em syncTaskCustomFields.");
    // Exemplo conceitual de como seria o mapa: customFieldNameOrIdToIdMap (carregado uma vez para o projeto)

     const updatesToProcess: { customFieldId: string; value: string }[] = [];
     const deletesToProcess: string[] = []; // custom_field_id a excluir
     const insertsToProcess: { custom_field_id: string; value: string }[] = [];

    // ... continuação da função syncTaskCustomFields

     // Supondo que customFieldNameOrIdToIdMap está disponível
     // e que o objeto newCustomFieldValues tem chaves que são nomes ou IDs originais
     const mappedNewCFValues = new Map<string, string>(); // Mapa de custom_field_id -> value (string)
     for (const fieldKey in newCustomFieldValues) {
         const customFieldId = customFieldNameOrIdToIdMap.get(fieldKey); // Mapear chave para ID real
         if (customFieldId) {
             mappedNewCFValues.set(customFieldId, String(newCustomFieldValues[fieldKey]));
         } else {
             console.warn(`Chave de campo customizado "${fieldKey}" para tarefa ${taskId} não mapeada para um custom_field_id existente. Ignorando.`);
         }
     }


     // Comparar mappedNewCFValues com currentCFVMap para identificar mudanças
     for (const customFieldId of mappedNewCFValues.keys()) {
          const newCFValue = mappedNewCFValues.get(customFieldId);
          const currentCFValue = currentCFVMap.get(customFieldId);

          if (currentCFVMap.has(customFieldId)) {
               // Campo existe, verificar se o valor mudou
              if (currentCFValue !== newCFValue) { // Comparar como string
                  console.log(`Valor de campo customizado ${customFieldId} mudou para tarefa ${taskId}.`);
                  updatesToProcess.push({ customFieldId, value: newCFValue! }); // newCFValue não é undefined aqui
              }
          } else {
              // Campo não existe, adicionar
              if (newCFValue !== null && newCFValue !== undefined && newCFValue !== '') { // Adicionar apenas se tiver valor
                 console.log(`Campo customizado ${customFieldId} é novo para tarefa ${taskId}.`);
                 insertsToProcess.push({ custom_field_id: customFieldId, value: newCFValue });
              }
          }
          currentCFVMap.delete(customFieldId); // Remover do mapa atual para identificar exclusões
     }

     // Qualquer chave restante em currentCFVMap foi removida no newCustomFieldValues
     deletesToProcess.push(...Array.from(currentCFVMap.keys()));


    // Executar Updates
    if (updatesToProcess.length > 0) {
        console.log(`Atualizando ${updatesToProcess.length} valores de campo customizado para tarefa ${taskId}.`);
        // Supabase/PostgREST não suporta bulk update condicional diretamente via cliente.
        // Pode ser necessário executar updates individuais.
        for (const updateItem of updatesToProcess) {
             const { error: updateError } = await supabase
                .from('task_custom_field_values')
                .update({ value: updateItem.value })
                .eq('task_id', taskId)
                .eq('custom_field_id', updateItem.customFieldId);
             if (updateError) console.error(`Error updating custom field value ${updateItem.customFieldId} for task ${taskId}:`, updateError); // Melhorar log
        }
    }

    // Executar Inserts
    if (insertsToProcess.length > 0) {
        console.log(`Inserindo ${insertsToProcess.length} novos valores de campo customizado para tarefa ${taskId}.`);
        const { error: insertError } = await supabase
            .from('task_custom_field_values')
            .insert(insertsToProcess); // insertsToProcess já tem a estrutura correta
        if (insertError) console.error(`Error inserting custom field values for task ${taskId}:`, insertError); // Melhorar log
    }

    // Executar Deletes
    if (deletesToProcess.length > 0) {
        console.log(`Excluindo ${deletesToProcess.length} valores de campo customizado para tarefa ${taskId}.`);
        const { error: deleteError } = await supabase
            .from('task_custom_field_values')
            .delete()
            .eq('task_id', taskId)
            .in('custom_field_id', deletesToProcess);
        if (deleteError) console.error(`Error deleting custom field values for task ${taskId}:`, deleteError); // Melhorar log
    }
     console.log(`Sincronização de valores de campo customizado para tarefa ${taskId} concluída.`);
}

// Helper para adicionar uma entrada no histórico de mudanças de uma tarefa
// Esta função seria chamada APÓS uma atualização bem-sucedida da tarefa
async function addHistoryEntry(taskId: string, changeDetails: { fieldChanged: string, oldValue: any, newValue: any, userId: string | null, justification?: string }) {
     console.log(`Adicionando entrada no histórico para tarefa ${taskId}: ${changeDetails.fieldChanged}`);
     // Adicionar validação básica nos changeDetails
     if (!changeDetails.fieldChanged) {
         console.warn("Cannot add history entry: fieldChanged is missing.");
         return;
     }
     const { error: insertHistoryError } = await supabase.from('task_change_history').insert({
         task_id: taskId,
         field_changed: changeDetails.fieldChanged,
         old_value: String(changeDetails.oldValue), // Armazenar como string
         new_value: String(changeDetails.newValue), // Armazenar como string
         user_id: changeDetails.userId,
         justification: changeDetails.justification,
         // timestamp será definido pelo DB (DEFAULT now())
     });

     if (insertHistoryError) {
         console.error(`Error adding history entry for task ${taskId}:`, insertHistoryError); // Melhorar log
         // Decidir se lançar erro ou apenas logar (não queremos que uma falha no histórico impeça a atualização da tarefa)
     }
}


// Funções para manipulação de tarefa individual (Precisam ser implementadas)

// Cria uma nova tarefa e seus relacionamentos iniciais
export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subTasks' | 'changeHistory'>, projectId: string): Promise<Task> {
     console.warn(`Implementação completa da função createTask para o projeto ${projectId} é necessária.`);
     // Lógica:
     // 1. Validar dados de entrada.
     // 2. Inserir tarefa na tabela tasks (gerar ID se necessário, mapear status e assignee para IDs).
     // 3. Obter o ID real da tarefa inserida.
     // 4. Chamar helpers de sincronização para inserir dependências iniciais (syncTaskDependencies) e valores de campos customizados (syncTaskCustomFields).
     // 5. Opcional: Adicionar entrada inicial no histórico (addHistoryEntry).
     // 6. Buscar a tarefa completa recém-criada (usando getProject ou uma consulta similar) para retorná-la no formato esperado.
     // 7. Retornar o objeto Task criado.

     // Exemplo conceitual (requer statusNameToIdMap e customFieldNameOrIdToIdMap disponíveis)
     /*
      const statusId = statusNameToIdMap.get(taskData.status) || null;
      const assigneeId = taskData.assignee?.id || null;

      const { data, error } = await supabase.from('tasks').insert({
          project_id: projectId,
          parent_id: taskData.parentId || null,
          assignee_id: assigneeId,
          status_id: statusId,
          name: taskData.name,
          description: taskData.description,
          priority: taskData.priority,
          planned_start_date: taskData.plannedStartDate,
          planned_end_date: taskData.plannedEndDate,
          actual_start_date: taskData.actualStartDate,
          actual_end_date: taskData.actualEndDate,
          planned_hours: taskData.plannedHours || 0,
          actual_hours: taskData.actualHours || 0,
          progress: taskData.progress || 0,
          is_critical: taskData.isCritical || false,
          is_milestone: taskData.isMilestone || false,
          baseline_start_date: taskData.baselineStartDate,
          baseline_end_date: taskData.baselineEndDate,
      }).select('id').single(); // Selecionar o ID inserido

      if (error) {
          console.error('Error creating task:', error); // Melhorar log
          throw error;
      }

      const newTaskId = data.id;

      // Lógica para inserir dependências e custom fields após obter newTask.id
       await syncTaskDependencies(newTaskId, taskData.dependencies || []);
       await syncTaskCustomFields(newTaskId, taskData.customFields || {});
       // await addHistoryEntry(newTaskId, { fieldChanged: 'Tarefa Criada', oldValue: null, newValue: taskData.name, userId: taskData.assignee?.id || null, justification: 'Nova tarefa criada.' });

       // Buscar a tarefa completa para retornar o objeto Task formatado
       const { data: createdTaskData, error: fetchError } = await supabase
           .from('tasks')
           .select(`
               *,
               assignee:users!tasks_assignee_id_fkey(*),
               status:statuses!tasks_status_id_fkey(*),
               dependencies:task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id),
               custom_field_values:task_custom_field_values(custom_field_id, value, custom_field:custom_fields(name)),
               change_history:task_change_history(field_changed, old_value, new_value, "timestamp", justification, user:users(*))
           `)
           .eq('id', newTaskId)
           .single();

        if (fetchError) {
             console.error('Error fetching created task:', fetchError);
             // Decidir se lançar erro (e talvez reverter a criação) ou retornar uma tarefa parcial
             throw fetchError;
        }

        const newTask: Task = structureSubtasks([createdTaskData as any])[0]; // Usar helper de estruturação

        return newTask;
     */
      throw new Error("createTask not implemented"); // Placeholder
}

// Atualiza uma tarefa existente e sincroniza seus relacionamentos
export async function updateTask(taskId: string, taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subTasks' | 'changeHistory'>>): Promise<void> {
    console.warn(`Implementação completa da função updateTask para tarefa ${taskId} é necessária.`);
    // Lógica:
    // 1. Buscar a tarefa ATUAL do DB para comparação (incluindo dependências, custom fields).
    // 2. Construir objeto de atualização para a tabela tasks com campos básicos modificados.
    // 3. Executar UPDATE na tabela tasks.
    // 4. Chamar helpers de sincronização para dependências (syncTaskDependencies) e custom fields (syncTaskCustomFields).
    // 5. Adicionar entrada(s) no histórico (addHistoryEntry) para cada campo que mudou.

     // Exemplo conceitual (requer statusNameToIdMap e customFieldNameOrIdToIdMap disponíveis)
     /*
     const { data: currentTask, error: fetchError } = await supabase
         .from('tasks')
         .select(`
           *,
           dependencies:task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id),
           custom_field_values:task_custom_field_values(custom_field_id, value)
         `)
         .eq('id', taskId)
         .single();

     if (fetchError) {
         console.error(`Error fetching current task ${taskId} for update:`, fetchError);
         throw fetchError;
     }
     if (!currentTask) throw new Error(`Task with ID ${taskId} not found.`);

     const updateData: any = {};
     let changesForHistory: { fieldChanged: string, oldValue: any, newValue: any }[] = []; // Para coletar mudanças para o histórico

     // Comparar currentTask com taskData para popular updateData e changesForHistory
     if (taskData.name !== undefined && currentTask.name !== taskData.name) { updateData.name = taskData.name; changesForHistory.push({ fieldChanged: 'name', oldValue: currentTask.name, newValue: taskData.name }); }
     // ... comparar outros campos básicos (description, priority, dates, hours, progress, is_critical, is_milestone, baseline dates)
     // Mapear status e assignee para IDs para comparação e updateData
      const statusId = taskData.status !== undefined ? (statusNameToIdMap.get(taskData.status) || null) : undefined;
      if (statusId !== undefined && currentTask.status_id !== statusId) { updateData.status_id = statusId; changesForHistory.push({ fieldChanged: 'status', oldValue: currentTask.status_id, newValue: statusId }); } // Pode precisar mapear IDs de status antigos/novos para nomes para o histórico

       const assigneeId = taskData.assignee !== undefined ? (taskData.assignee?.id || null) : undefined;
       if (assigneeId !== undefined && currentTask.assignee_id !== assigneeId) { updateData.assignee_id = assigneeId; changesForHistory.push({ fieldChanged: 'assignee', oldValue: currentTask.assignee_id, newValue: assigneeId }); } // Pode precisar mapear IDs de user para nomes/objetos para o histórico


     let relationsChanged = false;

     // Sincronizar dependências se fornecidas
     if (taskData.dependencies !== undefined) {
          await syncTaskDependencies(taskId, taskData.dependencies);
          // Nota: Comparar dependências antigas e novas para adicionar entrada no histórico é mais complexo.
          // Pode ser uma entrada única "Dependencies changed".
          relationsChanged = true;
     }

      // Sincronizar custom fields se fornecidos
      if (taskData.customFields !== undefined) {
          await syncTaskCustomFields(taskId, taskData.customFields);
           // Nota: Comparar custom fields antigos e novos para histórico é mais complexo.
           relationsChanged = true;
      }


     if (Object.keys(updateData).length > 0) {
         const { error: updateError } = await supabase.from('tasks').update(updateData).eq('id', taskId);
         if (updateError) {
             console.error(`Error updating task ${taskId}:`, updateError); // Melhorar log
             throw updateError;
         }
         // Adicionar entradas no histórico para campos básicos que mudaram APÓS a atualização ser bem-sucedida
         // for (const change of changesForHistory) {
         //    await addHistoryEntry(taskId, { ...change, userId: 'ID_DO_USUARIO_LOGADO' }); // Precisaria obter o ID do usuário logado
         // }
     } else if (relationsChanged) {
          // Se apenas relações mudaram (dependências, custom fields), adicionar uma entrada genérica no histórico
          // await addHistoryEntry(taskId, { fieldChanged: 'Relações Atualizadas', oldValue: null, newValue: null, userId: 'ID_DO_USUARIO_LOGADO' });
     } else {
         console.log(`No changes detected for task ${taskId} (basic fields or relations).`);
     }
     */
     throw new Error("updateTask not implemented"); // Placeholder
}

// Exclui uma tarefa existente (e seus relacionamentos via ON DELETE CASCADE)
export async function deleteTask(taskId: string): Promise<void> {
     console.warn(`Implementação da função deleteTask para tarefa ${taskId} é necessária.`);
     // Lógica:
     // 1. Executar DELETE na tabela tasks.
     // 2. As regras ON DELETE CASCADE no DB cuidarão da exclusão de registros relacionados em task_dependencies, task_custom_field_values e task_change_history.

     // Exemplo conceitual:
     /*
     const { error } = await supabase
         .from('tasks')
         .delete()
         .eq('id', taskId);

     if (error) {
         console.error(`Error deleting task ${taskId}:`, error); // Melhorar log
         throw error;
     }
     console.log(`Task ${taskId} deleted.`);
     */
      throw new Error("deleteTask not implemented"); // Placeholder
}

// ... (outras funções que você possa ter no seu service.ts)

