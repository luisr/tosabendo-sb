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
  status_id uuid NOT NULL REFERENCES statuses(id),
  name text NOT NULL,
  description text,
  priority text,
  planned_start_date timestamptz NOT NULL,
  planned_end_date timestamptz NOT NULL,
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
CREATE INDEX idx_tasks_status_id ON tasks(status_id);
CREATE INDEX idx_tasks_planned_start_date ON tasks(planned_start_date);
CREATE INDEX idx_tasks_planned_end_date ON tasks(planned_end_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);


-- Criar tabela de dependências de tarefa
CREATE TABLE IF NOT EXISTS task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
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
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  custom_field_id uuid NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(task_id, custom_field_id)
);

-- Adicionar índices na tabela task_custom_field_values
CREATE INDEX idx_task_custom_field_values_task_id ON task_custom_field_values(task_id);
CREATE INDEX idx_task_custom_field_values_custom_field_id ON task_custom_field_values(custom_field_id);


-- Criar tabela de histórico de mudanças de tarefa
CREATE TABLE IF NOT EXISTS task_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  justification text,
  created_at timestamptz DEFAULT now()
);

-- Adicionar índices na tabela task_change_history
CREATE INDEX idx_task_change_history_task_id ON task_change_history(task_id);
CREATE INDEX idx_task_change_history_user_id ON task_change_history(user_id);
CREATE INDEX idx_task_change_history_timestamp ON task_change_history("timestamp");


-- Adicionar triggers para updated_at nas novas tabelas, se necessário (assumindo que a função update_updated_at_column já existe)
-- ALTER TABLE statuses ADD COLUMN updated_at timestamptz DEFAULT now();
-- CREATE TRIGGER update_statuses_updated_at BEFORE UPDATE ON statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ALTER TABLE tasks ADD COLUMN updated_at timestamptz DEFAULT now();
-- CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ALTER TABLE custom_fields ADD COLUMN updated_at timestamptz DEFAULT now();
-- CREATE TRIGGER update_custom_fields_updated_at BEFORE UPDATE ON custom_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ALTER TABLE task_custom_field_values ADD COLUMN updated_at timestamptz DEFAULT now();
-- CREATE TRIGGER update_task_custom_field_values_updated_at BEFORE UPDATE ON task_custom_field_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Habilitar RLS para as novas tabelas (Políticas RLS específicas serão criadas em outra tarefa)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_change_history ENABLE ROW LEVEL SECURITY;
