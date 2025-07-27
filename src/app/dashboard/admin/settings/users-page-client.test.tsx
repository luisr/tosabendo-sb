// src/app/dashboard/admin/settings/users-page-client.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UsersPageClient } from './users-page-client';
import * as service from '@/lib/supabase/service'; // Importa o módulo de serviço para mock
import { User } from '@/lib/types';

// Mock das dependências externas
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock completo do módulo de serviço
jest.mock('@/lib/supabase/service', () => ({
  getAllUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

const mockUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'Admin', status: 'active', avatar: '' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'Viewer', status: 'inactive', avatar: '' },
];

describe('UsersPageClient - Fluxo de Usuários', () => {
  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    (service.getAllUsers as jest.Mock).mockClear();
    (service.createUser as jest.Mock).mockClear();
  });

  it('deve renderizar a lista inicial de usuários', () => {
    render(<UsersPageClient initialUsers={mockUsers} />);

    // Verifica se os nomes dos usuários estão na tela
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('deve abrir o modal para adicionar um novo usuário', async () => {
    render(<UsersPageClient initialUsers={mockUsers} />);

    // Simula o clique no botão "Adicionar Usuário"
    const addButton = screen.getByText('Adicionar Usuário');
    fireEvent.click(addButton);

    // Verifica se o modal abriu com o título correto
    // Usamos 'findBy' para esperar o modal aparecer
    expect(await screen.findByText('Adicionar Novo Usuário')).toBeInTheDocument();
  });

  it('deve chamar a função createUser quando o formulário é submetido', async () => {
    // Configura o mock da função createUser para retornar um sucesso
    (service.createUser as jest.Mock).mockResolvedValue({ id: '3' });
    // Configura o mock de getAllUsers para simular a atualização da lista
    (service.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);
    
    render(<UsersPageClient initialUsers={[]} />);

    // 1. Abre o modal
    fireEvent.click(screen.getByText('Adicionar Usuário'));
    
    // 2. Preenche o formulário
    // Usamos 'findBy' para garantir que os campos estejam presentes antes de interagir
    const nameInput = await screen.findByLabelText('Nome');
    const emailInput = screen.getByLabelText('Email');
    
    fireEvent.change(nameInput, { target: { value: 'Charlie' } });
    fireEvent.change(emailInput, { target: { value: 'charlie@example.com' } });

    // 3. Submete o formulário (encontra o botão de salvar dentro do UserForm)
    const saveButton = screen.getByRole('button', { name: /Salvar/i }); // Procura por um botão com texto "Salvar"
    fireEvent.click(saveButton);

    // 4. Verifica se a função createUser foi chamada com os dados corretos
    await waitFor(() => {
      expect(service.createUser).toHaveBeenCalledTimes(1);
      expect(service.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Charlie',
          email: 'charlie@example.com',
        })
      );
    });
  });

});
