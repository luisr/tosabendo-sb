-- Corrigir o problema de recursão infinita nas políticas RLS entre 'projects' e 'project_team'

-- 1. Remover as políticas existentes na tabela 'project_team' que causam o problema.
DROP POLICY IF EXISTS "Usuários podem ver equipes dos seus projetos" ON public.project_team;
DROP POLICY IF EXISTS "Gerentes podem gerenciar equipe dos seus projetos" ON public.project_team;

-- 2. Criar uma função 'SECURITY DEFINER' para buscar o ID do gerente do projeto.
-- Esta função é executada com as permissões do seu criador (o superusuário do banco de dados),
-- o que evita que a verificação RLS do usuário atual seja acionada dentro da função, quebrando o ciclo de recursão.
CREATE OR REPLACE FUNCTION get_project_manager_id(p_project_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- A especificação 'public.projects' garante que a tabela correta seja usada.
  SELECT manager_id FROM public.projects WHERE id = p_project_id;
$$;

-- 3. Recriar a política de SELECT (leitura) usando a nova função.
CREATE POLICY "Usuários podem visualizar equipes de projetos autorizados"
  ON public.project_team
  FOR SELECT
  TO authenticated
  USING (
    -- Permite se o usuário é um membro direto da equipe.
    (auth.uid() = user_id)
    -- Permite se o usuário é o gerente do projeto (usando a função para evitar recursão).
    OR (auth.uid() = get_project_manager_id(project_id))
    -- Permite se o usuário é um administrador do sistema.
    OR (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'))
  );

-- 4. Recriar a política de ALL (escrita/modificação) usando a nova função.
CREATE POLICY "Gerentes e Admins podem gerenciar equipes de projetos"
  ON public.project_team
  FOR ALL
  TO authenticated
  USING (
    -- A cláusula USING se aplica a SELECT, UPDATE, DELETE.
    -- Permite se o usuário é o gerente do projeto.
    (auth.uid() = get_project_manager_id(project_id))
    -- Permite se o usuário é um administrador.
    OR (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'))
  )
  WITH CHECK (
    -- A cláusula WITH CHECK se aplica a INSERT, UPDATE.
    -- Garante que ninguém possa mover/adicionar membros a um projeto que não gerencia.
    (auth.uid() = get_project_manager_id(project_id))
    -- Permite se o usuário é um administrador.
    OR (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin'))
  );
