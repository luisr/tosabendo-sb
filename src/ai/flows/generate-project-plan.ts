// src/ai/flows/generate-project-plan.ts
'use server';

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { ai } from '@/ai/genkit'; // Importa a instância centralizada
import { interviewResponseSchema, projectPlanSchema } from './schemas';

export const projectPlannerFlow = ai.defineFlow( // Usa a instância 'ai'
  {
    name: 'projectPlannerFlow',
    inputSchema: z.object({
      history: z.array(z.object({
        user: z.string().optional(),
        model: z.string().optional(),
      })),
    }),
    outputSchema: z.union([interviewResponseSchema, projectPlanSchema]),
  },
  async (payload) => {
    const promptHistory = payload.history.flatMap(turn => [
        { role: 'user', content: turn.user ?? '' },
        { role: 'model', content: turn.model ?? '' }
    ]);
    
    const llmResponse = await generate({
      model: 'google/gemini-1.5-flash', // Usa o nome do modelo diretamente
      history: promptHistory,
      prompt: `... (o prompt permanece o mesmo) ...`,
      output: {
        format: 'json',
        schema: z.union([interviewResponseSchema, projectPlanSchema]),
      },
    });

    return llmResponse.output()!;
  }
);
