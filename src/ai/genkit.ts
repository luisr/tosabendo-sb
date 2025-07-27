// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Exporta uma única instância do Genkit, já configurada com os plugins.
// Esta é a forma correta de inicializar e configurar o Genkit.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
