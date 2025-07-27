// src/lib/types.ts

// ... (outros tipos mantidos como estão) ...

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'formula'; // Adicionado 'formula'
  formula?: string; // Campo opcional para armazenar a expressão da fórmula
}

// ... (resto dos tipos mantidos como estão) ...
