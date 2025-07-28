'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server' // Corrigido
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Project, ProjectRole, User } from '@/lib/types'

// ... (função getUserWithRole mantida) ...

export async function getProjectsAction(): Promise<Project[]> {
  const supabase = createSupabaseServerClient(); // Corrigido
  const user = await getUserWithRole(supabase);

  if (!user) {
    console.log("DEBUG (actions.ts): Usuário não autenticado. Retornando array vazio.");
    return [];
  }

  // ... (resto da lógica mantida como está) ...
  
  // Mapeamento defensivo final, garantindo que nenhum campo seja nulo
  return (projects ?? []).map((p: any) => ({
    id: p.id,
    name: p.name ?? 'Projeto sem nome',
    description: p.description ?? '',
    manager: p.manager ?? null,
    plannedStartDate: p.planned_start_date ?? new Date().toISOString(),
    plannedEndDate: p.planned_end_date ?? new Date().toISOString(),
    plannedBudget: p.planned_budget ?? 0,
    actualCost: p.actual_cost ?? 0,
    team: (p.team ?? []).map((tm: any) => ({ user: tm.user, role: tm.role as ProjectRole })).filter(tm => tm.user),
    tasks: p.tasks ?? [],
    kpis: p.kpis ?? {},
    configuration: p.configuration ?? {},
  }));
}
