// src/app/layout.tsx
'use client'; // Necessário para usar hooks e contexto

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
// import { AuthProvider } from '@/hooks/use-auth'; // Importe o AuthProvider
import dynamic from 'next/dynamic';

// Importação dinâmica do AuthProvider com ssr: false
const AuthProvider = dynamic(
  () => import('@/hooks/use-auth').then((mod) => mod.AuthProvider),
  { ssr: false }
);

// A exportação de metadata não é mais suportada em Client Components.
// Você pode precisar movê-la para um Server Component pai, se necessário.
/*
export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};
*/

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider> {/* Envolva a aplicação com AuthProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
