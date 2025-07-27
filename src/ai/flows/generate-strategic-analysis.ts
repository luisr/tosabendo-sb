// src/ai/flows/generate-strategic-analysis.ts
'use server';

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
// ... (outras importações mantidas) ...

export const strategicAnalysisSchema = z.object({
  competitiveAdvantages: z.string().describe("Análise de vantagens competitivas e vulnerabilidades. Use Markdown para formatar a resposta."),
  riskMitigation: z.string().describe("Análise de riscos de mercado e execução. Use Markdown."),
  strategicRecommendations: z.string().describe("Recomendações estratégicas (diferenciação, ofensivas, defensivas). Use Markdown."),
});

export const generateStrategicAnalysis = defineFlow(
  {
    name: 'generateStrategicAnalysis',
    inputSchema: z.object({ project: z.any() as z.ZodType<Project> }),
    outputSchema: strategicAnalysisSchema,
  },
  async ({ project }) => {
    // ... (contexto do projeto mantido) ...

    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash'),
      prompt: `
        Você é um consultor de negócios sênior da McKinsey. Analise os dados de um projeto e gere um relatório de análise estratégica.
        
        Dados do Projeto: ${JSON.stringify(project)}

        **IMPORTANTE**: Formate toda a sua resposta usando Markdown para uma apresentação profissional. Use títulos, negrito, itálico e listas de marcadores para organizar a informação.
      `,
      output: {
        format: 'json',
        schema: strategicAnalysisSchema,
      },
    });

    return llmResponse.output()!;
  }
);
