# Backlog de Refatoração: Backend e UI Responsiva

Este documento lista as tarefas e histórias de usuário identificadas para refatorar o backend (migração de JSONB para esquema relacional) e melhorar a responsividade da interface do usuário, com foco inicial nas visualizações de Tabela, Gantt e Kanban.

## Área: Refatoração da Interface do Usuário (UI Responsiva)

**História 1: Melhorar Visualização da Tabela em Telas Pequenas**
*   **Título:** Como usuário mobile, quero que a Tabela de Tarefas seja fácil de visualizar e interagir em telas pequenas, sem rolagem horizontal excessiva.
*   **Descrição:** Atualmente, a Tabela de Tarefas requer rolagem horizontal em telas pequenas para ver todas as colunas, o que prejudica a usabilidade. Precisamos reestruturar o layout para exibir as informações de forma mais amigável em dispositivos móveis.
*   **Critérios de Aceitação:**
    *   Em viewports menores que o breakpoint `lg`, a Tabela de Tarefas deve adotar um layout otimizado para telas pequenas (por exemplo, layout de "card" por tarefa ou reorganização de colunas).
    *   As informações essenciais da tarefa (Nome, Status, Responsável, Prioridade, Progresso) devem ser facilmente visíveis sem rolagem horizontal.
    *   A rolagem principal na lista de tarefas deve ser vertical.
    *   A funcionalidade de expandir/colapsar subtarefas deve continuar funcionando.
*   **Responsável Sugerido:** Dev

**História 2: Otimizar Exibição de Detalhes da Tarefa em Telas Pequenas**
*   **Título:** Como usuário mobile, quero que os detalhes completos da tarefa (incluindo campos customizados e ações) sejam facilmente acessíveis em telas pequenas.
*   **Descrição:** Com a reestruturação da tabela em telas pequenas, precisamos garantir que todas as informações e ações da tarefa que estavam nas colunas (como datas, horas, CPI/SPI, ações de edição/exclusão) ainda estejam disponíveis de forma intuitiva.
*   **Critérios de Aceitação:**
    *   Em telas pequenas, todos os campos da tarefa (padrão e customizados) devem ser exibidos de forma clara dentro do layout responsivo (por exemplo, dentro do "card" da tarefa ou em uma seção de detalhes expansível).
    *   As ações de edição e exclusão da tarefa devem ser facilmente acessíveis em telas pequenas (por exemplo, em um menu de contexto dentro do item da tarefa).
    *   A informação do CPI/SPI, se visível, deve ser apresentada de forma legível.
*   **Responsável Sugerido:** Dev

**História 3: Ajustar Barra de Ferramentas da Tabela para Responsividade**
*   **Título:** Como usuário mobile, quero que a barra de ferramentas da Tabela de Tarefas se ajuste bem a telas pequenas.
*   **Descrição:** A barra de ferramentas acima da tabela (com filtros, ações em massa, opções de colunas) pode transbordar em telas pequenas.
*   **Critérios de Aceitação:**
    *   Em telas pequenas, os elementos da barra de ferramentas (botões, dropdowns) devem se reorganizar ou se adaptar para caber na largura da tela sem transbordar.
    *   A funcionalidade de seleção em massa e as ações em massa devem ser utilizáveis em telas pequenas.
    *   O dropdown de seleção de colunas deve funcionar corretamente em telas pequenas.
*   **Responsável Sugerido:** Dev

**História 4: Otimizar Visualização do Gráfico de Gantt em Telas Pequenas**
*   **Título:** Como usuário mobile, quero visualizar o cronograma do projeto no Gráfico de Gantt de forma clara e utilizável em telas pequenas.
*   **Descrição:** O Gráfico de Gantt atual requer rolagem horizontal extensa em dispositivos móveis devido ao seu layout horizontal baseado em tempo e larguras fixas. Precisamos encontrar uma maneira de apresentar as informações essenciais do cronograma de forma mais acessível em telas pequenas.
*   **Critérios de Aceitação:**
    *   Em viewports menores que o breakpoint `lg`, o Gráfico de Gantt deve adotar um layout otimizado para telas pequenas (por exemplo, uma visão simplificada, empilhamento vertical de informações, ou uma rolagem horizontal aprimorada).
    *   As datas de início e fim das tarefas principais devem ser facilmente identificáveis.
    *   A relação pai-filho das tarefas deve ser clara na visualização móvel.
    *   A linha do "Hoje" deve ser visível ou facilmente localizável na visualização móvel.
    *   (Opcional, dependendo da estratégia) Se as linhas de dependência forem mostradas, elas devem ser compreensíveis.
