// src/ai/flows/summarize-all-projects.ts
'use server';

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { ai } from '@/ai/genkit';
import { summarizeAllProjectsOutputSchema } from './schemas';

export const summarizeAllProjects = ai.defineFlow(
  {
    name: 'summarizeAllProjects',
    inputSchema: z.object({ projects: z.any().describe("Uma lista de objetos de projeto.") }),
    outputSchema: summarizeAllProjectsOutputSchema,
  },
  async ({ projects }) => {
    // ... (contexto do prompt mantido) ...

    const llmResponse = await generate({
      model: 'google/gemini-1.5-flash',
      prompt: `... (o prompt permanece o mesmo) ...`,
      output: {
        format: 'json',
        schema: summarizeAllProjectsOutputSchema,
      },
    });

    return llmResponse.output()!;
  }
);
