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
import { DataTable } from "@/components/ui/data-table"; // Corrigido
import { getColumns } from "./columns";
import { getAllUsers, createUser, updateUser, deleteUser } from "@/lib/supabase/service";

interface UsersPageClientProps {
  initialUsers: User[];
}

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();

    const form = useForm<ZodType<User>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            id: '',
            name: "",
            email: "",
            role: "USER",
        },
        mode: "onChange"
    });

    useEffect(() => {
        if (editingUser) {
            form.reset(editingUser);
        } else {
            form.reset({
                id: '',
                name: "",
                email: "",
                role: "USER",
            });
        }
    }, [editingUser, form]);
    
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
    };
    
    const handleAddNew = () => {
        setEditingUser(null);
    };

    const onSubmit = async (data: User) => {
        setLoading(true);
        try {
            if (editingUser) {
                await updateUser({ ...editingUser, ...data });
                toast({ title: "Usuário atualizado com sucesso!" });
            } else {
                await createUser(data);
                toast({ title: "Usuário Criado com sucesso!" });
            }
            setEditingUser(null);
            await fetchUsers();
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao salvar o usuário.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async (id: string) => {
        setLoading(true);
        try {
            await deleteUser(id);
            toast({ title: "Usuário deletado com sucesso!" });
            await fetchUsers();
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao deletar usuário.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    const columns = useMemo(() => getColumns(handleEdit, onDelete), [handleEdit, onDelete]);

    return (
        <Shell>
            <div className="flex flex-col gap-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        {editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}
                    </h2>
                    <UserForm 
                        key={editingUser ? editingUser.id : 'new-user'}
                        form={form} 
                        onSubmit={onSubmit}
                    />
                    {editingUser && (
                        <Button variant="link" onClick={handleAddNew} className="mt-2">
                            + Adicionar Novo Usuário
                        </Button>
                    )}
                </div>

                <div>
                     <h2 className="text-2xl font-bold tracking-tight mb-4">
                        Lista de Usuários
                    </h2>
                    <DataTable columns={columns} data={users} />
                </div>
            </div>
        </Shell>
    );
}
