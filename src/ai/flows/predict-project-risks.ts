// src/ai/flows/predict-project-risks.ts
'use server';

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { ai } from '@/ai/genkit';
import type { Project } from '@/lib/types';
import { predictProjectRisksOutputSchema } from './schemas';

export const predictProjectRisks = ai.defineFlow(
  {
    name: 'predictProjectRisks',
    inputSchema: z.object({ project: z.any() as z.ZodType<Project> }),
    outputSchema: predictProjectRisksOutputSchema,
  },
  async ({ project }) => {
    // ... (contexto do prompt mantido) ...

    const llmResponse = await generate({
      model: 'google/gemini-1.5-flash',
      prompt: `... (o prompt permanece o mesmo) ...`,
      output: {
        format: 'json',
        schema: predictProjectRisksOutputSchema,
      },
    });

    return llmResponse.output()!;
  }
);
