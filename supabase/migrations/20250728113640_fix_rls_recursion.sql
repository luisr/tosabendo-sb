-- Corrigir o problema de recursão infinita nas políticas RLS

-- 1. Remover as políticas existentes que estão causando o problema
DROP POLICY IF EXISTS "Usuários podem ver projetos da sua equipe" ON projects;
DROP POLICY IF EXISTS "Usuários podem ver equipes dos seus projetos" ON project_team;
DROP POLICY IF EXISTS "Gerentes podem gerenciar equipe dos seus projetos" ON project_team;


-- 2. Criar uma função para verificar se um usuário é membro de um projeto.
--    Usar SECURITY DEFINER permite que a função seja executada com os privilégios
--    do criador da função, evitando a checagem RLS na tabela project_team.
CREATE OR REPLACE FUNCTION is_project_member(p_project_id uuid, p_user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_team
    WHERE project_id = p_project_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Recriar as políticas usando a função, o que evita a referência cruzada direta.

-- Política para a tabela 'projects'
CREATE POLICY "Usuários podem ver projetos dos quais são membros"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    is_project_member(id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

-- Política de SELECT para a tabela 'project_team'
-- Um usuário pode ver os membros de um projeto se ele mesmo for membro daquele projeto.
-- CORREÇÃO: Usar a função is_project_member para evitar recursão.
CREATE POLICY "Membros do projeto podem ver a equipe do projeto"
  ON project_team
  FOR SELECT
  TO authenticated
  USING (
    is_project_member(project_id, auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

-- Política de ALL (INSERT, UPDATE, DELETE) para a tabela 'project_team'
-- Apenas gerentes de projeto e administradores podem modificar a equipe.
CREATE POLICY "Gerentes e Admins podem gerenciar a equipe do projeto"
  ON project_team
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_team.project_id
      AND projects.manager_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_team.project_id
      AND projects.manager_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );
