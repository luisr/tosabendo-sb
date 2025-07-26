'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Eye, EyeOff, Loader2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { createPagesBrowserClient } from '@/lib/supabase/client'; // Corrigido

const Logo = () => (
    <div className="flex justify-center items-center mb-4 text-primary">
        <BrainCircuit className="h-16 w-16" />
    </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createPagesBrowserClient(); // Corrigido

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      toast({
        title: "Erro de Login",
        description: error.message || "Ocorreu um erro ao tentar fazer login.",
        variant: "destructive",
      });
    } else if (data.user) {
      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo de volta!`,
      });
      // O middleware cuidará do redirecionamento
      router.refresh(); 
    }

    setLoading(false);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
            <div className='flex justify-between items-start'>
                <div className="text-center w-full">
                    <Logo />
                    <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
                    <CardDescription>Bem-vindo! Faça login para acessar seus projetos.</CardDescription>
                </div>
                <ThemeToggle />
            </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                    <Input 
                        id="password" 
                        type={showPassword ? 'text' : 'password'}
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="pr-10"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                        <span className="sr-only">{showPassword ? 'Ocultar senha' : 'Mostrar senha'}</span>
                    </Button>
                </div>
            </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </main>
  );
}
