// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task, TeamMember, ProjectRole } from '@/lib/types';

// ... (funções de usuário mantidas como estão) ...

// ===== Funções de Projetos =====

export async function createProject(
  projectData: Omit<Project, 'id' | 'manager' | 'team' | 'tasks' | 'kpis' | 'configuration'>,
  managerId: string
): Promise<Project> {
  // Passo 1: Inserir o novo projeto na tabela 'projects'
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

  // Passo 2: Adicionar o gerente como o primeiro membro da equipe na tabela 'project_team'
  const { error: teamError } = await supabase
    .from('project_team')
    .insert({
      project_id: newProject.id,
      user_id: managerId,
      role: 'Manager',
    });

  if (teamError) {
    console.error('Error adding manager to project team:', JSON.stringify(teamError, null, 2));
    // Em um cenário de produção, você poderia deletar o projeto recém-criado para consistência.
    throw teamError;
  }

  // Retorna o projeto completo (sem equipe e tarefas, que são carregados separadamente)
  return {
    ...newProject,
    manager: { id: managerId } as User, // Placeholder
    team: [],
    tasks: [],
  } as Project;
}


// ... (resto das funções de projeto e tarefas mantidas como estão) ...