*   **Responsável Sugerido:** Dev

**História 5: Melhorar a Legibilidade dos Elementos do Gantt em Telas Pequenas**
*   **Título:** Como usuário mobile, quero que os elementos visuais do Gráfico de Gantt (barras, nomes de tarefa, datas) sejam legíveis em telas pequenas.
*   **Descrição:** A densidade e o tamanho dos elementos no Gráfico de Gantt podem dificultar a leitura em dispositivos móveis.
*   **Critérios de Aceitação:**
    *   Os nomes das tarefas e as datas exibidas devem ser legíveis mesmo quando o gráfico estiver estreito ou os elementos reduzidos.
    *   As barras de tarefa e de linha de base devem ter um tamanho mínimo utilizável e ser visualmente distintas.
    *   Os tooltips que aparecem ao interagir com as barras devem ser formatados para caber em telas menores.
*   **Responsável Sugerido:** Dev

**História 6: Ajustar Controles do Gantt para Responsividade**
*   **Título:** Como usuário, quero que os controles do Gráfico de Gantt (zoom, linha de base, ações) se ajustem bem a diferentes tamanhos de tela.
*   **Descrição:** Os controles no cabeçalho do Gantt podem não ser responsivos.
*   **Critérios de Aceitação:**
    *   Em telas pequenas, os controles (Select de zoom, botões, View Actions) devem se reorganizar ou se adaptar para caber na largura da tela sem transbordar.
    *   As funcionalidades de salvar e excluir linha de base e as View Actions devem ser acessíveis em telas pequenas.
*   **Responsável Sugerido:** Dev

**História 7: Empilhar Colunas do Kanban em Telas Pequenas**
*   **Título:** Como usuário mobile, quero que as colunas do Kanban View se empilhem verticalmente para facilitar a visualização e a navegação em telas pequenas.
*   **Descrição:** Atualmente, as colunas do Kanban View ficam lado a lado com largura fixa, exigindo rolagem horizontal em dispositivos móveis. Precisamos mudar o layout para que as colunas sejam exibidas uma abaixo da outra em telas pequenas.
*   **Critérios de Aceitação:**
    *   Em viewports menores que o breakpoint `lg`, as colunas do Kanban devem ser exibidas verticalmente, uma abaixo da outra.
    *   Cada coluna empilhada deve ocupar a largura total disponível do contêiner pai.
    *   A rolagem principal na Visualização Kanban deve ser vertical para navegar entre as colunas.
    *   A barra de scroll horizontal original deve ser removida ou ocultada em telas pequenas.
*   **Responsável Sugerido:** Dev

**História 8: Manter Funcionalidade de Drag and Drop no Kanban Responsivo**
*   **Título:** Como usuário, quero poder arrastar e soltar tarefas entre as colunas do Kanban, mesmo quando as colunas estiverem empilhadas em telas pequenas.
*   **Descrição:** A funcionalidade de arrastar e soltar é essencial para o Kanban. Precisamos garantir que ela funcione corretamente no layout responsivo empilhado.
*   **Critérios de Aceitação:**
    *   A funcionalidade de arrastar tarefas entre as colunas deve funcionar perfeitamente no layout empilhado em telas pequenas.
    *   Indicadores visuais claros devem mostrar onde a tarefa está sendo arrastada e onde ela será solta.
    *   A interação de drag and drop deve ser otimizada para toque em dispositivos móveis.
*   **Responsável Sugerido:** Dev

