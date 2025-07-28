// src/hooks/use-mobile.tsx
'use client';

import { useState, useEffect } from 'react';

// Um hook simples para detectar se a tela está em um tamanho "mobile" (abaixo de 768px por padrão)
export function useMobile(query: string = '(max-width: 768px)') {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Define o estado inicial
    setIsMobile(mediaQuery.matches);

    // Ouve as mudanças
    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    // Limpa o ouvinte quando o componente é desmontado
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return isMobile;
}
