# PRD Técnico — flex9pag
**Versão:** 1.0  
**Data:** Abril 2026  
**Autor:** William Cintra / FLEX9 TECNOLOGIA  
**Status:** V1 em produção (flex9pag.vercel.app)

---

## Sumário

1. [Stack e Versões](#1-stack-e-versoes)
2. [Arquitetura](#2-arquitetura)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Schema do Banco de Dados](#4-schema-do-banco-de-dados)
5. [Padrões de Código](#5-padroes-de-codigo)
6. [API Routes](#6-api-routes)
7. [Autenticação e Autorização](#7-autenticacao-e-autorizacao)
8. [Integrações Externas](#8-integracoes-externas)
9. [Convenções](#9-convencoes)
10. [Deploy e CI](#10-deploy-e-ci)
11. [Pendências Técnicas](#11-pendencias-tecnicas)
12. [Decisões de Arquitetura (ADRs)](#12-decisoes-de-arquitetura-adrs)

---

## 1. Stack e Versões

### 1.1 Dependências de Produção

| Pacote | Versão | Justificativa |
|---|---|---|
| `next` | 16.2.2 | Framework React com App Router, SSR nativo, route handlers |
| `react` | 19.2.4 | Servidor de componentes, concurrent features |
| `react-dom` | 19.2.4 | Par obrigatório do React 19 |
| `@supabase/supabase-js` | ^2.102.1 | Client oficial Supabase — Auth, Realtime, PostgREST |
| `@supabase/ssr` | ^0.10.0 | Utilitários SSR para Next.js (createServerClient, cookies) |
| `@tanstack/react-query` | ^5.96.2 | Cache de dados client-side, invalidação reativa |
| `react-hook-form` | ^7.72.1 | Forms performáticos sem re-renders desnecessários |
| `@hookform/resolvers` | ^5.2.2 | Integração react-hook-form + Zod |
| `zod` | ^4.3.6 | Validação de schemas em forms e API routes |
| `mercadopago` | ^2.12.0 | SDK oficial MP — Preference API, Payment API |
| `stripe` | ^22.0.0 | SDK Stripe — placeholder V1.5 |
| `qrcode.react` | ^4.2.0 | QR Code — usar named export `QRCodeCanvas` |
| `react-imask` | ^7.6.1 | Máscaras de input (CPF, CNPJ, telefone, valor) |
| `sonner` | ^2.0.7 | Toasts — configurado com `richColors position="top-center"` |
| `lucide-react` | ^1.7.0 | Ícones — SVG otimizados, tree-shaking por ícone |
| `recharts` | ^3.8.1 | Gráficos (declaração anual, V2) |
| `shadcn` | ^4.2.0 | CLI de componentes shadcn/ui |
| `@base-ui/react` | ^1.3.0 | Primitivos de UI acessíveis (dialogs, sheets) |
| `class-variance-authority` | ^0.7.1 | Variantes de componentes type-safe |
| `clsx` | ^2.1.1 | Concatenação de classNames |
| `tailwind-merge` | ^3.5.0 | Merge de classes Tailwind sem conflitos |
| `next-themes` | ^0.4.6 | Dark mode (implementação futura) |
| `tw-animate-css` | ^1.4.0 | Animações CSS prontas para Tailwind 4 |

### 1.2 Dependências de Desenvolvimento

| Pacote | Versão | Função |
|---|---|---|
| `typescript` | ^5 | Tipagem estática — strict mode |
| `tailwindcss` | ^4 | CSS utility-first — v4 com config via CSS vars |
| `@tailwindcss/postcss` | ^4 | Plugin PostCSS para Tailwind 4 |
| `eslint` | ^9 | Linting — flat config (eslint.config.mjs) |
| `eslint-config-next` | 16.2.2 | Regras específicas Next.js |
| `@types/node` | ^20 | Tipos Node.js |
| `@types/react` | ^19 | Tipos React 19 |
| `@types/react-dom` | ^19 | Tipos React DOM 19 |

### 1.3 Serviços Externos

| Serviço | URL | Plano | Uso |
|---|---|---|---|
| Supabase | rdsodagjhlmdxouzuimc.supabase.co | Free → Pro quando necessário | DB, Auth, RLS |
| Mercado Pago | api.mercadopago.com | Produção | Preferências, pagamentos, webhooks |
| Stripe | api.stripe.com | Test → Live | V1.5 — links de pagamento |
| Focus NFe | focusnfe.com.br | Produção | Emissão NFS-e (~R$0,65/nota) |
| Vercel | vercel.com | Hobby → Pro | Deploy, Edge Network, Logs |

---

## 2. Arquitetura

### 2.1 Diagrama ASCII

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
│  React 19 + Next.js 16 App Router                           │
│  TanStack Query (cache) + React Hook Form + shadcn/ui        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE                              │
│                                                              │
│  proxy.ts (renomeado de middleware.ts)                       │
│  ├── Verifica sessão Supabase (cookie)                       │
│  ├── Redireciona /login se não autenticado                   │
│  └── Verifica role='admin' para /admin/*                     │
│                                                              │
│  Server Components (SSR)                                     │
│  ├── /inicio → page.tsx (busca inicial via supabase/server)  │
│  ├── /admin  → page.tsx (query sem RLS via service_role)     │
│  └── demais  → layout.tsx + Client Components                │
│                                                              │
│  Route Handlers (API Routes)                                 │
│  ├── POST /api/payment-links  (cria Preference MP)           │
│  └── POST /api/webhooks/mercadopago (processa pagamentos)    │
└───────────┬────────────────────────┬────────────────────────┘
            │                        │
            ▼                        ▼
┌───────────────────┐    ┌───────────────────────────────────┐
│   SUPABASE        │    │        MERCADO PAGO                │
│                   │    │                                    │
│  PostgreSQL 15    │    │  Preference API (criar link)       │
│  ├── profiles     │    │  Payment API (verificar status)    │
│  ├── clients      │    │  Webhooks (notificação pagamento)  │
│  ├── services     │    └───────────────────────────────────┘
│  ├── payment_links│
│  ├── nfse_invoices│    ┌───────────────────────────────────┐
│  ├── das_payments │    │        FOCUS NFE (V1.5)            │
│  ├── plans        │    │                                    │
│  ├── subscriptions│    │  POST /nfse (emitir nota)          │
│  ├── webhook_events    │  GET  /nfse/:ref (status)          │
│  └── admin_actions│    │  DELETE /nfse/:ref (cancelar)      │
│                   │    └───────────────────────────────────┘
│  Auth (Magic Link │
│  + Google OAuth)  │    ┌───────────────────────────────────┐
│                   │    │        STRIPE (V1.5)               │
│  RLS em todas as  │    │                                    │
│  tabelas (exceto  │    │  Payment Links API                 │
│  webhook_events)  │    │  Webhooks                          │
└───────────────────┘    └───────────────────────────────────┘
```

### 2.2 Fluxo de Dados — Criação de Link de Pagamento

```
Browser                   Vercel                  MP API          Supabase
  │                          │                       │               │
  │── POST /api/payment-links ──►                    │               │
  │   { service_id, amount,  │                       │               │
  │     description, gateway }                        │               │
  │                          │── getUser() ──────────────────────►  │
  │                          │◄─ user ───────────────────────────── │
  │                          │── SELECT profiles ────────────────►  │
  │                          │◄─ mercadopago_access_token ───────── │
  │                          │                       │               │
  │                          │── POST /checkout/preferences ──────►  │
  │                          │◄─ { id, init_point } ──────────────  │
  │                          │                       │               │
  │                          │── INSERT payment_links ────────────►  │
  │                          │── UPDATE services ─────────────────►  │
  │                          │◄─ ok ──────────────────────────────── │
  │                          │                       │               │
  │◄── { url, payment_link_id } ──                   │               │
  │                          │                       │               │
  │ [cliente paga]           │                       │               │
  │                          │◄── POST webhook ───────              │
  │                          │── GET /v1/payments/:id ─────────────►  │
  │                          │◄─ { status: 'approved' } ───────────  │
  │                          │── UPDATE payment_links ─────────────►  │
  │                          │── UPDATE services ─────────────────►  │
  │                          │── UPDATE webhook_events ───────────►  │
```

### 2.3 Estratégia de Renderização

| Rota | Estratégia | Motivo |
|---|---|---|
| `/login` | Static + CSR | Sem dados do usuário necessários |
| `/inicio` | SSR (Server Component) | Dados críticos na primeira paint |
| `/servicos` | CSR (Client Component + TanStack Query) | Filtros dinâmicos, atualizações frequentes |
| `/cobrar` | SSR shell + CSR form | Params de URL via `searchParams` |
| `/das` | CSR (TanStack Query) | Lista estática com ações |
| `/configuracoes` | CSR | Formulário interativo |
| `/admin` | SSR | Dados agregados, sem estado client |
| `/api/*` | Route Handler (Edge) | Sem serialização de Response custom |

---

## 3. Estrutura de Pastas

```
flex9pag/
├── app/
│   ├── layout.tsx                    # Root layout: Inter font, Toaster, QueryProvider
│   ├── page.tsx                      # / → redirect via proxy.ts
│   ├── globals.css                   # Tailwind 4 base + CSS vars (tokens de design)
│   ├── favicon.ico
│   │
│   ├── (public)/                     # Route group sem autenticação
│   │   └── login/
│   │       └── page.tsx              # Magic Link + Google OAuth
│   │
│   ├── (app)/                        # Route group com autenticação (proxy.ts)
│   │   ├── layout.tsx                # AppLayout com BottomNav
│   │   ├── inicio/
│   │   │   └── page.tsx              # Dashboard SSR
│   │   ├── servicos/
│   │   │   ├── page.tsx              # Lista de serviços (CSR)
│   │   │   ├── novo/
│   │   │   │   └── page.tsx          # Formulário novo serviço
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Detalhe do serviço (sheet)
│   │   ├── clientes/
│   │   │   ├── page.tsx              # Lista de clientes
│   │   │   └── novo/
│   │   │       └── page.tsx          # Formulário novo cliente
│   │   ├── cobrar/
│   │   │   └── page.tsx              # Gerador de link (query params)
│   │   ├── das/
│   │   │   └── page.tsx              # Grid 12 meses DAS
│   │   ├── configuracoes/
│   │   │   └── page.tsx              # Perfil MEI + configurações
│   │   ├── notas/                    # NFS-e emitidas (V1.5)
│   │   │   └── page.tsx
│   │   └── onboarding/               # Wizard de boas-vindas (V1.5)
│   │       └── page.tsx
│   │
│   ├── (admin)/                      # Route group admin (role check em proxy.ts)
│   │   └── admin/
│   │       ├── layout.tsx            # AdminLayout (sidebar)
│   │       ├── page.tsx              # Dashboard admin (MRR, métricas)
│   │       ├── usuarios/
│   │       │   └── page.tsx          # Lista usuários + ações
│   │       ├── planos/
│   │       │   └── page.tsx          # Visualização de planos
│   │       └── assinaturas/
│   │           └── page.tsx          # Gestão de assinaturas
│   │
│   ├── api/
│   │   ├── payment-links/
│   │   │   └── route.ts              # POST — cria Preference MP ou Stripe
│   │   ├── nfse/                     # V1.5
│   │   │   └── route.ts              # POST — emite NFS-e via Focus NFe
│   │   └── webhooks/
│   │       ├── mercadopago/
│   │       │   └── route.ts          # POST — processa pagamentos MP
│   │       └── stripe/               # V1.5
│   │           └── route.ts
│   │
│   ├── supabase/                     # Supabase auth callbacks
│   │   └── callback/
│   │       └── route.ts              # GET — troca code por sessão (OAuth)
│   │
│   ├── types.ts                      # Tipos globais do app (duplicata de lib/types.ts — deprecar)
│   └── utils.ts                      # Utils globais (duplicata de lib/utils.ts — deprecar)
│
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx             # Nav inferior mobile (4 itens)
│   │   └── TopBar.tsx                # Header com título + back button
│   ├── dashboard/
│   │   └── DashboardContent.tsx      # Cartões de receita + alerta DAS
│   ├── servicos/                     # Componentes de serviços
│   ├── clientes/                     # Componentes de clientes
│   ├── payment-links/
│   │   └── CobrarForm.tsx            # Formulário de cobrança + QR Code
│   ├── das/                          # Componentes DAS
│   ├── configuracoes/                # Componentes de configurações
│   ├── admin/                        # Componentes admin
│   ├── nfse/                         # Componentes NFS-e (V1.5)
│   ├── onboarding/                   # Componentes onboarding (V1.5)
│   ├── shared/                       # Componentes compartilhados
│   └── ui/                           # shadcn/ui components
│       ├── alert-dialog.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient — uso em Client Components
│   │   └── server.ts                 # createClient() async — uso em Server Components e Route Handlers
│   ├── types.ts                      # Todos os tipos TypeScript do domínio
│   └── utils.ts                      # Utilitários: formatCurrency, formatDate, validações, constantes
│
├── providers/
│   └── QueryProvider.tsx             # QueryClientProvider com defaultOptions
│
├── supabase/
│   └── migrations/
│       ├── 001_create_profiles.sql
│       ├── 002_create_clients.sql
│       ├── 003_create_services.sql
│       ├── 004_create_payment_links.sql
│       ├── 005_create_nfse_invoices.sql
│       ├── 006_create_das_payments.sql
│       ├── 007_create_webhook_events.sql
│       ├── 008_add_foreign_keys_services.sql
│       ├── 009_create_plans_subscriptions.sql
│       ├── 010_seed_plans.sql
│       ├── 011_create_triggers.sql
│       ├── 012_seed_das_function.sql
│       └── FULL_SCHEMA.sql           # Schema consolidado para execução única
│
├── hooks/                            # Custom hooks (React hooks)
├── public/                           # Arquivos estáticos
├── proxy.ts                          # Auth middleware (renomeado de middleware.ts)
├── next.config.ts                    # Configuração Next.js
├── tsconfig.json                     # TypeScript strict mode
├── eslint.config.mjs                 # ESLint flat config
├── postcss.config.mjs                # PostCSS com @tailwindcss/postcss
├── components.json                   # Config shadcn/ui
└── package.json
```

### 3.1 Convenção de Route Groups

| Group | Path | Proteção |
|---|---|---|
| `(public)` | `/login`, `/cadastro`, `/pagar/:id` | Sem auth |
| `(app)` | `/inicio`, `/servicos`, `/clientes`, etc. | Auth obrigatória via proxy.ts |
| `(admin)` | `/admin/*` | Auth + role = 'admin' via proxy.ts |

---

## 4. Schema do Banco de Dados

**Projeto Supabase:** `rdsodagjhlmdxouzuimc.supabase.co`  
**Extensão:** `pgcrypto` (para `gen_random_uuid()`)

### 4.1 Tabela: `profiles`

Dados do MEI — 1:1 com `auth.users`.

```sql
CREATE TABLE profiles (
  id                        uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                 text        NOT NULL DEFAULT '',
  cpf                       text,                          -- formato: 000.000.000-00 (armazenado limpo)
  cnpj                      text,                          -- formato: 00.000.000/0000-00 (armazenado limpo)
  mei_name                  text,                          -- nome fantasia do MEI
  phone                     text,                          -- formato: (00) 00000-0000
  service_description       text,                          -- descrição padrão do serviço (NFS-e)
  cnae_code                 text,                          -- código CNAE principal
  city                      text,
  state                     char(2),                       -- UF: SP, RJ, MG, etc.
  role                      text        NOT NULL DEFAULT 'user',
  nfse_provider             text,                          -- 'focusnfe' | 'nfeio' | 'enotas'
  nfse_credentials          jsonb,                         -- { api_key: '...' }
  mercadopago_access_token  text,                          -- token pessoal MP do MEI
  stripe_account_id         text,                          -- connect account Stripe (V1.5)
  payment_gateway           text,                          -- 'mercadopago' | 'stripe' | 'both'
  das_day                   smallint    NOT NULL DEFAULT 20,
  onboarding_completed      boolean     NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_role_check    CHECK (role IN ('user', 'admin')),
  CONSTRAINT profiles_gateway_check CHECK (
    payment_gateway IN ('mercadopago', 'stripe', 'both') OR payment_gateway IS NULL
  )
);
```

**RLS:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (id = auth.uid());
```

**Trigger de criação automática:**
```sql
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

---

### 4.2 Tabela: `clients`

Clientes do MEI.

```sql
CREATE TABLE clients (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  document      text,                    -- CPF ou CNPJ (dígitos apenas)
  document_type text        CHECK (document_type IN ('cpf', 'cnpj')),
  email         text,
  phone         text,
  city          text,
  state         char(2),
  address       text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_user_id   ON clients(user_id);
CREATE INDEX idx_clients_user_name ON clients(user_id, name);
```

**RLS:**
```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_own" ON clients FOR ALL USING (user_id = auth.uid());
```

---

### 4.3 Tabela: `services`

Tabela central — registros de serviços prestados (receitas do MEI).

```sql
CREATE TABLE services (
  id                    uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id             uuid         REFERENCES clients(id) ON DELETE SET NULL,
  client_name_snapshot  text         NOT NULL DEFAULT '',  -- sempre salvo para integridade histórica
  description           text         NOT NULL,
  service_date          date         NOT NULL,
  amount                numeric(12,2) NOT NULL,
  status                text         NOT NULL DEFAULT 'pending',
  paid_at               timestamptz,
  payment_method        text,                              -- método de pagamento confirmado
  notes                 text,
  nfse_id               uuid,                              -- FK para nfse_invoices (circular, adicionada depois)
  payment_link_id       uuid,                              -- FK para payment_links (circular)
  created_at            timestamptz  NOT NULL DEFAULT now(),
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT services_status_check CHECK (status IN ('pending', 'paid', 'cancelled')),
  CONSTRAINT services_payment_method_check CHECK (
    payment_method IN ('pix', 'boleto', 'credit_card', 'transfer', 'cash', 'other')
    OR payment_method IS NULL
  )
);

CREATE INDEX idx_services_user_id     ON services(user_id);
CREATE INDEX idx_services_user_date   ON services(user_id, service_date DESC);
CREATE INDEX idx_services_user_status ON services(user_id, status);
```

**FKs circulares (adicionadas em migration 008):**
```sql
ALTER TABLE services
  ADD CONSTRAINT fk_services_nfse         FOREIGN KEY (nfse_id)         REFERENCES nfse_invoices(id) ON DELETE SET NULL;
ALTER TABLE services
  ADD CONSTRAINT fk_services_payment_link FOREIGN KEY (payment_link_id) REFERENCES payment_links(id)  ON DELETE SET NULL;
```

**RLS:**
```sql
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_own" ON services FOR ALL USING (user_id = auth.uid());
```

---

### 4.4 Tabela: `payment_links`

Links de pagamento gerados via MP ou Stripe.

```sql
CREATE TABLE payment_links (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id        uuid         REFERENCES services(id) ON DELETE SET NULL,
  client_id         uuid         REFERENCES clients(id)  ON DELETE SET NULL,
  gateway           text         NOT NULL,                -- 'mercadopago' | 'stripe'
  external_id       text,                                 -- ID da Preference MP ou PaymentIntent Stripe
  amount            numeric(12,2) NOT NULL,
  description       text         NOT NULL,
  url               text         NOT NULL,                -- init_point MP ou URL Stripe
  status            text         NOT NULL DEFAULT 'active',
  paid_at           timestamptz,
  expires_at        timestamptz,                          -- 7 dias após criação (MP)
  gateway_metadata  jsonb,                                -- payload completo do gateway
  created_at        timestamptz  NOT NULL DEFAULT now(),
  updated_at        timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT payment_links_gateway_check CHECK (gateway IN ('mercadopago', 'stripe')),
  CONSTRAINT payment_links_status_check  CHECK (status  IN ('active', 'paid', 'expired', 'cancelled'))
);

CREATE INDEX idx_payment_links_user_id     ON payment_links(user_id);
CREATE INDEX idx_payment_links_external_id ON payment_links(external_id);
```

**RLS:**
```sql
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_links_own" ON payment_links FOR ALL USING (user_id = auth.uid());
```

---

### 4.5 Tabela: `nfse_invoices`

Notas Fiscais de Serviço Eletrônicas emitidas.

```sql
CREATE TABLE nfse_invoices (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id          uuid         REFERENCES services(id)  ON DELETE SET NULL,
  client_id           uuid         REFERENCES clients(id)   ON DELETE SET NULL,
  provider            text         NOT NULL DEFAULT 'focusnfe',
  external_id         text,                           -- referência no provedor NFe
  protocol_number     text,                           -- número do protocolo municipal
  nfse_number         text,                           -- número da NFS-e
  amount              numeric(12,2) NOT NULL,
  service_description text         NOT NULL,
  iss_amount          numeric(12,2),                  -- valor do ISS retido
  status              text         NOT NULL DEFAULT 'processing',
  pdf_url             text,
  xml_url             text,
  issued_at           timestamptz,
  error_message       text,
  raw_response        jsonb,                          -- resposta completa do provedor
  created_at          timestamptz  NOT NULL DEFAULT now(),
  updated_at          timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT nfse_status_check CHECK (status IN ('processing', 'issued', 'error', 'cancelled'))
);

CREATE INDEX idx_nfse_user_id     ON nfse_invoices(user_id);
CREATE INDEX idx_nfse_external_id ON nfse_invoices(external_id);
```

**RLS:**
```sql
ALTER TABLE nfse_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nfse_invoices_own" ON nfse_invoices FOR ALL USING (user_id = auth.uid());
```

---

### 4.6 Tabela: `das_payments`

Controle das guias DAS mensais.

```sql
CREATE TABLE das_payments (
  id                uuid       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid       NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competence_month  date       NOT NULL,            -- sempre dia 01 do mês: 2026-01-01
  amount            numeric(8,2),                   -- null se valor ainda não definido
  due_date          date       NOT NULL,            -- dia 20 do mês seguinte
  status            text       NOT NULL DEFAULT 'pending',
  paid_at           date,
  receipt_url       text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT das_status_check CHECK (status IN ('pending', 'paid', 'overdue')),
  UNIQUE (user_id, competence_month)                -- uma guia por mês por usuário
);

CREATE INDEX idx_das_user_id ON das_payments(user_id);
```

**Função de seed:**
```sql
CREATE OR REPLACE FUNCTION seed_das_for_user(p_user_id uuid)
RETURNS void AS $$
DECLARE
  current_year int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  m int;
  competence date;
  due date;
BEGIN
  FOR m IN 1..12 LOOP
    competence := make_date(current_year, m, 1);
    due := make_date(
      EXTRACT(YEAR FROM (competence + INTERVAL '1 month'))::int,
      EXTRACT(MONTH FROM (competence + INTERVAL '1 month'))::int,
      20
    );
    INSERT INTO das_payments (user_id, competence_month, due_date, amount, status)
    VALUES (
      p_user_id, competence, due, 75.60,
      CASE WHEN due < CURRENT_DATE THEN 'overdue' ELSE 'pending' END
    )
    ON CONFLICT (user_id, competence_month) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**RLS:**
```sql
ALTER TABLE das_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "das_payments_own" ON das_payments FOR ALL USING (user_id = auth.uid());
```

---

### 4.7 Tabela: `webhook_events`

Fila idempotente para eventos de gateways.

```sql
CREATE TABLE webhook_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway       text        NOT NULL,             -- 'mercadopago' | 'stripe'
  event_type    text        NOT NULL,             -- tipo do evento (ex: 'payment')
  external_id   text        NOT NULL,             -- ID único do evento no gateway
  payload       jsonb       NOT NULL,             -- corpo completo do webhook
  processed     boolean     NOT NULL DEFAULT false,
  processed_at  timestamptz,
  error         text,                             -- mensagem de erro se falhou
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (external_id)                            -- garantia de idempotência
);
-- SEM RLS: acesso apenas via service_role key (webhook handler)
```

---

### 4.8 Tabela: `plans`

Planos de assinatura disponíveis.

```sql
CREATE TABLE plans (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text         NOT NULL,
  price_monthly      numeric(8,2) NOT NULL,
  max_nfse_per_month integer,                    -- null = ilimitado
  features           jsonb,                      -- { payment_links, nfse, das, reports }
  active             boolean      NOT NULL DEFAULT true,
  created_at         timestamptz  NOT NULL DEFAULT now()
);

-- Dados iniciais (migration 010)
INSERT INTO plans VALUES
  (gen_random_uuid(), 'Trial',  0.00, 5,    '{"payment_links":true,"nfse":true,"das":true,"reports":false}', true, now()),
  (gen_random_uuid(), 'Básico', 29.90, 10,  '{"payment_links":true,"nfse":true,"das":true,"reports":false}', true, now()),
  (gen_random_uuid(), 'Pro',    49.90, null,'{"payment_links":true,"nfse":true,"das":true,"reports":true}',  true, now());
```

**RLS:**
```sql
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (true);  -- leitura pública
-- INSERT/UPDATE/DELETE: apenas via service_role (admin)
```

---

### 4.9 Tabela: `subscriptions`

Assinatura de cada MEI (1:1 com `auth.users`).

```sql
CREATE TABLE subscriptions (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                 uuid        REFERENCES plans(id),
  status                  text        NOT NULL DEFAULT 'trial',
  trial_ends_at           timestamptz,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  stripe_subscription_id  text,           -- ID da assinatura no Stripe (V1.5)
  mp_subscription_id      text,           -- ID da assinatura no MP (futuro)
  cancelled_at            timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_status_check CHECK (
    status IN ('active', 'trial', 'past_due', 'cancelled')
  ),
  UNIQUE (user_id)                        -- um MEI = uma assinatura
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status  ON subscriptions(status);
```

**RLS:**
```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_own_read" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());
-- Writes: apenas via service_role (admin panel ou webhook Stripe)
```

---

### 4.10 Tabela: `admin_actions`

Log de auditoria de ações do admin.

```sql
CREATE TABLE admin_actions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   uuid        NOT NULL REFERENCES auth.users(id),
  target_user_id  uuid        NOT NULL REFERENCES auth.users(id),
  action          text        NOT NULL,
  reason          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_actions_action_check CHECK (
    action IN ('block', 'unblock', 'change_plan', 'cancel', 'trial_extend')
  )
);

-- RLS: apenas admins leem e escrevem
CREATE POLICY "admin_actions_admin_only" ON admin_actions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
```

---

### 4.11 Triggers de `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicado em: profiles, clients, services, payment_links, nfse_invoices, das_payments, subscriptions
```

---

## 5. Padrões de Código

### 5.1 Server Components vs Client Components

**Regra geral:** Server Component por padrão; adicionar `'use client'` apenas quando necessário.

**Use Server Component quando:**
- Buscar dados no banco (via `lib/supabase/server.ts`)
- Sem state, sem event handlers, sem hooks
- Dados que podem ser pré-renderizados (ex: `/inicio`, `/admin`)

**Use Client Component quando:**
- State local (`useState`)
- Efeitos (`useEffect`, `useQuery`)
- Event handlers (`onClick`, `onChange`)
- Acesso a APIs do browser (`navigator`, `window`)
- Componentes de formulário (react-hook-form)
- TanStack Query (`useQuery`, `useMutation`)

**Exemplo correto — Server Component com dados:**
```typescript
// app/(app)/inicio/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: services } = await supabase
    .from('services')
    .select('amount, status')
    .eq('user_id', user!.id)
    .gte('service_date', monthStart)

  return <DashboardContent totalReceived={paid} />
}
```

**Exemplo correto — Client Component com TanStack Query:**
```typescript
// components/servicos/ServicosList.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function ServicosList() {
  const { data } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase.from('services').select('*')
      return data
    },
  })
}
```

### 5.2 Supabase: Server vs Browser Client

| Módulo | Uso | Quando usar |
|---|---|---|
| `lib/supabase/server.ts` | `await createClient()` | Server Components, Route Handlers, proxy.ts |
| `lib/supabase/client.ts` | `createClient()` (síncrono) | Client Components com TanStack Query |

**NUNCA** usar o browser client em Server Components (sem acesso a cookies do servidor).  
**NUNCA** usar o server client em Client Components (bundle expõe service_role).

**Webhook handlers** usam `createClient()` do pacote `@supabase/supabase-js` diretamente com `SUPABASE_SERVICE_ROLE_KEY` (sem RLS, necessário para acessar dados de múltiplos usuários).

### 5.3 Padrões de Query com TanStack Query

**staleTime:** 2 minutos (dados de serviços, clientes)  
**gcTime:** 10 minutos (cache garbage collection)  
**retry:** 1 tentativa (erros de rede transitórios)

**Query keys — convenção:**
```typescript
// Chaves hierárquicas para invalidação precisa
['services']                          // todos os serviços
['services', { status: 'pending' }]  // com filtro
['services', serviceId]              // um serviço específico
['clients']
['das', { year: 2026 }]
['profile', userId]
```

**Invalidação após mutação:**
```typescript
const queryClient = useQueryClient()
// Após criar/atualizar serviço:
queryClient.invalidateQueries({ queryKey: ['services'] })
```

### 5.4 Formulários — Padrão React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  client_name_snapshot: z.string().min(2, 'Mínimo 2 caracteres'),
  description: z.string().min(3).max(200),
  service_date: z.string(),
  amount: z.number().positive('Valor deve ser maior que zero'),
})

type FormData = z.infer<typeof schema>

export function ServicoForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })
  
  const onSubmit = async (data: FormData) => {
    // mutation Supabase
  }
}
```

### 5.5 Tratamento de Erros

**API Routes:** retornar `NextResponse.json({ error: '...' }, { status: XXX })`  
**Client Components:** usar `sonner` toast com `toast.error('mensagem')`  
**Server Components:** capturar com try/catch, exibir estado de erro no JSX

---

## 6. API Routes

### 6.1 POST `/api/payment-links`

**Descrição:** Cria uma Preference no Mercado Pago e salva o link no banco.

**Autenticação:** Cookie de sessão Supabase (obrigatório)

**Request Body:**
```typescript
{
  service_id?: string    // UUID — serviço a ser vinculado (opcional)
  amount: number         // Valor em reais (ex: 350.00)
  description: string    // Máx 200 chars
  gateway: 'mercadopago' | 'stripe'
  client_id?: string     // UUID — cliente (opcional)
}
```

**Response 200:**
```typescript
{
  url: string           // init_point do MP (URL de pagamento)
  payment_link_id: string  // UUID interno
}
```

**Responses de erro:**
| Status | Cenário |
|---|---|
| 401 | Usuário não autenticado |
| 400 | Body inválido (falha Zod) |
| 422 | Token MP não configurado |
| 422 | Stripe não disponível |
| 500 | Erro interno MP API |

**Lógica de prioridade do token MP:**
1. `profiles.mercadopago_access_token` do usuário autenticado
2. Fallback: `process.env.MERCADOPAGO_ACCESS_TOKEN` (token da plataforma)
3. Nenhum configurado: erro 422

**Configuração da Preference MP:**
```typescript
{
  items: [{ id, title, quantity: 1, currency_id: 'BRL', unit_price }],
  notification_url: `${NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
  external_reference: paymentLinkId,  // UUID interno para idempotência
  expires: true,
  expiration_date_to: now + 7 dias,
}
```

---

### 6.2 POST `/api/webhooks/mercadopago`

**Descrição:** Processa notificações de pagamento do Mercado Pago. Idempotente.

**Autenticação:** Nenhuma (endpoint público) — validação por `external_id` único

**Fluxo:**
1. Extrair `eventId` do body (`body.id` ou `body.data?.id`)
2. Verificar se `webhook_events.external_id = eventId` já existe → se sim, retornar `{ ok: true, skipped: true }`
3. Inserir registro em `webhook_events` com `processed = false`
4. Se `body.type === 'payment'` e `body.data?.id` presente:
   - Buscar pagamento via `Payment.get({ id: body.data.id })`
   - Se `payment.status === 'approved'`:
     - `UPDATE payment_links SET status='paid', paid_at=now() WHERE id = external_reference`
     - `SELECT service_id FROM payment_links WHERE id = external_reference`
     - Se `service_id`: `UPDATE services SET status='paid', paid_at=now(), payment_method=...`
5. `UPDATE webhook_events SET processed=true, processed_at=now()`

**Cliente Supabase usado:** `createClient()` com `SUPABASE_SERVICE_ROLE_KEY` (sem RLS, dados multi-usuário)

**Mapeamento de método de pagamento:**
```typescript
payment.payment_type_id === 'account_money' ? 'pix' : 'credit_card'
```

**Nota:** `payment_type_id` do MP pode ser `'account_money'` (Pix/saldo MP), `'credit_card'`, `'debit_card'`, `'bolbradesco'`, etc. Mapeamento simplificado em V1.

---

### 6.3 POST `/api/nfse` (V1.5 — planejado)

**Descrição:** Emite NFS-e via Focus NFe.

**Request Body:**
```typescript
{
  service_id: string        // UUID do serviço
  client_id: string         // UUID do cliente (deve ter CNPJ)
  amount: number
  service_description: string
  cnae_code: string
}
```

**Fluxo planejado:**
1. Validar plano (Pro) e limite mensal de NFS-e
2. Buscar dados do MEI (prestador) e cliente (tomador) do Supabase
3. Criar `nfse_invoices` com `status = 'processing'`
4. POST para `https://homologacao.focusnfe.com.br/v2/nfse?ref={external_id}`
5. Polling via GET até `status = 'issued'` (max 5 tentativas com delay exponencial)
6. Atualizar `nfse_invoices` com `pdf_url`, `xml_url`, `nfse_number`, `status = 'issued'`
7. Linkar `services.nfse_id` à NFS-e gerada

---

## 7. Autenticação e Autorização

### 7.1 Fluxo Magic Link

```
1. Usuário digita e-mail em /login
2. Chama supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: APP_URL } })
3. Supabase envia e-mail com link: APP_URL/auth/callback?code=...&type=email
4. Usuário clica no link → browser vai para /auth/callback
5. Route Handler /app/supabase/callback/route.ts:
   - Extrai 'code' dos searchParams
   - Chama supabase.auth.exchangeCodeForSession(code)
   - Redireciona para /inicio
6. Sessão salva em cookie HTTP-only gerenciado pelo @supabase/ssr
```

### 7.2 Fluxo Google OAuth

```
1. Usuário clica "Entrar com Google"
2. Chama supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: APP_URL + '/auth/callback' } })
3. Supabase redireciona para consent screen Google
4. Google redireciona para APP_URL/auth/callback?code=...
5. Mesmo handler do Magic Link
```

### 7.3 proxy.ts — Lógica de Proteção

Arquivo: `proxy.ts` (equivalente ao `middleware.ts` no Next.js 16)

```typescript
export async function proxy(request: NextRequest) {
  // 1. Inicializa cliente Supabase com cookies da request
  const supabase = createServerClient(URL, ANON_KEY, { cookies: { ... } })

  // 2. Verifica usuário autenticado
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Define rotas públicas
  const isPublic = pathname.startsWith('/login') ||
                   pathname.startsWith('/cadastro') ||
                   pathname.startsWith('/pagar') ||
                   pathname === '/'

  // 4. Sem usuário + rota privada → /login
  if (!user && !isPublic) redirect('/login')

  // 5. Rota admin → verificar role no banco
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/inicio')
  }

  // 6. Usuário autenticado em / → /inicio
  if (user && pathname === '/') redirect('/inicio')
}

// Matcher: todas as rotas exceto _next/static, imagens, favicon
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] }
```

**Custo de performance:** a verificação de role para `/admin` faz uma query SQL adicional. Aceito em V1 por ser rota de baixíssimo acesso.

### 7.4 RLS — Row Level Security

Todas as tabelas com `user_id` têm RLS habilitado. A política padrão é:

```sql
-- Cada MEI vê apenas seus próprios dados
CREATE POLICY "[tabela]_own" ON [tabela]
  FOR ALL USING (user_id = auth.uid());
```

**Exceções:**
- `profiles`: `id = auth.uid()` (PK é o user ID)
- `plans`: leitura pública (`USING (true)`)
- `subscriptions`: somente leitura pelo próprio usuário (writes via service_role)
- `admin_actions`: leitura e escrita apenas por admins (verificação via subquery em profiles)
- `webhook_events`: **SEM RLS** — acesso apenas via service_role key (webhook handler)

---

## 8. Integrações Externas

### 8.1 Mercado Pago

**SDK:** `mercadopago@^2.12.0`  
**Base URL:** `https://api.mercadopago.com`

**Configuração:**
```typescript
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const mp = new MercadoPagoConfig({ accessToken: token })
```

**Endpoints utilizados:**

| Endpoint | SDK | Quando |
|---|---|---|
| POST `/checkout/preferences` | `new Preference(mp).create({ body })` | Criar link de pagamento |
| GET `/v1/payments/:id` | `new Payment(mp).get({ id })` | Verificar status no webhook |

**Campos relevantes da Preference:**
- `init_point`: URL de checkout MP (redirect)
- `external_reference`: UUID interno (`payment_links.id`)
- `notification_url`: URL do webhook (deve ser HTTPS público)
- `expiration_date_to`: ISO string de expiração (7 dias)

**Webhook MP:**
- Supabase `UNIQUE (external_id)` garante idempotência
- Body do webhook: `{ id, type, data: { id } }` onde `data.id` é o ID do pagamento
- Status `approved` = pagamento confirmado (Pix instantâneo, cartão aprovado)
- O handler busca o pagamento diretamente na API MP para verificar o status (não confia no body do webhook)

**Ambientes:**
- Desenvolvimento: access_token de sandbox (`TEST-...`)
- Produção: access_token real do MEI ou da FLEX9

---

### 8.2 Focus NFe (V1.5)

**Site:** `https://focusnfe.com.br`  
**Base URL homologação:** `https://homologacao.focusnfe.com.br/v2/`  
**Base URL produção:** `https://api.focusnfe.com.br/v2/`  
**Custo:** ~R$0,65 por nota emitida  
**Municípios:** 700+ cadastrados  
**Autenticação:** Basic Auth com API Key como username, senha vazia

**Endpoint de emissão:**
```
POST /v2/nfse?ref={referencia_externa}
Authorization: Basic base64(API_KEY:)
Content-Type: application/json

{
  "prestador": {
    "cnpj": "...",
    "inscricao_municipal": "...",
    "codigo_municipio": "3550308"   // IBGE
  },
  "tomador": {
    "cnpj": "...",   // ou "cpf" para PF
    "razao_social": "...",
    "email": "...",
    "endereco": { ... }
  },
  "servico": {
    "aliquota": 5,                  // % ISS
    "base_calculo": 350.00,
    "discriminacao": "Frete São Paulo → ABC",
    "iss_retido": "false",
    "item_lista_servico": "14.01",  // código da lista de serviços
    "valor_servicos": 350.00
  }
}
```

**Endpoint de consulta de status:**
```
GET /v2/nfse?ref={referencia_externa}
```

**Status possíveis:** `processando_autorizacao`, `autorizado`, `erro_autorizacao`, `cancelado`

**Mapeamento para `nfse_invoices.status`:**
| Focus NFe | flex9pag |
|---|---|
| `processando_autorizacao` | `processing` |
| `autorizado` | `issued` |
| `erro_autorizacao` | `error` |
| `cancelado` | `cancelled` |

---

### 8.3 Stripe (V1.5 — placeholder)

**SDK:** `stripe@^22.0.0`  
**Status atual:** Retorna erro 422 "Stripe será disponibilizado em breve"

**Plano de implementação V1.5:**
1. Criar Payment Link via Stripe API (`stripe.paymentLinks.create`)
2. Usar Stripe Connect para MEI com conta própria
3. Webhook Stripe: `payment_intent.succeeded` → atualizar `payment_links` e `services`
4. Stripe Billing para assinaturas automatizadas (V2)

**Variáveis necessárias:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

### 8.4 Supabase Auth

**Provedores configurados:**
- Email (Magic Link)
- Google OAuth

**Redirect URL de produção:** `https://flex9pag.vercel.app/auth/callback`  
**Redirect URL de desenvolvimento:** `http://localhost:3000/auth/callback`

**Configuração no Supabase Dashboard:**
- Authentication → Providers → Email: "Confirm email" ON, "Magic Link" ON
- Authentication → Providers → Google: Client ID e Secret do Google Cloud Console
- Authentication → URL Configuration → Redirect URLs: adicionar URL de produção e desenvolvimento

---

## 9. Convenções

### 9.1 Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Componentes | PascalCase | `DashboardContent`, `CobrarForm` |
| Hooks | camelCase com prefixo `use` | `useServices`, `useProfile` |
| Funções utilitárias | camelCase | `formatCurrency`, `generateWhatsAppLink` |
| Constantes | UPPER_SNAKE_CASE | `MEI_ANNUAL_LIMIT`, `DAS_SERVICE_AMOUNT` |
| Arquivos de componentes | PascalCase.tsx | `BottomNav.tsx` |
| Arquivos de páginas | lowercase | `page.tsx`, `layout.tsx` |
| Arquivos de rotas API | `route.ts` | `route.ts` |
| Tabelas do banco | snake_case plural | `payment_links`, `nfse_invoices` |
| Colunas do banco | snake_case | `service_date`, `paid_at` |

### 9.2 Formatters em `lib/utils.ts`

| Função | Uso |
|---|---|
| `formatCurrency(value: number): string` | Exibe valores em BRL: `R$ 350,00` |
| `formatDate(date: string \| Date): string` | Data curta: `01/04/2026` |
| `formatDateLong(date: string \| Date): string` | Data por extenso: `1 de abril de 2026` |
| `formatMonthYear(date: string \| Date): string` | Mês/ano: `abril de 2026` |
| `formatCPF(cpf: string): string` | `123.456.789-09` |
| `formatCNPJ(cnpj: string): string` | `12.345.678/0001-90` |
| `formatPhone(phone: string): string` | `(11) 99999-9999` |
| `generateWhatsAppLink(phone, amount, url, desc): string` | URL wa.me com mensagem |
| `isValidCPF(cpf: string): boolean` | Valida dígitos verificadores |
| `isValidCNPJ(cnpj: string): boolean` | Valida dígitos verificadores |
| `getMeiLimitPercentage(revenue): number` | % do limite R$81.000 |

**Constantes:**
```typescript
export const MEI_ANNUAL_LIMIT = 81000        // R$81.000
export const DAS_SERVICE_AMOUNT = 75.60      // R$75,60/mês em 2026
```

### 9.3 Máscaras de Input (`react-imask`)

```typescript
import { IMaskInput } from 'react-imask'

// CPF
<IMaskInput mask="000.000.000-00" />

// CNPJ
<IMaskInput mask="00.000.000/0000-00" />

// Telefone
<IMaskInput mask="(00) 00000-0000" />

// Valor monetário
<IMaskInput mask={Number} scale={2} signed={false} thousandsSeparator="." radix="," />
```

### 9.4 Imports

Usar sempre paths absolutos com alias `@/`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { type Service } from '@/lib/types'
import { Button } from '@/components/ui/button'
```

### 9.5 QR Code

```typescript
import { QRCodeCanvas } from 'qrcode.react'

// CORRETO: named export QRCodeCanvas
<QRCodeCanvas value={url} size={200} />

// ERRADO: default export (não existe na v4)
// import QRCode from 'qrcode.react'
```

### 9.6 Toasts (Sonner)

```typescript
import { toast } from 'sonner'

toast.success('Serviço salvo com sucesso!')
toast.error('Erro ao gerar link. Tente novamente.')
toast.loading('Gerando link...')
toast.promise(promise, {
  loading: 'Gerando link de cobrança...',
  success: 'Link gerado!',
  error: 'Erro ao gerar link.',
})
```

Configurado no `app/layout.tsx`:
```tsx
<Toaster richColors position="top-center" />
```

---

## 10. Deploy e CI

### 10.1 Vercel

**URL produção:** `https://flex9pag.vercel.app`  
**Framework:** Next.js (detectado automaticamente)  
**Node version:** 20.x  
**Build command:** `next build`  
**Output directory:** `.next`

**Configuração de deploy:**
- Branch `main` → preview deployment automático
- Branch `master` → produção (branch principal atual)
- Pull requests → preview URL única

### 10.2 Variáveis de Ambiente

**Produção (Vercel Dashboard → Settings → Environment Variables):**

| Variável | Tipo | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anon key pública (safe no browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Chave de admin (nunca exposta) |
| `MERCADOPAGO_ACCESS_TOKEN` | Secret | Token MP da plataforma (fallback) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret | Secret para validar webhooks (V1.5) |
| `STRIPE_SECRET_KEY` | Secret | Chave Stripe (V1.5) |
| `STRIPE_PUBLISHABLE_KEY` | Public | Publishable Stripe (V1.5) |
| `STRIPE_WEBHOOK_SECRET` | Secret | Secret webhook Stripe (V1.5) |
| `FOCUSNFE_API_KEY` | Secret | Chave Focus NFe (V1.5) |
| `FOCUSNFE_ENVIRONMENT` | Config | `'homologacao'` ou `'producao'` |
| `NEXT_PUBLIC_APP_URL` | Public | `https://flex9pag.vercel.app` |

**Desenvolvimento (`.env.local`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rdsodagjhlmdxouzuimc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
MERCADOPAGO_ACCESS_TOKEN=TEST-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Atenção:** `.env.local` nunca deve ser commitado. Verificar `.gitignore`.

### 10.3 Supabase Migrations

**Workflow de migrations:**
```bash
# 1. Criar arquivo de migration
# supabase/migrations/013_nome_da_migration.sql

# 2. Executar no Supabase SQL Editor (ambiente de desenvolvimento)
# Dashboard → SQL Editor → New query → colar conteúdo

# 3. Verificar no Table Editor

# 4. Executar em produção via SQL Editor (manual em V1)
# V1.5: usar supabase CLI com `supabase db push`
```

**Estado atual:** 12 migrations numeradas + `FULL_SCHEMA.sql` para deploy fresh.

### 10.4 CI/CD — Status V1

- **CI:** ESLint via `npm run lint` (sem test runner configurado)
- **CD:** Deploy automático via Vercel ao push no branch master
- **Testes:** Nenhum em V1 (item de pendência técnica)

---

## 11. Pendências Técnicas

### 11.1 Críticas (bloqueia V1.5)

| Item | Descrição | Complexidade |
|---|---|---|
| NFS-e API Route | `POST /api/nfse` com Focus NFe + polling de status | Alta |
| Onboarding wizard | Fluxo de primeiro acesso com coleta de CNPJ, CNAE, cidade | Média |
| Validação de assinatura no proxy | Bloquear funcionalidades por `subscriptions.status` | Média |
| Webhook HMAC validation | Verificar assinatura HMAC do webhook MP (atualmente sem validação) | Baixa |

### 11.2 Importantes (melhoria de produto)

| Item | Descrição | Complexidade |
|---|---|---|
| Alerta limite MEI 80% | Banner no `/inicio` quando `annual_revenue >= R$64.800` | Baixa |
| Alerta DASN-SIMEI | Banner a partir de 01/abril notificando prazo 31/mai | Baixa |
| PWA manifest | `public/manifest.json` + service worker | Baixa |
| Stripe link básico | `POST /api/payment-links` para gateway Stripe | Alta |
| Token MP criptografado | Criptografar `mercadopago_access_token` no banco | Média |
| Testes E2E | Playwright ou Cypress para fluxos críticos | Alta |

### 11.3 Tech Debt Identificado

| Item | Problema | Resolução |
|---|---|---|
| Duplicidade `app/types.ts` e `lib/types.ts` | Dois arquivos de tipos | Remover `app/types.ts`, usar apenas `lib/types.ts` |
| Duplicidade `app/utils.ts` e `lib/utils.ts` | Dois arquivos de utils | Remover `app/utils.ts`, usar apenas `lib/utils.ts` |
| Token MP em texto plano | `mercadopago_access_token` não criptografado | Implementar criptografia simétrica (AES-256) |
| Ausência de testes | Zero cobertura de testes | Configurar Vitest + React Testing Library |
| `next.config.ts` vazio | Sem otimizações configuradas | Adicionar `images.domains`, headers de segurança |
| Webhook sem HMAC | Qualquer request pode chamar o webhook | Implementar verificação de assinatura MP |
| Admin queries sem service_role | Admin busca dados via anon key (RLS restringe) | Usar service_role client em Server Components admin |

---

## 12. Decisões de Arquitetura (ADRs)

### ADR-001: Next.js App Router com proxy.ts em vez de middleware.ts

**Contexto:** Next.js 16 introduziu breaking changes no middleware. O arquivo `middleware.ts` foi renomeado para `proxy.ts` nesta versão.

**Decisão:** Seguir a nova convenção do Next.js 16 usando `proxy.ts` com export `proxy` (em vez de `middleware` + `config`). O export `config` com `matcher` continua funcionando.

**Consequências:** Código incompatível com exemplos de Next.js 14/15 que ainda usam `middleware.ts`. Documentação oficial deve ser consultada em `node_modules/next/dist/docs/`.

---

### ADR-002: Single-Tenant por `user_id`

**Contexto:** MEI é uma figura individual — não existe "empresa" com múltiplos colaboradores.

**Decisão:** Toda tabela com dados do MEI tem `user_id` como discriminador. Sem conceito de `organization_id` ou `workspace`.

**Vantagens:**
- Modelo simples
- RLS trivial (`user_id = auth.uid()`)
- Sem custo de join adicional

**Desvantagens:**
- Impossível ter contador acessando os dados do MEI (V3 feature)
- Impossível ter assistente/sócio (não aplicável ao MEI)

---

### ADR-003: TanStack Query para estado do servidor no client

**Contexto:** Next.js App Router favorece Server Components para fetch de dados. Porém, telas interativas (listas com filtros, formulários com autocomplete) precisam de cache reativo no client.

**Decisão:** TanStack Query v5 para todas as queries client-side. Server Components para dados iniciais críticos (SSR do `/inicio`).

**Configuração:**
```typescript
// staleTime 2min: dados de serviços mudam com baixa frequência
// gcTime 10min: manter cache por 10min após componente desmontar
// retry 1: tentar uma vez em caso de erro de rede
```

**Benefícios:** Cache automático, deduplicação de queries, invalidação precisa por query key, loading states built-in.

---

### ADR-004: Idempotência de Webhooks via `UNIQUE (external_id)`

**Contexto:** Gateways de pagamento podem enviar o mesmo webhook múltiplas vezes (retry em caso de timeout).

**Decisão:** Tabela `webhook_events` com `UNIQUE (external_id)`. Ao receber um webhook, verificar se `external_id` já existe antes de processar.

**Fluxo:**
1. Verificar existência → se existe, retornar `{ ok: true, skipped: true }` (HTTP 200)
2. Se não existe, inserir e processar
3. Marcar como `processed = true` após sucesso

**Alternativa considerada:** Redis com TTL. Descartada pela complexidade adicional (Supabase já disponível, custo zero).

---

### ADR-005: Supabase Auth com Magic Link como método primário

**Contexto:** João (persona) frequentemente esquece senhas. Processos de recuperação de senha geram abandono.

**Decisão:** Magic Link como método principal (sem senha). Google OAuth como alternativa conveniente.

**Trade-off:** Depende de acesso ao e-mail. Mitigação: orientar João a usar e-mail vinculado ao Gmail (facilita acesso pelo celular).

---

### ADR-006: Mercado Pago como gateway primário

**Contexto:** Decidir entre MP, Stripe, PagSeguro, ou múltiplos.

**Decisão:** Mercado Pago como único gateway em V1, Stripe como secundário em V1.5.

**Justificativas:**
- MP tem maior penetração no mercado brasileiro (MEI usa MP pessoalmente)
- Pix nativo no MP sem configuração adicional
- João provavelmente já tem conta MP
- Checkout Preference API é simples: uma chamada gera URL completa com todos os métodos

**Stripe V1.5:** para MEI que atende clientes que preferem cartão internacional ou que já usam Stripe.

---

### ADR-007: `client_name_snapshot` — Desnormalização intencional

**Contexto:** Se um cliente for deletado da tabela `clients`, os serviços históricos perderiam o nome do cliente.

**Decisão:** Salvar `client_name_snapshot` em `services` no momento da criação, independente do `client_id`.

**Regra:**
- `client_id`: FK para `clients` (pode ser NULL se não cadastrado)
- `client_name_snapshot`: texto obrigatório, sempre preenchido

**Benefício:** Integridade histórica. Relatórios de faturamento corretos mesmo após deleção de clientes.

---

### ADR-008: Admin Manual em V1

**Contexto:** Automatizar cobranças de assinatura requer integração com Stripe Billing ou MP Subscriptions + webhooks + lógica de retry.

**Decisão:** V1 usa gestão manual de assinaturas. William verifica pagamentos (Pix/transferência) e atualiza `subscriptions.status` manualmente via `/admin/usuarios`.

**Trade-off:** Não escala para 100+ clientes. Aceitável para validar o produto antes de investir em automação (V2).

**Auditoria:** Todas as ações manuais registradas em `admin_actions` com timestamp e razão.

---

*Documento gerado em abril/2026. Revisar ao iniciar cada versão.*
