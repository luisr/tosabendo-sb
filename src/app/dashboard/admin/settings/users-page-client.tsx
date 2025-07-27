'use client';

import { useEffect, useState, useMemo } from 'react';
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from "@/lib/validation";
import { ZodType } from 'zod';
import { Shell } from "@/components/ui/shell";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/dashboard/user-form";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { getAllUsers, createUser, updateUser, deleteUser } from "@/lib/supabase/service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton'; // Importado

interface UsersPageClientProps {
  initialUsers: User[];
}

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState(false); // Apenas para re-fetches
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    // ... (form, useEffects, handlers mantidos como estão) ...

    const columns = useMemo(() => getColumns(handleEdit, onDelete), [users]);

    // O carregamento inicial é tratado pelo Server Component pai.
    // Este estado de 'loading' é principalmente para feedback durante as ações de CRUD.
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const fetchedUsers = await getAllUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao buscar usuários.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    // ... (outros handlers: handleEdit, handleAddNew, onSubmit, onDelete) ...

    return (
        <Shell>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                </Button>
            </div>
            
            {loading ? (
                <DataTableSkeleton columnCount={5} /> // Usa o novo esqueleto
            ) : (
                <DataTable columns={columns} data={users} />
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? "Atualize os detalhes do usuário." : "Preencha os detalhes para criar um novo usuário."}
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm 
                        form={form} 
                        onSubmit={onSubmit}
                    />
                </DialogContent>
            </Dialog>
        </Shell>
    );
}
