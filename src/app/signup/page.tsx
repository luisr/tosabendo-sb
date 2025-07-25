'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/config'; // Importe o cliente Supabase

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Limpa mensagens anteriores

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(`Erro ao cadastrar: ${error.message}`);
    } else if (data.user) {
      setMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar.');
      // Você pode redirecionar o usuário aqui, se necessário
    } else {
      setMessage('Ocorreu um erro desconhecido durante o cadastro.');
    }
  };

  return (
    <div>
      <h1>Página de Cadastro</h1>
      <form onSubmit={handleSignUp}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
