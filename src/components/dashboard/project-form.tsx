// src/components/dashboard/project-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { projectSchema } from '@/lib/validation';
import type { Project, User } from '@/lib/types';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: ProjectFormValues) => void;
  project?: Project | null;
  users: User[];
  isLaunchForm?: boolean; // Prop para controlar o modo do formulário
}

export function ProjectForm({
  isOpen,
  onOpenChange,
  onSave,
  project,
  users,
  isLaunchForm = false, // Valor padrão é false
}: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      plannedStartDate: new Date(),
      plannedEndDate: new Date(),
      plannedBudget: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (project) {
        form.reset({
          name: project.name,
          description: project.description,
          plannedStartDate: new Date(project.plannedStartDate),
          plannedEndDate: new Date(project.plannedEndDate),
          plannedBudget: project.plannedBudget,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          plannedStartDate: new Date(),
          plannedEndDate: new Date(),
          plannedBudget: 0,
        });
      }
    }
  }, [isOpen, project, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLaunchForm ? 'Iniciar Planejamento com IA' : project ? 'Editar Projeto' : 'Criar Novo Projeto'}</DialogTitle>
          <DialogDescription>
            {isLaunchForm ? 'Forneça os detalhes iniciais para que a IA possa te ajudar.' : 'Preencha os detalhes do projeto.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Sistema de E-commerce 'Nexus'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo Principal / Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o principal objetivo do projeto." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="plannedEndDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Prazo Final</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="plannedBudget"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Orçamento (Opcional)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ex: 50000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            {/* O campo de data de início só aparece no modo manual */}
            {!isLaunchForm && (
                <FormField
                control={form.control}
                name="plannedStartDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                       <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">{isLaunchForm ? 'Iniciar com IA' : 'Salvar Projeto'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