**História 9: Ajustar Layout dos Cards de Tarefa no Kanban Responsivo**
*   **Título:** Como usuário, quero que os cards de tarefa dentro das colunas do Kanban sejam bem formatados e legíveis em telas pequenas.
*   **Descrição:** Com o ajuste na largura das colunas empilhadas, precisamos garantir que o conteúdo dos cards de tarefa (nome, prioridade, responsável) se ajuste bem.
*   **Critérios de Aceitação:**
    *   Os elementos dentro dos cards de tarefa (nome, prioridade, avatar) devem se ajustar bem à largura disponível nas colunas empilhadas.
    *   Nomes de tarefas longos devem ser manuseados de forma adequada (quebra de linha ou truncamento com tooltip).
    *   O espaçamento e o alinhamento dentro dos cards devem ser consistentes e fáceis de ler.
*   **Responsável Sugerido:** Dev

## Área: Refatoração de Backend (Esquema Relacional e Migração)

**Tarefa Técnica 101: Implementar Novo Esquema Relacional para Tarefas e Relações**
*   **Descrição:** Criar as novas tabelas (`tasks`, `task_dependencies`, `statuses`, `custom_fields`, `task_custom_field_values`, `task_change_history`) no banco de dados com as colunas, tipos, chaves primárias/estrangeiras e regras `ON DELETE` conforme o design consolidado. Adicionar índices apropriados.
*   **Critérios de Aceitação:** As novas tabelas devem ser criadas no banco de dados. As chaves e relacionamentos devem estar configurados corretamente. Índices devem ser adicionados nas colunas chave.
*   **Responsável Sugerido:** Dev/Architect

**Tarefa Técnica 102: Desenvolver Script de Migração de Dados JSONB para Relacional**
*   **Descrição:** Escrever e testar um script (SQL ou de aplicação) para ler os dados de tarefas, dependências, responsáveis, campos customizados e histórico dos campos JSONB na tabela `projects` e inseri-los nas novas tabelas relacionais.
*   **Critérios de Aceitação:** O script deve ser capaz de ser executado em um ambiente de teste. Todos os dados relevantes dos campos JSONB devem ser migrados corretamente para as novas tabelas. Relacionamentos (pai-filho, dependências, responsável, valores de campo customizado) devem ser preservados usando os novos UUIDs.
*   **Responsável Sugerido:** Dev

**Tarefa Técnica 103: Planejar e Executar Migração de Dados em Produção**
*   **Descrição:** Definir o plano de execução da migração de dados em um ambiente de produção, incluindo backups, comunicação de downtime (se necessário), execução do script de migração e validação pós-migração.
*   **Critérios de Aceitação:** Um plano de execução detalhado deve ser documentado. A migração deve ser executada com sucesso em um ambiente de produção (ou staging que replique produção). Os dados migrados devem ser validados.
*   **Responsável Sugerido:** DevOps/Dev/Architect (tarefa de execução que cruza papéis)

**Tarefa Técnica 104: Remover Colunas JSONB Antigas após Migração**
*   **Descrição:** Após a validação completa da migração e da refatoração do código, remover os campos JSONB (`tasks`, `kpis`, `configuration`, `critical_path`) da tabela `projects` para liberar espaço e evitar confusão.
*   **Critérios de Aceitação:** As colunas JSONB especificadas devem ser removidas da tabela `projects`.
*   **Responsável Sugerido:** Dev/Architect

**Tarefa Técnica 201: Refatorar Funções de Leitura de Tarefas para Novo Esquema**
*   **Descrição:** Modificar as funções de backend que buscam dados de tarefas (`getProjects`, `getProject`, possivelmente novas funções) para consultar as novas tabelas relacionais (`tasks`, `task_dependencies`, `task_assignees` ou `users` via `assignee_id`, `statuses`, `task_custom_field_values`) usando JOINs. Implementar a lógica para estruturar os dados (aninhar subtarefas, incluir responsáveis, etc.) no formato que o frontend espera.
*   **Critérios de Aceitação:** As funções devem retornar os dados de tarefa e seus relacionamentos corretamente a partir do novo esquema relacional. As consultas devem ser otimizadas com índices. Testes de unidade/integração para essas funções devem passar.
*   **Responsável Sugerido:** Dev

