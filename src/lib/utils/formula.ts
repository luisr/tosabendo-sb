// src/lib/utils/formula.ts
import type { Task } from "@/lib/types";

/**
 * Calcula o resultado de uma string de fórmula com base nos dados de uma tarefa.
 * @param formula A string da fórmula, ex: "{plannedHours} * 50 - {actualHours}"
 * @param task O objeto da tarefa que contém os valores a serem usados.
 * @returns O resultado numérico do cálculo, ou null se houver um erro.
 */
export function calculateFormula(formula: string, task: Task): number | null {
  try {
    // Regex para encontrar todas as ocorrências de {fieldName}
    const fieldRegex = /\{([^}]+)\}/g;
    
    // Substitui cada placeholder pelo seu valor correspondente na tarefa
    const expression = formula.replace(fieldRegex, (match, fieldName) => {
      const key = fieldName.trim() as keyof Task;
      
      // Acessa o valor da tarefa. Usa 0 como padrão para campos numéricos.
      const value = task[key];
      
      if (typeof value === 'number') {
        return String(value);
      }
      
      // Se o campo não for um número ou não existir, retorna '0' para a expressão.
      console.warn(`Campo de fórmula "${key}" não é um número ou não foi encontrado na tarefa.`);
      return '0';
    });

    // Remove quaisquer caracteres que não sejam parte de uma expressão matemática segura.
    const sanitizedExpression = expression.replace(/[^0-9.+\-*/(). ]/g, '');

    // Usa o Function constructor para avaliar a expressão de forma segura.
    // É mais seguro do que `eval()` porque não tem acesso ao escopo global.
    const result = new Function(`return ${sanitizedExpression}`)();

    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }

    return null; // Retorna null se o resultado não for um número válido
  } catch (error) {
    console.error("Erro ao calcular a fórmula:", error);
    return null; // Retorna null em caso de erro de sintaxe ou qualquer outra falha
  }
}
