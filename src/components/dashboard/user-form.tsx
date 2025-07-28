// src/components/dashboard/user-form.tsx
'use client';

import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import type { UserRole } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  form: UseFormReturn<UserFormValues>;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
}

export function UserForm({ form, onSubmit, onCancel }: UserFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: Maria Clara" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="maria.clara@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Telefone (WhatsApp)</FormLabel>
                <FormControl>
                    <Input placeholder="+55 11 98765-4321" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Função do Usuário</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Gerente</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Viewer">Visualizador</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
            </Button>
            <Button type="submit">
                Salvar Alterações
            </Button>
        </div>
      </form>
    </Form>
  );
}
