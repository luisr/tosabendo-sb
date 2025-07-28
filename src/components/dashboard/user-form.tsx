// src/components/dashboard/user-form.tsx
'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { z } from 'zod';
import { IMaskInput } from 'react-imask';
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

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  form: UseFormReturn<UserFormValues>;
}

export function UserForm({ form }: UserFormProps) {
  return (
    <Form {...form}>
      {/* O <form> e os botões de ação foram movidos para o componente pai (Dialog) */}
      <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl><Input placeholder="Ex: Maria Clara" {...field} /></FormControl>
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
                <FormControl><Input type="email" placeholder="maria.clara@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
              control={form.control}
              name="phone"
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormItem>
                      <FormLabel>Telefone (WhatsApp)</FormLabel>
                      <FormControl>
                          <IMaskInput
                              mask="+{55} (00) 00000-0000"
                              value={value || ''}
                              unmask={true}
                              onAccept={(val) => onChange(val)}
                              placeholder="+55 (11) 98765-4321"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
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
                    <SelectTrigger><SelectValue placeholder="Selecione uma função" /></SelectTrigger>
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
    </Form>
  );
}
