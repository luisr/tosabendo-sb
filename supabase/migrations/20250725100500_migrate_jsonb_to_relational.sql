-- Habilitar uuid-ossp para gen_random_uuid() se ainda não estiver habilitado
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Iniciar uma transação para garantir atomicidade
BEGIN;

-- ===================================================================
-- 1. Criar Novas Tabelas (Baseado na Tarefa Técnica 101)
-- ===================================================================

-- Criar tabela de statuses
CREATE TABLE IF NOT EXISTS statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE, -- Nulável para status globais
  name text NOT NULL,
  color text,
  is_default boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  "order" integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(project_id, name) -- Nome único por projeto ou globalmente
);

-- Adicionar índices na tabela statuses
CREATE INDEX idx_statuses_project_id ON statuses(project_id);
CREATE INDEX idx_statuses_name ON statuses(name);


-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL, -- Assumindo um responsável por tarefa
  status_id uuid, -- Temporariamente sem FK, será adicionada após migrar statuses
  name text NOT NULL,
  description text,
  priority text,
  planned_start_date timestamptz, -- Permitir NUL L temporariamente para migração
  planned_end_date timestamptz,   -- Permitir NUL L temporariamente para migração
  actual_start_date timestamptz,
  actual_end_date timestamptz,
  planned_hours numeric DEFAULT 0,
  actual_hours numeric DEFAULT 0,
  progress numeric DEFAULT 0,
  is_critical boolean DEFAULT false,
  is_milestone boolean DEFAULT false,
  baseline_start_date timestamptz,
  baseline_end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar índices na tabela tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
-- CREATE INDEX idx_tasks_status_id ON tasks(status_id); -- Adicionar após criar FK
CREATE INDEX idx_tasks_planned_start_date ON tasks(planned_start_date);
CREATE INDEX idx_tasks_planned_end_date ON tasks(planned_end_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);


-- Criar tabela de dependências de tarefa
CREATE TABLE IF NOT EXISTS task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL, -- Temporariamente sem FK, será adicionada após migrar tasks
  depends_on_task_id uuid NOT NULL, -- Temporariamente sem FK, será adicionada após migrar tasks
  created_at timestamptz DEFAULT now(),

  UNIQUE(task_id, depends_on_task_id)
);

-- Adicionar índices na tabela task_dependencies
CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on_task_id ON task_dependencies(depends_on_task_id);


-- Criar tabela de campos customizados
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(project_id, name)
);

-- Adicionar índices na tabela custom_fields
CREATE INDEX idx_custom_fields_project_id ON custom_fields(project_id);


-- Criar tabela de valores de campo customizado de tarefa
CREATE TABLE IF NOT EXISTS task_custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL, -- Temporariamente sem FK, será adicionada após migrar tasks
  custom_field_id uuid NOT NULL, -- Temporariamente sem FK, será adicionada após migrar custom_fields
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(task_id, custom_field_id)
);

-- Adicionar índices na tabela task_custom_field_values
CREATE INDEX idx_task_custom_field_values_task_id ON task_custom_field_values(task_id);
CREATE INDEX idx_task_custom_field_values_custom_field_id ON task_custom_field_values(custom_field_id);
-- Considerar índice GIN ou GIST na coluna 'value' se forem necessárias consultas complexas em texto/JSON dentro do valor
-- CREATE INDEX idx_task_custom_field_values_value ON task_custom_field_values USING GIN (value); -- Se valor for JSONB/TEXT e precisar de busca full-text


-- Criar tabela de histórico de mudanças de tarefa
CREATE TABLE IF NOT EXISTS task_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL, -- Temporariamente sem FK, será adicionada após migrar tasks
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  justification text,
  created_at timestamptz DEFAULT now() -- updated_at pode não ser necessário aqui
);

-- Adicionar índices na tabela task_change_history
CREATE INDEX idx_task_change_history_task_id ON task_change_history(task_id);
CREATE INDEX idx_task_change_history_user_id ON task_change_history(user_id);
CREATE INDEX idx_task_change_history_timestamp ON task_change_history("timestamp");


-- ===================================================================
-- 2. Migrar Dados (Baseado na Tarefa Técnica 102 Esboço)
-- ===================================================================

