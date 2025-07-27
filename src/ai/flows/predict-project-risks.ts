// src/ai/flows/predict-project-risks.ts
'use server';

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
// ... (outras importações mantidas) ...

export const predictProjectRisksOutputSchema = z.object({
  identifiedRisks: z.array(z.object({
    risk: z.string().describe("Descrição do risco potencial."),
    probability: z.enum(["Baixa", "Média", "Alta"]),
    impact: z.enum(["Baixo", "Médio", "Alto"]),
    mitigation: z.string().describe("Sugestão de uma estratégia para mitigar o risco. Use Markdown para formatar a resposta se necessário (ex: listas)."),
  })),
});

export const predictProjectRisks = defineFlow(
  {
    name: 'predictProjectRisks',
    inputSchema: z.object({ project: z.any() as z.ZodType<Project> }),
    outputSchema: predictProjectRisksOutputSchema,
  },
  async ({ project }) => {
    // ... (contexto do projeto mantido) ...

    const llmResponse = await generate({
      model: googleAI('gemini-1.5-flash'),
      prompt: `
        Você é um gerente de projetos sênior especialista em análise de riscos.
        Analise os dados do projeto e identifique os riscos potenciais.
        
        Dados do Projeto: ${JSON.stringify(project)}

        **IMPORTANTE**: Para as estratégias de mitigação, use formatação Markdown (como listas de marcadores) para tornar as sugestões claras e acionáveis.
      `,
      output: {
        format: 'json',
        schema: predictProjectRisksOutputSchema,
      },
    });

    return llmResponse.output()!;
  }
);
