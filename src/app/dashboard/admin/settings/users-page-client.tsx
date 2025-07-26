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

interface UsersPageClientProps {
  initialUsers: User[];
}

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para o modal
    const { toast } = useToast();

    const form = useForm<ZodType<User>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            id: '',
            name: "",
            email: "",
            role: "Viewer", // Alterado para um padrão mais seguro
        },
        mode: "onChange"
    });

    useEffect(() => {
        if (isModalOpen) {
            if (editingUser) {
                form.reset(editingUser);
            } else {
                form.reset({
                    id: '',
                    name: "",
                    email: "",
                    role: "Viewer",
                });
            }
        }
    }, [editingUser, isModalOpen, form]);
    
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
            setIsModalOpen(false);
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
            
            <DataTable columns={columns} data={users} />

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