-- Mapas temporários dentro da migração SQL para mapear IDs antigos para novos
-- Declarar variáveis para mapeamento (exemplo simplificado, em PL/pgSQL seria mais robusto)
-- Neste script SQL puro, usaremos CTEs e subconsultas para mapeamento durante a inserção.

-- CTE para extrair e gerar novos UUIDs para Status
WITH extracted_statuses AS (
  SELECT
    p.id AS project_id,
    status_obj ->> 'name' AS status_name,
    status_obj ->> 'color' AS status_color,
    (status_obj ->> 'isDefault')::boolean AS is_default,
    (status_obj ->> 'isCompleted')::boolean AS is_completed,
    (status_obj ->> 'order')::integer AS "order"
  FROM projects p,
       jsonb_array_elements(p.configuration -> 'statuses') AS status_obj
),
-- CTE para inserir Status únicos na nova tabela e mapear IDs antigos para novos
migrated_statuses AS (
    INSERT INTO statuses (id, project_id, name, color, is_default, is_completed, "order")
    SELECT
        gen_random_uuid(), -- Novo UUID para o status
        es.project_id,
        es.status_name,
        es.status_color,
        es.is_default,
        es.is_completed,
        es."order"
    FROM extracted_statuses es
    ON CONFLICT (project_id, name) DO NOTHING -- Evitar duplicatas
    RETURNING id, project_id, name -- Retornar novos IDs e nomes para mapeamento
),
-- CTE para extrair e gerar novos UUIDs para Campos Customizados
extracted_custom_fields AS (
  SELECT
    p.id AS project_id,
    field_obj ->> 'id' AS original_field_id, -- Usar id se existir, senão name
    field_obj ->> 'name' AS field_name,
    field_obj ->> 'type' AS field_type
  FROM projects p,
       jsonb_array_elements(p.configuration -> 'customFieldDefinitions') AS field_obj
),
-- CTE para inserir Campos Customizados únicos e mapear IDs antigos para novos
migrated_custom_fields AS (
    INSERT INTO custom_fields (id, project_id, name, type)
    SELECT
        gen_random_uuid(), -- Novo UUID para o campo customizado
        ecf.project_id,
        ecf.field_name,
        ecf.field_type::text -- Garantir que o tipo é texto
    FROM extracted_custom_fields ecf
    ON CONFLICT (project_id, name) DO NOTHING -- Evitar duplicatas
    RETURNING id, project_id, name, original_field_id -- Retornar novos IDs e nomes para mapeamento
),
-- CTE para extrair e gerar novos UUIDs para Tarefas e seus dados simples
extracted_tasks AS (
  SELECT
    p.id AS project_id,
    task_obj ->> 'id' AS original_task_id,
    gen_random_uuid() AS new_task_id, -- Gerar novo UUID aqui
    task_obj ->> 'name' AS task_name,
    task_obj ->> 'description' AS task_description,
    task_obj ->> 'parentId' AS original_parent_id, -- Capturar parent_id original
    task_obj -> 'assignee' ->> 'id' AS original_assignee_id, -- Capturar assignee_id original
    task_obj ->> 'status' AS original_status_name, -- Capturar status original
    task_obj ->> 'priority' AS task_priority,
    (task_obj ->> 'progress')::numeric AS task_progress,
    (task_obj ->> 'plannedStartDate')::timestamptz AS planned_start_date,
    (task_obj ->> 'plannedEndDate')::timestamptz AS planned_end_date,
    (task_obj ->> 'actualStartDate')::timestamptz AS actual_start_date,
    (task_obj ->> 'actualEndDate')::timestamptz AS actual_end_date,
    (task_obj ->> 'plannedHours')::numeric AS planned_hours,
    (task_obj ->> 'actualHours')::numeric AS actual_hours,
    (task_obj ->> 'isCritical')::boolean AS is_critical,
    (task_obj ->> 'isMilestone')::boolean AS is_milestone,
    (task_obj ->> 'baselineStartDate')::timestamptz AS baseline_start_date,
    (task_obj ->> 'baselineEndDate')::timestamptz AS baseline_end_date,
     task_obj -> 'customFields' AS original_custom_fields, -- Capturar customFields JSONB
     task_obj -> 'changeHistory' AS original_change_history, -- Capturar changeHistory JSONB
     task_obj ->> 'createdAt' AS original_created_at,
     task_obj ->> 'updatedAt' AS original_updated_at

  FROM projects p,
       jsonb_array_elements(p.tasks) AS task_obj
)
-- CTE para inserir Tarefas na nova tabela e mapear IDs
INSERT INTO tasks (id, project_id, assignee_id, status_id, name, description, priority, planned_start_date, planned_end_date, actual_start_date, actual_end_date, planned_hours, actual_hours, progress, is_critical, is_milestone, baseline_start_date, baseline_end_date, created_at, updated_at)
SELECT
  et.new_task_id,
  et.project_id,
  u.id AS assignee_id, -- Buscar assignee_id da tabela users
  ms.id AS status_id,   -- Buscar status_id da tabela migrated_statuses
  et.task_name,
  et.task_description,
  et.task_priority,
  COALESCE(et.planned_start_date, now()), -- Usar valor ou padrão
  COALESCE(et.planned_end_date, now()), -- Usar valor ou padrão
  et.actual_start_date,
  et.actual_end_date,
  COALESCE(et.planned_hours, 0),
  COALESCE(et.actual_hours, 0),
  COALESCE(et.task_progress, 0),
  COALESCE(et.is_critical, false),
  COALESCE(et.is_milestone, false),
  et.baseline_start_date,
  et.baseline_end_date,
  COALESCE(et.original_created_at::timestamptz, now()), -- Usar valor ou padrão
  COALESCE(et.original_updated_at::timestamptz, now()) -- Usar valor ou padrão
