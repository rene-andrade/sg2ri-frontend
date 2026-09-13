# SG2RI — Sistema de Gestão de Reserva de Recursos e Instalações

Aplicação frontend para gestão e reserva de salas, laboratórios, auditórios e equipamentos de uma instituição de ensino. Projeto acadêmico com fluxo completo de solicitação, aprovação, check-in/check-out e relatórios de ocupação.

## Funcionalidades

- **Autenticação por perfil** — Administrador, Professor e Aluno, cada um com permissões e regras de negócio próprias.
- **Nova Reserva** — assistente em 3 etapas (seleção do recurso → detalhes da reserva → confirmação), com verificação de disponibilidade em tempo real e aceite dos Termos de Responsabilidade.
- **Minhas Reservas** — histórico e acompanhamento das solicitações do usuário logado.
- **Calendário de Disponibilidade** — grade semanal por recurso, com navegação entre semanas e filtro por tipo (Espaço / Equipamento).
- **Gestão de Solicitações** *(Administrador)* — aprovação/recusa de pedidos, check-in e check-out de equipamentos, com identificador único por reserva.
- **Itens Reserváveis** *(Administrador)* — catálogo de salas, laboratórios, auditórios e equipamentos, com status (ativo/manutenção/inativo).
- **Relatórios de Ocupação & Ociosidade** *(Administrador)* — indicadores por período customizável (com atalhos "Esta Semana"/"Este Mês"), distribuição de demanda por turno, detalhamento por recurso e impressão em layout A4.
- **Configurações** — edição do próprio perfil e, para administradores, gestão completa de usuários (CRUD, importação em massa via CSV, ativação/inativação).

### Regras de negócio

- **RN01** — Alunos só podem reservar salas de estudo por no máximo 2 horas consecutivas.
- **RN02** — Professores têm prioridade sobre alunos em recursos audiovisuais/equipamentos: uma solicitação de professor pode ser aceita mesmo com conflito de horário, desde que os conflitos sejam apenas pedidos de alunos ainda pendentes (reservas já aprovadas não são reabertas).
- Reservas de equipamentos eletrônicos exigem no mínimo 24 horas de antecedência.

## Stack Tecnológica

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [React Router DOM v7](https://reactrouter.com/)
- [React Bootstrap](https://react-bootstrap.github.io/) + [Bootstrap 5](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para validação de formulários
- [Axios](https://axios-http.com/) para chamadas HTTP
- [Oxlint](https://oxc.rs/) para lint

## Persistência de dados (mock backend)

Os serviços em `src/services/` tentam primeiro uma chamada HTTP real (`VITE_API_URL`); se a API não responder, os dados caem automaticamente para um mock persistido em `localStorage`. Isso permite rodar e demonstrar o sistema completo sem depender de um backend real.

## Estrutura do Projeto

```
src/
├── components/    # Componentes reutilizáveis (tabelas, modais, formulários, layout)
├── contexts/       # Contextos React (autenticação)
├── hooks/          # Hooks customizados
├── layouts/        # Layouts de página (autenticado / público)
├── pages/          # Telas da aplicação, organizadas por módulo
├── routes/         # Definição de rotas e proteção por perfil
├── services/       # Camada de acesso a dados (API + fallback mock)
└── utils/          # Constantes e helpers (datas, formatação)
```

## Como Executar

### Pré-requisitos

- Node.js 20+

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SG2RI - Sistema de Gestão e Reserva de Instalações
```

Sem uma API respondendo nesse endereço, a aplicação funciona normalmente usando os dados mock em `localStorage`.

### Scripts disponíveis

```bash
npm run dev       # Ambiente de desenvolvimento (Vite)
npm run build     # Build de produção (pasta dist/)
npm run preview   # Pré-visualização local do build de produção
npm run lint      # Lint com Oxlint
```

## Usuários de demonstração

Todos com senha `demo`:

| Perfil        | E-mail                  |
|---------------|--------------------------|
| Administrador | marcos@sg2ri.edu.br      |
| Professor     | helena@sg2ri.edu.br      |
| Aluno         | aluno@sg2ri.edu.br       |

## Deploy

- **Vercel**: o projeto inclui `vercel.json` com rewrite de SPA (necessário para o React Router funcionar em rotas diretas/refresh). Basta importar o repositório na Vercel — framework Vite é detectado automaticamente.
- **Docker**: `Dockerfile` incluso, faz build da aplicação e serve os arquivos estáticos via Nginx (com fallback de SPA configurado).

```bash
docker build -t sg2ri-frontend .
docker run -p 8080:80 sg2ri-frontend
```
