"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      // Registra todos os temas disponíveis
      themes={['light', 'dark', 'theme-macos-light', 'theme-win11-dark']}
    >
      {children}
    </NextThemesProvider>
  )
}
