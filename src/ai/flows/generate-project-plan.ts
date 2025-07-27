// src/ai/flows/generate-project-plan.ts
'use server';

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { configureGenkit } from '@/ai/genkit';
import { defineFlow, runFlow } from 'genkit';
import { googleAI } from 'genkit/googleai';

// Configura o Genkit para usar o Google AI
configureGenkit();

// =================================================================
//          ESQUEMAS DE ENTRADA E SAÍDA (INPUT/OUTPUT)
// =================================================================

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

// =================================================================
//          FLUXO PRINCIPAL DO ASSISTENTE DE PLANEJAMENTO
// =================================================================

export const projectPlannerFlow = defineFlow(
  {
    name: 'projectPlannerFlow',
    inputSchema: z.object({
      history: z.array(z.object({
        user: z.string().optional(),
        model: z.string().optional(),
      })).describe("O histórico da conversa até o momento."),
    }),
    outputSchema: z.union([interviewResponseSchema, projectPlanSchema]).describe("A resposta da IA, que pode ser uma pergunta ou o plano final."),
  },
  async (payload) => {
    const promptHistory = payload.history.flatMap(turn => [
        { role: 'user', content: turn.user ?? '' },
        { role: 'model', content: turn.model ?? '' }
    ]);
    
    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash'),
      history: promptHistory,
      prompt: `
        Você é um assistente especialista em planejamento de projetos. Sua tarefa é guiar o usuário através de uma entrevista para coletar os detalhes de um novo projeto e, ao final, gerar um plano de projeto estruturado.

        O histórico da nossa conversa está acima. Analise-o e decida o próximo passo.

        **Regras:**
        1.  Se você ainda precisa de mais informações para criar um plano detalhado (escopo, entregáveis, riscos, etc.), faça **uma única pergunta** para o usuário. Sua pergunta deve ser clara e lógica, baseada nas informações que você já tem.
        2.  Se você acredita que já tem informações suficientes para criar um plano de projeto de alta qualidade, anuncie que esta é a pergunta final e peça a confirmação do usuário.
        3.  Se o usuário confirmou que você pode gerar o plano, ou se ele disse algo como "pode gerar o plano", "está tudo certo", gere o plano de projeto final. O plano deve conter uma breve introdução e uma lista de tarefas.
        4.  **IMPORTANTE:** Sempre responda no formato JSON solicitado.

        **Se você for fazer uma pergunta, use este formato:**
        ${JSON.stringify({ question: "Sua pergunta aqui...", isFinalQuestion: false }, null, 2)}

        **Se você for gerar o plano final, use este formato:**
        ${JSON.stringify({ introduction: "Sua introdução aqui...", tasks: [{ id: "T001", name: "Nome da Tarefa", duration: "Duração", dependencies: [], assignee: "Responsável" }] }, null, 2)}
      `,
      output: {
        format: 'json',
        schema: z.union([interviewResponseSchema, projectPlanSchema]),
      },
    });

    return llmResponse.output()!;
  }
);
