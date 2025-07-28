// src/lib/supabase/service.ts
import { createSupabaseServerClient } from "./server";
import { z } from "zod";
import { userSchema } from "@/lib/validation";

// Exemplo de função para buscar um projeto específico com suas tarefas
export async function getProject(projectId: string) {
  const supabase = createSupabaseServerClient();

  console.log(`INFO: Tentando buscar projeto com ID: ${projectId}`);

  const { data, error } = await supabase
    .from('projects')
    .select('*, tasks(*)') // Select project fields and all associated tasks
    .eq('id', projectId)
    .single();

  if (error) {
    console.error("Erro ao buscar projeto:", error);
    // More detailed logging for specific error types
    if (error.code === 'PGRST116') { // PGRST116 is the code for "no rows found"
      console.log(`INFO: Projeto com ID ${projectId} não encontrado no banco de dados.`);
    } else if (error.code === 'PGRST201') { // PGRST201 for multiple relationships
        console.error(`ERROR: Multiplas relações encontradas para 'projects' e 'tasks' ao buscar projeto ${projectId}. Detalhes:`, JSON.stringify(error.details, null, 2));
    } else {
      console.error(`ERROR: Erro inesperado ao buscar projeto ${projectId}:`, error.message);
    }
    return null;
  }

  console.log(`DEBUG: Dados completos recebidos para o projeto ${projectId}:`, data);
  console.log(`DEBUG: Tasks recebidas para o projeto ${projectId}:`, data?.tasks);

  return data; // Retorna o objeto do projeto com as tarefas ou null se não encontrado ou erro
}

export async function getAllUsers() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }

  return data;
}

export async function createUser(userData: z.infer<typeof userSchema>) {
  const supabase = createSupabaseServerClient();
  // In a real application, you would likely handle user creation securely,
  // possibly involving inviting users or setting temporary passwords via backend.
  // This is a simplified example.
  const { data, error } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: 'temporary_password', // Consider a more secure approach
    email_confirm: true,
    // user_metadata: { name: userData.name, role: userData.role }, // Example metadata
  });

  if (error) {
    console.error("Error creating user:", error.message);
    throw new Error(error.message);
  }

  // Optionally, add user to your 'users' table with role and name
  const { error: insertError } = await supabase
    .from('users')
    .insert([
      { id: data.user?.id, name: userData.name, role: userData.role }
    ]);

  if (insertError) {
    console.error("Error inserting user into profile table:", insertError.message);
    // Depending on your error handling, you might want to rollback the auth.admin.createUser
    throw new Error(insertError.message);
  }

  return data.user;
}
