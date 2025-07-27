// src/ai/flows/generate-strategic-analysis.ts
'use server';

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { ai } from '@/ai/genkit';
import type { Project } from '@/lib/types';
import { strategicAnalysisSchema } from './schemas';

export const generateStrategicAnalysis = ai.defineFlow(
  {
    name: 'generateStrategicAnalysis',
    inputSchema: z.object({ project: z.any() as z.ZodType<Project> }),
    outputSchema: strategicAnalysisSchema,
  },
  async ({ project }) => {
    // ... (contexto do prompt mantido) ...

    const llmResponse = await generate({
      model: 'google/gemini-1.5-flash',
      prompt: `... (o prompt permanece o mesmo) ...`,
      output: {
        format: 'json',
        schema: strategicAnalysisSchema,
      },
    });

    return llmResponse.output()!;
  }
);