FROM extracted_tasks et
LEFT JOIN users u ON et.original_assignee_id = u.id::text -- Ligar assignee_id original ao user_id
LEFT JOIN migrated_statuses ms ON et.project_id = ms.project_id AND et.original_status_name = ms.name; -- Ligar status original ao status_id
-- Nota: Pode ser necessário um JOIN adicional para status globais se o nome não for encontrado por projeto


-- CTE para processar Dependências e mapear IDs
WITH extracted_dependencies AS (
  SELECT
    et.new_task_id AS task_id, -- Novo ID da tarefa dependente
    dep_id::text AS original_depends_on_task_id -- ID original da tarefa da qual depende
  FROM extracted_tasks et,
       jsonb_array_elements_text(et.original_dependencies) AS dep_id -- Assumindo dependencies é um array de strings
  WHERE et.original_dependencies IS NOT NULL
),
-- CTE para mapear IDs originais de dependência para novos IDs de tarefa
mapped_dependencies AS (
    SELECT
        ed.task_id,
        t.id AS depends_on_task_id -- Novo ID da tarefa da qual depende
    FROM extracted_dependencies ed
    JOIN tasks t ON ed.original_depends_on_task_id = (SELECT original_task_id FROM extracted_tasks WHERE new_task_id = t.id) -- Ligar ID original ao novo ID da tarefa
)
-- Inserir Dependências na nova tabela
INSERT INTO task_dependencies (task_id, depends_on_task_id)
SELECT
  md.task_id,
  md.depends_on_task_id
FROM mapped_dependencies md
ON CONFLICT (task_id, depends_on_task_id) DO NOTHING; -- Evitar duplicatas


-- CTE para processar Valores de Campo Customizado e mapear IDs
WITH extracted_cf_values AS (
  SELECT
    et.new_task_id AS task_id, -- Novo ID da tarefa
    (jsonb_each(et.original_custom_fields)).key AS original_field_id_or_name, -- Chave original (id ou nome)
    (jsonb_each(et.original_custom_fields)).value AS field_value -- Valor original
  FROM extracted_tasks et
  WHERE et.original_custom_fields IS NOT NULL
),
-- CTE para mapear IDs/Nomes originais de campo customizado e IDs de tarefa originais para novos IDs
mapped_cf_values AS (
    SELECT
        ecfv.task_id,
        mcf.id AS custom_field_id, -- Novo ID do campo customizado
        ecfv.field_value::text AS value -- Valor como texto
    FROM extracted_cf_values ecfv
    JOIN migrated_custom_fields mcf ON ecfv.original_field_id_or_name = mcf.original_field_id OR ecfv.original_field_id_or_name = mcf.name -- Ligar pela original_field_id ou name
)
-- Inserir Valores de Campo Customizado na nova tabela
INSERT INTO task_custom_field_values (task_id, custom_field_id, value)
SELECT
  mcfv.task_id,
  mcfv.custom_field_id,
  mcfv.value
