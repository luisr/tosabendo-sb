'use client';

import { useState, useMemo, useTransition } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Loader2 } from 'lucide-react';
import { updateUserAction, createUserAction } from '@/app/actions';

interface UsersPageClientProps {
  initialUsers: User[];
}

type UserFormValues = z.infer<typeof userSchema>;

export function UsersPageClient({ initialUsers }: UsersPageClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
    });

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.reset({ name: user.name, email: user.email, role: user.role, phone: user.phone || '' });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        form.reset({ name: '', email: '', role: 'Viewer', phone: '' });
        setIsModalOpen(true);
    };

    const onDelete = (userId: string) => {
        toast({ title: "Ação não implementada", description: "A deleção de usuários ainda não foi configurada." });
    };

    const onSubmit = (values: UserFormValues) => {
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });

            const action = editingUser 
                ? updateUserAction.bind(null, editingUser.id) 
                : createUserAction;
            
            const result = await action(formData);

            if (result.error) {
                toast({ title: "Erro", description: result.error, variant: "destructive" });
            } else {
                toast({ title: "Sucesso!", description: result.success });
                setIsModalOpen(false);
            }
        });
    };
    
    const columns = useMemo(() => getColumns(handleEdit, onDelete), []);

    return (
        <Shell>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                </Button>
            </div>
            
            {/* A DataTable agora recebe a lista de usuários do server component */}
            <DataTable columns={columns} data={users} />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <UserForm form={form} />
                        <DialogFooter className="mt-6">
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Shell>
    );
}
