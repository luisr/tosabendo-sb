// src/lib/supabase/service.test.ts
import { supabaseAdmin } from './admin'; // Usa o cliente admin para o teste
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

describe('Integration Test: Fetching Projects with Admin Client', () => {

  it('should fetch all projects from the database without RLS errors', async () => {
    // Usa o cliente supabaseAdmin para buscar os projetos,
    // simulando o que a Server Action faz no backend.
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        name,
        manager:users!projects_manager_id_fkey(*),
        team:project_team(role, user:users(*))
      `);

    // Validações
    expect(error).toBeNull(); // A validação mais importante: o erro deve ser nulo
    expect(projects).toBeInstanceOf(Array);

    if (projects && projects.length > 0) {
      const firstProject = projects[0];
      expect(firstProject).toHaveProperty('id');
      expect(firstProject).toHaveProperty('name');
      expect(firstProject).toHaveProperty('manager');
      expect(firstProject).toHaveProperty('team');
    }
  });
});