**Tarefa Técnica 202: Refatorar Funções de Escrita de Tarefas para Novo Esquema**
*   **Descrição:** Criar ou modificar as funções de backend para criar, atualizar e excluir tarefas, dependências, valores de campo customizado e entradas no histórico de mudanças, interagindo com as novas tabelas relacionais.
*   **Critérios de Aceitação:** Funções para operações de CRUD em tarefas, dependências, valores de campo customizado e histórico devem ser implementadas e testadas. A integridade referencial garantida pelo banco de dados deve ser utilizada. Testes de unidade/integração para essas funções devem passar.
*   **Responsável Sugerido:** Dev

**Tarefa Técnica 203: Refatorar Lógica de Negócios baseada em Tarefas**
*   **Descrição:** Identificar e refatorar qualquer lógica de negócios existente (`src/lib/`) que dependa diretamente dos campos JSONB das tarefas para usar as novas APIs de backend ou consultar o novo esquema relacional. Incluir a adaptação de cálculos de KPI e lógica de caminho crítico.
*   **Critérios de Aceitação:** A lógica de negócios refatorada deve operar corretamente com os dados do novo esquema. Cálculos e processos dependentes de dados de tarefa devem funcionar conforme o esperado.
*   **Responsável Sugerido:** Dev

**Tarefa Técnica 204: Melhorar Tratamento de Erros do Backend**
*   **Descrição:** Implementar um tratamento de erros mais robusto e consistente no backend, especialmente para interações com o banco de dados, incluindo logging detalhado e mascaramento de detalhes sensíveis em respostas ao frontend.
*   **Critérios de Aceitação:** O tratamento de erros deve ser consistente em todo o backend. Logs de erro devem ser informativos. Respostas de erro ao frontend devem ser seguras e úteis.
*   **Responsável Sugerido:** Dev

**Tarefa Técnica 205: Remover Super Admin Hardcoded**
*   **Descrição:** Remover o usuário super admin hardcoded na função `getUsers` e implementar um mecanismo seguro para gerenciar usuários administrativos (por exemplo, via painel admin seguro ou configuração de ambiente).
*   **Critérios de Aceitação:** O super admin hardcoded não deve mais existir no código. O gerenciamento de usuários admin deve ser feito de forma segura.
*   **Responsável Sugerido:** Dev/Architect (aspectos de segurança)

**Tarefa Técnica 206: Otimizar Atualização de Membros da Equipe (`project_team`)**
*   **Descrição:** Refatorar a lógica de atualização da equipe do projeto para não usar "delete then insert", mas sim identificar membros adicionados, removidos e roles modificadas, aplicando operações de INSERT/UPDATE/DELETE específicas.
*   **Critérios de Aceitação:** A atualização da equipe deve ser mais eficiente, realizando apenas as operações necessárias no banco de dados.
*   **Responsável Sugerido:** Dev

**Tarefa Técnica 207: Revisar e Fortalecer Políticas de RLS no Supabase**
*   **Descrição:** Realizar uma revisão detalhada das políticas de Row Level Security para todas as tabelas (existentes e novas) para garantir que as regras de acesso são seguras e cobrem todos os casos de uso de CRUD necessários para as diferentes roles de usuário (`Admin`, `Manager`, `Editor`, `Viewer`).
*   **Critérios de Aceitação:** Políticas de RLS devem estar definidas para todas as operações (SELECT, INSERT, UPDATE, DELETE) em todas as tabelas. Testes de segurança (tentativas de acesso não autorizado) devem falhar.
*   **Responsável Sugerido:** Architect/Dev (colaboração)

---

Este documento serve como o backlog inicial para as tarefas de refatoração do backend e melhorias de responsividade da UI. As tarefas devem ser priorizadas pela equipe do projeto para planejamento e execução nos próximos sprints.