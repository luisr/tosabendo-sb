// src/ai/flows/summarize-all-projects.ts
'use server';

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
// ... (outras importações mantidas) ...

export const summarizeAllProjectsOutputSchema = z.object({
  overallStatus: z.string().describe("Um resumo do status geral do portfólio. Use Markdown para formatação (ex: **negrito** para ênfase, listas para pontos chave)."),
  crossProjectRisks: z.string().describe("Uma análise dos riscos que afetam múltiplos projetos. Use Markdown."),
  strategicRecommendations: z.string().describe("Recomendações estratégicas para o portfólio como um todo. Use Markdown."),
});

export const summarizeAllProjects = defineFlow(
  {
    name: 'summarizeAllProjects',
    inputSchema: z.object({ projects: z.any().describe("Uma lista de objetos de projeto.") }),
    outputSchema: summarizeAllProjectsOutputSchema,
  },
  async ({ projects }) => {
    const context = JSON.stringify(projects.map((p: any) => ({
      name: p.name,
      status: p.kpis, // Assumindo que kpis contém o status
      tasksCompleted: p.tasks?.filter((t: any) => t.status === 'Concluído').length,
      totalTasks: p.tasks?.length,
    })));

    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash'),
      prompt: `
        Você é um Diretor de Portfólio (CPO) sênior. Analise os seguintes projetos e forneça uma análise consolidada.
        
        Dados dos Projetos: ${context}

        **IMPORTANTE**: Formate toda a sua resposta usando Markdown para melhor legibilidade. Use títulos, negrito, itálico e listas de marcadores para organizar a informação.
      `,
      output: {
        format: 'json',
        schema: summarizeAllProjectsOutputSchema,
      },
    });

    return llmResponse.output()!;
  }
);
