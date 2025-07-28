// src/app/dashboard/admin/users/new/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { userSchema } from '@/lib/validation';
// Removed direct import of createUser service
import { UserForm } from '@/components/dashboard/user-form';
import { Shell } from '@/components/ui/shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createUser } from './actions'; // Import the server action

type UserFormValues = z.infer<typeof userSchema>;

export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Viewer', // Padrão de segurança: o menor privilégio
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      // Call the server action instead of the service directly
      const result = await createUser(data);

      if (result.success) {
        toast({
          title: 'Usuário Criado com Sucesso',
          description: `Um convite ou senha temporária foi enviada para ${data.email}.`,
        });
        router.push('/dashboard/admin/settings'); // Redireciona de volta para a lista
      } else {
        toast({
          title: 'Erro ao Criar Usuário',
          description: result.error || 'Não foi possível criar o novo usuário.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao Criar Usuário',
        description: error.message || 'Não foi possível criar o novo usuário.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Shell>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Criar Novo Usuário</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para adicionar um novo membro à plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm form={form} />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" asChild>
                <Link href="/dashboard/admin/settings">Cancelar</Link>
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
                Salvar e Enviar Convite
            </Button>
        </CardFooter>
      </Card>
    </Shell>
  );
}
