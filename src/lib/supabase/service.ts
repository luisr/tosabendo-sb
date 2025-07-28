// src/lib/supabase/service.ts
import { supabase } from './config';
import type { Project, User, Task } from '@/lib/types';
import { customAlphabet } from 'nanoid';

// ... (outras funções de serviço mantidas) ...

export async function createUser(userData: Omit<User, 'id' | 'status' | 'avatar'>): Promise<User> {
  // Gera uma senha temporária segura
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12);
  const tempPassword = nanoid();

  // Usa o método de admin do Supabase para criar um novo usuário de autenticação
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: tempPassword,
    email_confirm: true, // O usuário não precisará confirmar o email por enquanto
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    throw authError;
  }

  const newAuthUser = authData.user;

  // Agora, insere o perfil na tabela 'public.users'
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert({
      id: newAuthUser.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active',
      mustChangePassword: true, // Força a troca de senha no primeiro login
    })
    .select()
    .single();
  
  if (profileError) {
    console.error('Error creating user profile:', profileError.message);
    // Em um cenário de produção, você deveria deletar o auth user criado se o perfil falhar
    await supabase.auth.admin.deleteUser(newAuthUser.id);
    throw profileError;
  }

  // TODO: Enviar um e-mail para o novo usuário com sua senha temporária.
  console.log(`Senha temporária para ${userData.email}: ${tempPassword}`);
  
  return profileData as User;
}

// ... (resto do arquivo de serviço mantido) ...
