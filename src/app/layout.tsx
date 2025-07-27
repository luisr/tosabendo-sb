// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
// A importação do AuthProvider foi removida

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
          defaultTheme="theme-macos-light"
          enableSystem
          disableTransitionOnChange
        >
          {/* O AuthProvider foi removido daqui */}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