FROM mapped_cf_values mcfv
ON CONFLICT (task_id, custom_field_id) DO NOTHING; -- Evitar duplicatas


-- CTE para processar Histórico de Mudanças e mapear IDs
WITH extracted_history AS (
  SELECT
    et.new_task_id AS task_id, -- Novo ID da tarefa
    history_obj ->> 'fieldChanged' AS field_changed,
    history_obj ->> 'oldValue' AS old_value,
    history_obj ->> 'newValue' AS new_value,
    history_obj ->> 'user' AS original_user_identifier, -- Pode ser nome ou ID no JSONB
    (history_obj ->> 'timestamp')::timestamptz AS "timestamp",
    history_obj ->> 'justification' AS justification
  FROM extracted_tasks et,
       jsonb_array_elements(et.original_change_history) AS history_obj
  WHERE et.original_change_history IS NOT NULL
),
-- CTE para mapear identificador de usuário original para user_id
mapped_history AS (
    SELECT
        eh.task_id,
        eh.field_changed,
        eh.old_value,
        eh.new_value,
        u.id AS user_id, -- Ligar ao user_id na tabela users
        eh."timestamp",
        eh.justification
    FROM extracted_history eh
    LEFT JOIN users u ON eh.original_user_identifier = u.id::text OR eh.original_user_identifier = u.email OR lower(eh.original_user_identifier) = lower(u.name) -- Tentar mapear por ID, email ou nome
)
-- Inserir Histórico de Mudanças na nova tabela
INSERT INTO task_change_history (task_id, field_changed, old_value, new_value, user_id, "timestamp", justification)
SELECT
  mh.task_id,
  mh.field_changed,
  mh.old_value,
  mh.new_value,
  mh.user_id,
  mh."timestamp",
  mh.justification
FROM mapped_history mh;


-- ===================================================================
-- 3. Adicionar Chaves Estrangeiras e Restrições (Após Migração)
-- ===================================================================

-- Adicionar FK para statuses(id) na tabela tasks
ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_status
FOREIGN KEY (status_id) REFERENCES statuses(id);

-- Adicionar índice para a nova FK de status
CREATE INDEX idx_tasks_status_id ON tasks(status_id);


-- Adicionar FKs para tasks(id) na tabela task_dependencies
ALTER TABLE task_dependencies
ADD CONSTRAINT fk_task_dependencies_task
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE task_dependencies
ADD CONSTRAINT fk_task_dependencies_depends_on_task
FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE;


-- Adicionar FKs para tasks(id) e custom_fields(id) na tabela task_custom_field_values
ALTER TABLE task_custom_field_values
ADD CONSTRAINT fk_task_custom_field_values_task
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

ALTER TABLE task_custom_field_values
ADD CONSTRAINT fk_task_custom_field_values_custom_field
FOREIGN KEY (custom_field_id) REFERENCES custom_fields(id) ON DELETE CASCADE;


-- Adicionar FK para tasks(id) na tabela task_change_history
ALTER TABLE task_change_history
ADD CONSTRAINT fk_task_change_history_task
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;


-- ===================================================================
-- 4. Limpeza (Opcional, Pode ser Feito em uma Etapa Separada)
-- ===================================================================

-- Após validar a migração E a refatoração do código da aplicação para usar o novo esquema,
-- REMOVER as colunas JSONB antigas da tabela projects.
-- ALTER TABLE projects DROP COLUMN tasks;
-- ALTER TABLE projects DROP COLUMN kpis;
-- ALTER TABLE projects DROP COLUMN configuration;
-- ALTER TABLE projects DROP COLUMN critical_path;


-- Habilitar RLS para as novas tabelas (Políticas RLS específicas serão criadas em outra tarefa)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_change_history ENABLE ROW LEVEL SECURITY;


-- Adicionar triggers para updated_at nas novas tabelas, se necessário (assumindo que a função update_updated_at_column já existe)
-- CREATE TRIGGER update_statuses_updated_at BEFORE UPDATE ON statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_custom_fields_updated_at BEFORE UPDATE ON custom_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_task_custom_field_values_updated_at BEFORE UPDATE ON task_custom_field_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Finalizar a transação
COMMIT;
