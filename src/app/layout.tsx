// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth"; // Importado

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tô de Olho!",
  description: "Gerenciador de Projetos Inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider> {/* Adicionado */}
            {children}
            <Toaster />
          </AuthProvider> {/* Adicionado */}
        </ThemeProvider>
      </body>
    </html>
  );
}
