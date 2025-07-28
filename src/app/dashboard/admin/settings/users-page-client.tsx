'use client';

import { useEffect, useState, useMemo } from 'react';
import { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from "@/lib/validation";
import { z } from 'zod';
import { Shell } from "@/components/ui/shell";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/dashboard/user-form";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { getAllUsers, updateUser } from "@/lib/supabase/service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';

interface UsersPageClientProps {
  initialUsers: User[];
}

type UserFormValues = z.infer<typeof userSchema>;

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            role: 'Viewer',
            phone: '',
        },
    });

    useEffect(() => {
        if (editingUser) {
            form.reset(editingUser);
        } else {
            form.reset({ name: '', email: '', role: 'Viewer', phone: '' });
        }
    }, [editingUser, isModalOpen]);

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

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const onDelete = (userId: string) => {
        console.log("Deletar usuário:", userId);
        toast({ title: "Ação não implementada", description: "A deleção de usuários ainda não foi configurada." });
    };

    const onSubmit = async (values: UserFormValues) => {
        if (!editingUser) {
            toast({ title: "Ação não implementada", description: "A criação de novos usuários ainda não foi configurada." });
            setIsModalOpen(false);
            return;
        }

        try {
            await updateUser(editingUser.id, values);
            toast({ title: "Sucesso", description: "Usuário atualizado com sucesso." });
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    const columns = useMemo(() => getColumns(handleEdit, onDelete), [users]);

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
                <DataTableSkeleton columnCount={5} />
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
                        onCancel={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Shell>
    );
}
