// src/lib/validation.ts
import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(3, { message: "O nome do projeto deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  plannedStartDate: z.date({ required_error: "A data de início é obrigatória." }),
  plannedEndDate: z.date({ required_error: "A data de término é obrigatória." }),
  plannedBudget: z.number().optional(),
});

export const userSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  role: z.enum(['Admin', 'Manager', 'Editor', 'Viewer']),
  phone: z.string().optional(), // Adicionado o campo de telefone
});

export const taskSchema = z.object({
  name: z.string().min(3, { message: "O nome da tarefa deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  statusId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(['Baixa', 'Média', 'Alta', 'Crítica']).optional(),
  plannedStartDate: z.date().optional(),
  plannedEndDate: z.date().optional(),
  plannedHours: z.number().optional(),
});
