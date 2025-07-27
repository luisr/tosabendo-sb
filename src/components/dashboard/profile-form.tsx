// src/components/dashboard/profile-form.tsx
"use client";

import { useForm } from "react-hook-form";
// ... (outros imports mantidos) ...
import { Switch } from "@/components/ui/switch"; // Importado
import { Label } from "@/components/ui/label"; // Importado
import { Separator } from "@/components/ui/separator"; // Importado

// ... (interface e schema mantidos) ...

export function ProfileForm({ user }: ProfileFormProps) {
    // ... (hooks mantidos) ...

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name,
            avatar: user.avatar,
            email: user.email,
            phone: user.phone || '',
            // Novos campos adicionados
            whatsapp_number: user.whatsapp_number || '',
            whatsapp_notifications_enabled: user.whatsapp_notifications_enabled || false,
        },
    });

    // ... (passwordForm e onPasswordSubmit mantidos) ...

    const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
        try {
            // A função updateUser já espera um objeto parcial, então isso funciona.
            await updateUser(user.id, data);
            toast({
                title: "Perfil Atualizado",
                description: "Suas informações foram salvas com sucesso.",
            });
        } catch(e) {
            toast({ title: "Erro ao atualizar perfil", variant: 'destructive' })
        }
    };

  return (
    <div className="space-y-8">
        {/* Profile Information Card */}
        <Card>
            <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Atualize seu nome, avatar e informações de contato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* ... (campos de avatar, nome, email, telefone mantidos) ... */}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={user.mustChangePassword}>Salvar Alterações</Button>
                </CardFooter>
            </form>
            </Form>
        </Card>

        {/* Notification Settings Card (NOVO) */}
        <Card>
            <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardHeader>
                    <CardTitle>Configurações de Notificação</CardTitle>
                    <CardDescription>Gerencie como você recebe alertas e atualizações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={profileForm.control}
                        name="whatsapp_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número do WhatsApp</FormLabel>
                                <FormControl>
                                    <Input placeholder="+55 (99) 99999-9999" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={profileForm.control}
                        name="whatsapp_notifications_enabled"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Notificações via WhatsApp
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Receba alertas sobre tarefas e projetos diretamente no seu WhatsApp.
                                </p>
                                </div>
                                <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={user.mustChangePassword}>Salvar Preferências</Button>
                </CardFooter>
            </form>
            </Form>
        </Card>

        {/* Change Password Card */}
        <Card>
            {/* ... (formulário de senha mantido como está) ... */}
        </Card>
    </div>
  );
}
