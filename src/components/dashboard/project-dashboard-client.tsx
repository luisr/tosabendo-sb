// src/components/dashboard/project-dashboard-client.tsx
'use client';

// ... (imports mantidos) ...
import { useAuthContext } from '@/hooks/use-auth-context';
import { createTask } from '@/lib/supabase/service'; // Importado

// ... (outras funções e lógicas mantidas) ...

export function ProjectDashboardClient({ initialProject }: { initialProject: Project }) {
  // ... (estados e hooks mantidos) ...
  const { user, projects, loading, refreshProjects } = useAuthContext();

  // ... (outros handlers, incluindo o handleExportTasks refatorado) ...

  const handleImportConfirm = async (mapping: Mapping) => {
    if (!project) return;
    
    toast({ title: "Iniciando importação...", description: "Estamos processando suas tarefas." });
    
    // Mapeia os nomes dos usuários para seus IDs para facilitar a busca
    const usersByNameMap = new Map<string, User>(
      (project.team ?? []).map(tm => [tm.user.name.toLowerCase(), tm.user])
    );
    const customFieldDefMap = new Map<string, string>(
        (project.configuration.customFieldDefinitions ?? []).map(def => [def.name.toLowerCase(), def.id])
    );

    const tasksToCreate: Omit<Task, 'id' | 'subTasks' | 'changeHistory'>[] = [];

    for (const row of csvData) {
      const taskData: Partial<Omit<Task, 'id' | 'subTasks' | 'changeHistory'>> & { customFields: Record<string, any> } = { customFields: {} };

      for (const csvHeader in mapping) {
        const taskField = mapping[csvHeader].type;
        const value = row[csvHeader];

        if (!value || taskField === 'ignore') continue;
        
        // Mapeamento dos campos padrão
        switch(taskField as TaskField) {
            case 'name': taskData.name = String(value); break;
            case 'assignee':
                const foundUser = usersByNameMap.get(String(value).toLowerCase());
                if (foundUser) taskData.assignee = foundUser;
                break;
            // ... (outros campos padrão: status, priority, etc.) ...
        }

        // Mapeamento de campos personalizados
        const customFieldId = customFieldDefMap.get(taskField.toLowerCase());
        if(customFieldId) {
            taskData.customFields[customFieldId] = value;
        }
      }

      // Adiciona valores padrão se algum campo obrigatório estiver faltando
      if (!taskData.name) continue; // Pula linhas sem nome
      taskData.projectId = project.id;
      taskData.assignee = taskData.assignee || user!;
      taskData.status = taskData.status || (project.configuration.statuses.find(s => s.isDefault)?.name ?? 'A Fazer');
      // ... (outros valores padrão) ...

      tasksToCreate.push(taskData as Omit<Task, 'id' | 'subTasks' | 'changeHistory'>);
    }

    try {
      // Usa Promise.all para criar todas as tarefas em paralelo
      await Promise.all(tasksToCreate.map(task => createTask(task)));

      toast({
        title: "Importação Concluída!",
        description: `${tasksToCreate.length} tarefas foram importadas com sucesso.`,
      });

      refreshProjects(); // Atualiza a lista de projetos e tarefas do contexto
      setImportModalOpen(false);
    } catch (error) {
      console.error("Erro na importação em massa:", error);
      toast({ title: "Erro na Importação", description: "Não foi possível salvar as tarefas.", variant: "destructive" });
    }
  };

  // ... (resto do componente mantido) ...
}
