// src/ai/flows/schemas.ts
import { z } from 'zod';

// Define a estrutura da entrada inicial do usuário
export const initialProjectInputSchema = z.object({
  name: z.string().describe("O nome do projeto."),
  objective: z.string().describe("O objetivo principal do projeto."),
  deadline: z.string().describe("O prazo final desejado."),
  budget: z.string().optional().describe("O orçamento estimado."),
  teamContext: z.string().optional().describe("Contexto sobre a equipe disponível, se houver."),
});

// Define a estrutura da resposta da IA durante a entrevista
export const interviewResponseSchema = z.object({
  question: z.string().describe("A próxima pergunta a ser feita ao usuário."),
  isFinalQuestion: z.boolean().describe("Indica se esta é a última pergunta antes de gerar o plano."),
});

// Define a estrutura de uma única tarefa no plano final
export const projectTaskSchema = z.object({
  id: z.string().describe("Um identificador único para a tarefa (ex: T001)."),
  name: z.string().describe("Uma descrição clara da atividade."),
  duration: z.string().describe("O tempo previsto para conclusão (ex: '3 dias', '2 semanas')."),
  dependencies: z.array(z.string()).describe("Uma lista de IDs de tarefas que precisam ser concluídas antes desta."),
  assignee: z.string().optional().describe("A pessoa ou função sugerida como responsável."),
});

// Define a estrutura da saída final do plano de projeto
export const projectPlanSchema = z.object({
  introduction: z.string().describe("Uma breve introdução ao plano de projeto."),
  tasks: z.array(projectTaskSchema).describe("A lista detalhada de tarefas do projeto."),
});
