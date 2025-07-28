// src/app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { User, Project } from '@/lib/types';
import { userSchema } from '@/lib/validation';

// ===== Ações de Usuário =====

export async function updateUserAction(userId: string, formData: FormData) {
  const supabase = createSupabaseServerClient();
  
  const values = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    role: formData.get('role') as string,
  };

  const validatedFields = userSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Campos inválidos.' };
  }

  const { error } = await supabase
    .from('users')
    .update(validatedFields.data)
    .eq('id', userId);
  
  if (error) {
    return { error: 'Erro ao atualizar o usuário.' };
  }

  revalidatePath('/dashboard/admin/users'); // Atualiza o cache da página de usuários
  return { success: 'Usuário atualizado com sucesso!' };
}

export async function createUserAction(formData: FormData) {
    const supabase = createSupabaseServerClient();

    const values = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        role: formData.get('role') as string,
    };
    
    const validatedFields = userSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Campos inválidos.' };
    }

    // Nota: A criação de usuário no Supabase Auth não está aqui.
    // Esta ação assume que o usuário já existe na autenticação
    // e estamos apenas criando o perfil dele na tabela 'users'.
    const { error } = await supabase.from('users').insert(validatedFields.data);

    if (error) {
        if (error.code === '23505') return { error: 'Já existe um usuário com este email.' };
        return { error: 'Erro ao criar o usuário.' };
    }

    revalidatePath('/dashboard/admin/users');
    return { success: 'Usuário criado com sucesso!' };
}


// ===== Ações de Projeto =====

export async function createProjectAction(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Usuário não autenticado.' };
    }

    const { error } = await supabase.from('projects').insert({
        name: formData.get('name'),
        description: formData.get('description'),
        manager_id: user.id, // O criador é o gerente
        // outros campos...
    });

    if (error) {
        return { error: 'Erro ao criar o projeto.' };
    }

    revalidatePath('/dashboard'); // Atualiza a lista de projetos na sidebar
    return { success: 'Projeto criado com sucesso!' };
}

export async function getProjectsAction(): Promise<{ data?: Project[]; error?: string }> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Usuário não autenticado.' };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('manager_id', user.id); // Filtra projetos pelo manager_id

  if (error) {
    console.error("Error fetching projects:", error);
    return { error: 'Erro ao buscar projetos.' };
  }

  return { data: data as Project[] };
} 
