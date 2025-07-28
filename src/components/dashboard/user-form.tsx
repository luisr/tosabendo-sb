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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { userSchema } from '@/lib/validation';

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  form: UseFormReturn<UserFormValues>;
  // O onSubmit agora é opcional, pois a página pai pode controlar a submissão
  onSubmit?: (data: UserFormValues) => void; 
}

export function UserForm({ form, onSubmit }: UserFormProps) {
  // A lógica de submissão agora é opcional e pode ser passada ou
  // controlada pelo componente pai através do form.handleSubmit
  const formSubmit = onSubmit ? form.handleSubmit(onSubmit) : (e: React.FormEvent) => e.preventDefault();

  return (
    <Form {...form}>
      <form onSubmit={formSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João da Silva" {...field} />
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
                <Input type="email" placeholder="joao.silva@email.com" {...field} />
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
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
      </form>
    </Form>
  );
}
