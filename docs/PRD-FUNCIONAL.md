# PRD Funcional — flex9pag
**Versão:** 1.0  
**Data:** Abril 2026  
**Autor:** William Cintra / FLEX9 TECNOLOGIA  
**Status:** Ativo (V1 em produção)

---

## Sumário

1. [Visão do Produto](#1-visao-do-produto)
2. [Personas](#2-personas)
3. [Funcionalidades por Módulo](#3-funcionalidades-por-modulo)
4. [Fluxos Principais](#4-fluxos-principais)
5. [Regras de Negócio MEI](#5-regras-de-negocio-mei)
6. [Modelo de Assinatura](#6-modelo-de-assinatura)
7. [Roadmap Priorizado](#7-roadmap-priorizado)
8. [Métricas de Sucesso](#8-metricas-de-sucesso)

---

## 1. Visão do Produto

### 1.1 Problema

O MEI brasileiro de serviços — freteiro, eletricista, pedreiro, pintor, encanador — enfrenta três problemas cotidianos sem solução acessível:

1. **Não sabe quanto ganhou.** Não usa planilha. Não tem contador. Confia na memória.
2. **Cobra de forma amadora.** Manda mensagem no WhatsApp "pode pagar R$500 pra mim?". Não passa recibo. Perde credibilidade com clientes PJ que precisam de nota fiscal.
3. **Esquece ou atrasa o DAS.** A guia do Simples Nacional MEI vence todo dia 20. Multa de 0,33% ao dia + 20% fixo. Muitos MEIs perdem o benefício por inadimplência acumulada.

Ferramentas existentes no mercado (Conta Azul, QuickBooks, Nibo) são complexas, com jargão contábil, UI densa e custo alto (R$89–R$299/mês). O MEI não tem tempo nem paciência para aprender.

### 1.2 Solução

**flex9pag** é um app mobile-first para MEI de serviços que resolve esses três problemas em menos de 3 toques por ação:

- **Registrar serviço** em 30 segundos
- **Cobrar via link de pagamento** (Pix/cartão) com QR Code e botão de WhatsApp
- **Controlar DAS** com alerta visual de vencimento
- **Emitir NFS-e** para clientes PJ (V1.5)

### 1.3 Posicionamento

| Atributo | flex9pag | Conta Azul | Nota Fiscal MEI (gov) |
|---|---|---|---|
| Foco | MEI serviços | PME geral | Apenas NFS-e |
| Preço | R$29,90–R$49,90/mês | R$89+/mês | Gratuito |
| Cobrança online | Sim (MP/Stripe) | Sim | Não |
| Mobile-first | Sim | Parcial | Não |
| Jargão contábil | Zero | Alto | Médio |
| DAS integrado | Sim | Não | Não |

### 1.4 Proposta de Valor

> "Registre seus serviços, cobre seus clientes e emita notas fiscais em 3 toques."

---

## 2. Personas

### 2.1 João — Persona Principal

**Perfil demográfico**
- Idade: 38–52 anos
- Sexo: Masculino (70% do público MEI de serviços manuais)
- Escolaridade: Ensino Médio completo
- Renda: R$3.000–R$7.000/mês como MEI
- Dispositivo: Android intermediário (Samsung Galaxy A-series, 4G)
- Apps que usa: WhatsApp, YouTube, Instagram, aplicativo do banco

**Atividades representativas do João**

João é freteiro autônomo. Acorda às 5h, faz 4–6 fretes por dia, cobra via Pix ou dinheiro. Às 19h está em casa. Usa o celular para comunicar com clientes, mas não gosta de formulários longos.

Variações do João incluem:
- **Eletricista João:** cobra por serviço, aceita cartão via máquina, começa a ter clientes PJ que pedem NFS-e
- **Pedreiro João:** recebe por etapa de obra, às vezes recebe por transferência, precisa registrar para ter controle
- **Pintor João:** emite orçamento por WhatsApp, cobra 50% adiantado, perde noção do que recebeu no mês

**Frustrações atuais**
1. "Não sei quanto ganhei esse mês. Só sei quando olho o banco."
2. "Meu cliente PJ pede nota fiscal e eu não sei como fazer."
3. "Sempre me esqueço do DAS e pago multa."
4. "Tenho vergonha de pedir o dinheiro direto. Prefiro mandar um link."
5. "Aplicativo de gestão parece coisa de escritório. Não é pra mim."

**Jobs to Be Done (JTBD)**

| Situação | Motivação | Resultado esperado |
|---|---|---|
| "Acabei de terminar um frete" | Quero registrar antes de esquecer | Serviço salvo em 30s, cliente notificado |
| "Preciso cobrar o cliente" | Quero parecer profissional | Link de pagamento pronto para WhatsApp |
| "Tenho um cliente PJ que pede nota" | Não quero perder o cliente | NFS-e emitida sem precisar ir à prefeitura |
| "DAS está vencendo" | Não quero pagar multa | Alerta com link para pagar |
| "Quero saber se estou bem no mês" | Tenso sobre ganhos | Tela simples com quanto recebi e quanto está pendente |

**Comportamento de uso esperado**
- Sessões de 1–3 minutos, várias vezes ao dia
- Prefere toques a digitação
- Abandona se tiver mais de 3 campos obrigatórios em sequência
- Não lê textos longos — precisa de ícones e cores

---

## 3. Funcionalidades por Módulo

### 3.1 Login / Autenticação

**O que faz**  
Permite que o MEI acesse o app via Magic Link (e-mail) ou Google OAuth, sem precisar criar senha.

**Comportamentos esperados**

1. Usuário acessa `flex9pag.vercel.app` → redirecionado para `/login` (se não autenticado)
2. Insere e-mail → recebe link mágico na caixa de entrada
3. Clica no link → autenticado, redirecionado para `/inicio`
4. Alternativa: "Entrar com Google" → OAuth Google, mesmo destino

**Regras de negócio**
- Magic Link expira em 1 hora (padrão Supabase)
- Após o primeiro login, o trigger `on_auth_user_created` cria automaticamente o registro em `profiles` com `full_name` extraído do e-mail ou metadata do Google
- Usuário autenticado que acessa `/login` é redirecionado para `/inicio`
- Usuário não autenticado que acessa qualquer rota privada é redirecionado para `/login`

**Estados de erro**
- E-mail inválido: mensagem de validação inline antes do envio
- E-mail não recebido: orientar a verificar spam; link de "reenviar"
- Falha na autenticação Google: toast de erro com orientação para tentar Magic Link

**Onboarding pós-primeiro-login**
- Se `profiles.onboarding_completed = false`: redirecionar para `/onboarding` (V1.5)
- V1 atual: usuário vai direto para `/inicio` e pode preencher dados em `/configuracoes`

---

### 3.2 Dashboard — Início (`/inicio`)

**O que faz**  
Tela inicial do app. Mostra resumo financeiro do mês atual e alerta de DAS próximo.

**Comportamentos esperados**

1. Carrega via SSR (Server Component) com dados do mês corrente
2. Exibe cartões:
   - **Recebido no mês:** soma de `services.amount` onde `status = 'paid'` e `service_date` no mês atual
   - **A receber:** soma de `services.amount` onde `status = 'pending'` e `service_date` no mês atual
3. Exibe alerta de DAS se houver guia `pending` com `due_date` nos próximos 10 dias
4. Acesso rápido para "Registrar Serviço" e "Cobrar"

**Regras de negócio**
- Mês atual: de `YYYY-MM-01` até último dia do mês (`YYYY-MM-28/29/30/31`)
- Serviços `cancelled` não entram no cálculo
- DAS alerta quando `due_date <= hoje + 10 dias` e `status = 'pending'`
- Alerta de limite MEI: se `annual_revenue >= R$64.800` (80% de R$81.000), exibir banner amarelo. Se >= R$81.000, banner vermelho bloqueante

**Estados de erro**
- Erro na query Supabase: exibir valores zerados com toast de aviso
- Sem serviços no mês: exibir estado vazio com CTA "Registre seu primeiro serviço"

**Componentes**
- `DashboardContent` (Client Component) — recebe `totalReceived`, `totalPending`, `nextDas` via props do Server Component

---

### 3.3 Serviços (`/servicos`, `/servicos/novo`, `/servicos/[id]`)

**O que faz**  
Módulo central do app. Permite registrar, visualizar, editar e cancelar serviços (receitas do MEI).

**Listagem `/servicos`**

- Lista todos os serviços do MEI ordenados por `service_date DESC`
- Card de cada serviço: nome do cliente, descrição, data, valor, badge de status
- Filtros: status (todos/pendente/pago/cancelado), mês
- Ao tocar em um serviço: Sheet lateral com detalhes completos + ações
- Ações disponíveis no sheet:
  - "Marcar como pago" (se `status = 'pending'`) → abre modal de seleção de forma de pagamento
  - "Cobrar" → navega para `/cobrar?service_id=X&amount=Y&description=Z`
  - "Emitir NFS-e" (se plano Pro, V1.5)
  - "Cancelar" → confirmação → atualiza `status = 'cancelled'`

**Novo serviço `/servicos/novo`**

Campos do formulário:
| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| Cliente | Autocomplete de `clients` | Não | — |
| Nome do cliente | Texto | Sim | Min 2 chars (preenchido pelo autocomplete ou manual) |
| Descrição do serviço | Texto | Sim | Min 3 chars, max 200 |
| Data do serviço | Date picker | Sim | Não pode ser futura (warn) |
| Valor (R$) | Numérico com máscara | Sim | > 0, max R$81.000 |
| Observações | Textarea | Não | Max 500 chars |

**Regras de negócio**
- `client_name_snapshot` é sempre salvo, mesmo com `client_id` vinculado (garante integridade histórica se cliente for deletado)
- Serviço criado sempre com `status = 'pending'`
- "Marcar como pago" define `paid_at = now()` e solicita `payment_method`
- Serviço cancelado não pode ser revertido (somente criação de novo)
- Edição de serviço pago: apenas `notes` pode ser editado
- Soma acumulada do mês atualiza o dashboard em tempo real via React Query invalidation

**Estados de erro**
- Valor zerado ou negativo: erro de validação Zod inline
- Falha ao salvar: toast de erro com botão "Tentar novamente"
- Cliente não encontrado no autocomplete: modo "novo cliente" inline ou link para `/clientes/novo`

---

### 3.4 Clientes (`/clientes`, `/clientes/novo`)

**O que faz**  
Cadastro de clientes do MEI para autocomplete em serviços e NFS-e.

**Listagem `/clientes`**

- Lista todos os clientes ordenados por `name ASC`
- Busca por nome (filter local)
- Card: nome, CPF/CNPJ (mascarado), cidade
- Ao tocar: detalhes + lista de serviços daquele cliente
- Ação: "Cobrar este cliente" → `/cobrar?client_id=X`

**Novo cliente `/clientes/novo`**

Campos do formulário:
| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| Nome | Texto | Sim | Min 2 chars |
| CPF ou CNPJ | Texto com máscara | Não | Validação de dígitos verificadores |
| Tipo do documento | Select (CPF/CNPJ) | Não | — |
| E-mail | Email | Não | Formato de e-mail |
| Telefone | Texto com máscara | Não | (XX) XXXXX-XXXX |
| Cidade | Texto | Não | — |
| Estado | Select UF | Não | — |
| Endereço | Texto | Não | — |
| Observações | Textarea | Não | — |

**Regras de negócio**
- CPF e CNPJ têm validação de dígitos verificadores (algoritmo implementado em `lib/utils.ts`)
- Cliente com CNPJ pode receber NFS-e (campo obrigatório para emissão)
- Cliente sem documento pode ser criado (casos de pessoa física informal)
- Não é possível deletar cliente com serviços associados (SET NULL nas FKs — histórico mantido via `client_name_snapshot`)

**Estados de erro**
- CPF/CNPJ inválido: erro inline com mensagem "CPF inválido" ou "CNPJ inválido"
- Duplicidade: não há validação de duplicidade automática na V1 (responsabilidade do MEI)

---

### 3.5 Cobrar — Link de Pagamento (`/cobrar`)

**O que faz**  
Gera link de pagamento via Mercado Pago (Pix + cartão) com QR Code e botão de compartilhamento via WhatsApp.

**Comportamentos esperados**

1. Usuário acessa `/cobrar` (direto ou via "Cobrar" em um serviço)
2. Se veio de um serviço: campos pré-preenchidos via query params (`service_id`, `amount`, `description`)
3. Preenche (ou confirma) valor e descrição
4. Seleciona gateway: Mercado Pago (padrão) ou Stripe (V1.5)
5. Toca "Gerar link de cobrança"
6. POST para `/api/payment-links`:
   - Cria Preference no MP com `notification_url` apontando para o webhook
   - Link expira em 7 dias
   - Salva em `payment_links` com `status = 'active'`
7. Exibe resultado:
   - QR Code (via `QRCodeCanvas` do `qrcode.react`)
   - URL copiável
   - Botão "Enviar via WhatsApp" (abre `wa.me/55TELEFONE?text=...`)
   - Botão "Compartilhar" (Web Share API, fallback para cópia)

**Regras de negócio**
- Token MP: prioridade `profiles.mercadopago_access_token` → fallback `MERCADOPAGO_ACCESS_TOKEN` (token da plataforma)
- Se nenhum token configurado: erro 422 com orientação para ir em Configurações
- `external_reference` do MP = `payment_links.id` (UUID interno) → idempotência no webhook
- Link MP expira em 7 dias (`expires: true`, `expiration_date_to`)
- Um serviço pode ter apenas um link ativo (o campo `services.payment_link_id` é atualizado)
- Geração de novo link para o mesmo serviço: permitida, mas o anterior fica `active` até expirar

**Estados de erro**
- MP não configurado: mensagem específica + link para Configurações
- Falha na API MP: toast de erro com código HTTP retornado
- Valor zerado: validação Zod antes de chamar a API
- Stripe: resposta 422 com "Stripe será disponibilizado em breve"

**WhatsApp**
- Número do cliente (se `client_id` fornecido): usa `clients.phone`
- Sem cliente: campo manual para digitar número
- Mensagem gerada via `generateWhatsAppLink()` de `lib/utils.ts`:  
  `"Olá! Segue o link para pagamento de R$ X,XX referente a: [descrição]\n\n[url]"`

---

### 3.6 DAS — Documento de Arrecadação do Simples Nacional (`/das`)

**O que faz**  
Controle visual das 12 guias DAS do ano corrente. Permite marcar guias como pagas.

**Comportamentos esperados**

1. Exibe grade com os 12 meses do ano
2. Cada card mostra: mês de competência, data de vencimento, valor (R$75,60), status
3. Status visual: `pending` (cinza), `paid` (verde), `overdue` (vermelho)
4. Ao tocar em uma guia `pending` ou `overdue`: ação "Marcar como pago"
5. Modal de confirmação com campos opcionais: data do pagamento, URL do comprovante

**Geração das guias**
- Função `seed_das_for_user(p_user_id uuid)` cria as 12 guias ao ser chamada
- Vencimento: dia 20 do mês seguinte à competência (ex: competência janeiro → vence 20/fevereiro)
- Se `due_date < CURRENT_DATE` no momento da criação: `status = 'overdue'`

**Regras de negócio**
- DAS MEI 2026: R$75,60/mês (inclui INSS 5% do salário mínimo + ISS R$5,00 para serviços)
- Valor pode variar anualmente com reajuste do salário mínimo
- DASN-SIMEI (declaração anual): vence em 31 de maio do ano seguinte — alerta a ser implementado
- Guia paga não pode ser "despaga" (somente via suporte)
- `unique(user_id, competence_month)` garante uma guia por mês por usuário

**Estados de erro**
- Guias não criadas (novo usuário): botão "Criar guias do ano" que chama `seed_das_for_user`
- Falha ao marcar como pago: toast de erro

---

### 3.7 Configurações (`/configuracoes`)

**O que faz**  
Tela de perfil do MEI e configurações do app. Inclui dados pessoais, configuração de gateway de pagamento e logout.

**Seções**

**Dados do MEI**
- Nome completo
- Nome do negócio (MEI Name)
- CPF e CNPJ
- Telefone
- Cidade e Estado
- Descrição do serviço (usada na NFS-e)
- Código CNAE

**Configurações de Pagamento**
- Mercado Pago Access Token (campo de senha, máscara parcial)
- Gateway preferido: Mercado Pago / Stripe / Ambos
- Link para tutorial de como obter o token MP

**Configurações de NFS-e (V1.5)**
- Provedor: Focus NFe / NFe.io / eNotas
- Credenciais do provedor (API Key)

**Conta**
- E-mail (readonly — vem do Supabase Auth)
- Plano atual + data de expiração do trial
- Botão "Sair" (logout)

**Regras de negócio**
- Token MP é salvo em `profiles.mercadopago_access_token` (texto plano no banco — risco aceito em V1)
- Dados do MEI são usados na emissão de NFS-e (remetente da nota)
- CNPJ é obrigatório para emitir NFS-e
- Atualização dispara trigger `updated_at`

**Estados de erro**
- CNPJ inválido: validação inline
- Falha ao salvar: toast de erro

---

### 3.8 Admin Panel (`/admin`, `/admin/usuarios`, `/admin/planos`)

**O que faz**  
Painel exclusivo para William (role = 'admin') gerenciar usuários MEI e assinaturas.

**Acesso**
- Verificado em `proxy.ts`: se `pathname.startsWith('/admin')`, busca `profiles.role` do usuário autenticado
- Role diferente de `'admin'`: redireciona para `/inicio`
- Sem usuário: redireciona para `/login`

**Dashboard `/admin`**

Métricas em tempo real:
- **MRR** (Monthly Recurring Revenue): soma de `plans.price_monthly` para assinaturas `active`
- **Ativos**: contagem de `subscriptions.status = 'active'`
- **Trial**: contagem de `subscriptions.status = 'trial'`
- **Inadimplentes**: contagem de `subscriptions.status = 'past_due'`
- Alerta visual se `past_due > 0` com link para `/admin/usuarios?status=past_due`

**Usuários `/admin/usuarios`**

- Lista todos os MEIs com: nome, e-mail, plano, status, data de criação
- Filtro por status de assinatura
- Ações por usuário:
  - Ativar assinatura (trial → active)
  - Mudar plano
  - Marcar como inadimplente
  - Cancelar assinatura
  - Estender trial
- Todas as ações registradas em `admin_actions` com `admin_user_id`, `target_user_id`, `action`, `reason`

**Planos `/admin/planos`**

- Visualização dos planos cadastrados (Trial, Básico, Pro)
- V1: somente leitura
- V2: CRUD de planos

**Regras de negócio**
- Admin gerencia assinaturas manualmente — sem cobrança automatizada em V1
- `admin_actions` é auditoria imutável (sem DELETE policy)
- A query de subscrições usa `service_role` para ver todos os dados sem RLS

---

## 4. Fluxos Principais

### 4.1 "Acabei de fazer um frete, quero registrar e cobrar"

```
1. João abre o app → tela /inicio
2. Toca em "Cobrar" na BottomNav → /cobrar
   (ou: Serviços → "+" → /servicos/novo)
3. Se /servicos/novo:
   a. Digita nome do cliente (autocomplete sugerido)
   b. Digita descrição: "Frete São Paulo → ABC"
   c. Confirma data (hoje, pré-preenchido)
   d. Digita valor: R$350,00
   e. Toca "Salvar serviço"
   f. Toast: "Serviço salvo!" + botão "Cobrar agora"
   g. Navega para /cobrar?service_id=X&amount=350&description=...
4. Em /cobrar:
   a. Valor e descrição já preenchidos
   b. Toca "Gerar link de cobrança"
   c. Carregando 2-3s (chamada à API MP)
   d. QR Code + URL exibidos
   e. Toca "Enviar via WhatsApp"
   f. WhatsApp abre com mensagem pré-pronta
5. Cliente recebe a mensagem, paga via Pix ou cartão
6. MP envia webhook → /api/webhooks/mercadopago
7. payment_links.status → 'paid', services.status → 'paid'
8. Na próxima vez que João abre o app: /inicio mostra valor atualizado
```

**Tempo total (steps 3–5):** estimado 45–90 segundos

---

### 4.2 "Meu cliente PJ pediu nota fiscal" (V1.5)

```
1. João acessa /servicos → seleciona o serviço pago
2. No sheet de detalhes: botão "Emitir NFS-e" (visível apenas no plano Pro)
3. Confirma dados: tomador (cliente com CNPJ), valor, descrição, CNAE
4. Toca "Emitir"
5. Sistema cria registro em nfse_invoices com status = 'processing'
6. Chama API Focus NFe (POST /nfse)
7. Polling de status até 'issued' (ou timeout com status 'error')
8. Usuário vê PDF da nota + botão de download
9. Opção de enviar PDF via WhatsApp
```

---

### 4.3 "Preciso pagar o DAS"

```
1. João vê alerta no /inicio: "DAS de março vence em 5 dias"
2. Toca no alerta → /das
3. Vê a guia de março com status 'pending' e vencimento dia 20
4. Toca na guia → ação "Como pagar o DAS"
5. App exibe instrução: acessar gov.br/mei ou app do PGMEI
6. João paga pelo banco
7. Volta ao app, toca na guia novamente → "Marcar como pago"
8. Modal: confirma data de pagamento
9. Guia fica verde: status 'paid'
```

**Nota:** o app não processa o pagamento do DAS diretamente — orienta o MEI para o canal oficial (gov.br/mei).

---

### 4.4 "Quero ver quanto ganhei esse mês"

```
1. João abre o app → /inicio
2. Vê dois cartões: "Recebido: R$1.820,00" e "A receber: R$450,00"
3. Toca em "A receber" → navega para /servicos com filtro 'pending'
4. Vê lista de serviços pendentes com nomes dos clientes
5. Decide cobrar um deles → toca → "Cobrar" → /cobrar
```

---

## 5. Regras de Negócio MEI

### 5.1 Limite Anual de Faturamento

- **Limite:** R$81.000/ano calendário (Lei Complementar 128/2008, atualizada)
- **Alerta 80%:** quando `annual_revenue >= R$64.800`, exibir banner amarelo: "Você está em X% do limite MEI. Cuidado!"
- **Alerta 100%:** quando `annual_revenue >= R$81.000`, banner vermelho: "Você ultrapassou o limite MEI. Procure um contador urgente."
- **Cálculo:** soma de `services.amount` onde `status = 'paid'` e `service_date` no ano corrente
- **Constante:** `MEI_ANNUAL_LIMIT = 81000` em `lib/utils.ts`
- **Função:** `getMeiLimitPercentage(annualRevenue)` em `lib/utils.ts`

### 5.2 DAS — Documento de Arrecadação do Simples Nacional

- **Valor 2026:** R$75,60/mês (sujeito a reajuste anual com o salário mínimo)
  - INSS: 5% × salário mínimo 2026 (R$1.412) = R$70,60
  - ISS: R$5,00 (para MEI de serviços)
- **Vencimento:** dia 20 do mês seguinte à competência
  - Competência jan/2026 → vence 20/fev/2026
  - Competência dez/2026 → vence 20/jan/2027
- **Multa por atraso:** 0,33% ao dia + 20% fixo sobre o valor
- **Perda do MEI:** acúmulo de 12 meses sem pagamento pode gerar exclusão do SIMEI

### 5.3 DASN-SIMEI (Declaração Anual)

- **Obrigação:** todo MEI deve declarar o faturamento anual do ano anterior
- **Prazo:** 31 de maio do ano seguinte (ex: declarar 2025 até 31/mai/2026)
- **Alerta:** implementar em V1.5 — banner no app a partir de 01/abril notificando prazo

### 5.4 NFS-e — Nota Fiscal de Serviço Eletrônica

- **Obrigatoriedade:** para clientes PJ (CNPJ), a NFS-e pode ser exigida contratualmente
- **MEI pode emitir:** desde que o município esteja cadastrado no sistema nacional (700+ municípios via Focus NFe)
- **Custo:** ~R$0,65 por nota via Focus NFe (incluído no plano Pro)
- **ISSQN:** alíquota varia por município (2%–5% sobre o valor do serviço)
- **Prazo de emissão:** deve ser emitida no momento da prestação do serviço

### 5.5 Formas de Pagamento Aceitas pelo MEI

| Método | Código | Observação |
|---|---|---|
| Pix | `pix` | Mais usado — instantâneo |
| Cartão de crédito | `credit_card` | Via link MP |
| Boleto | `boleto` | Via link MP |
| Transferência | `transfer` | TED/DOC manual |
| Dinheiro | `cash` | Registrado manualmente |
| Outro | `other` | Campo livre |

---

## 6. Modelo de Assinatura

### 6.1 Planos

| Plano | Preço | NFS-e/mês | Relatórios | Observação |
|---|---|---|---|---|
| Trial | Gratuito | 5 | Não | 14 dias após cadastro |
| Básico | R$29,90/mês | 10 | Não | Após trial |
| Pro | R$49,90/mês | Ilimitada | Sim | Recomendado para quem tem PJ |

**Features por plano (JSONB em `plans.features`):**
```json
{
  "payment_links": true,
  "nfse": true,
  "das": true,
  "reports": false   // true apenas no Pro
}
```

### 6.2 Trial

- Duração: 14 dias a partir do primeiro login
- Limite: 5 NFS-e durante o período
- Sem cartão necessário para iniciar
- Ao expirar: exibir paywall bloqueando funcionalidades (exceto visualização)
- William pode estender manualmente via `/admin/usuarios` → ação `trial_extend`

### 6.3 Bloqueio por Inadimplência

- Status `past_due`: cobrança vencida, acesso degradado
  - Funções bloqueadas: gerar link de pagamento, emitir NFS-e
  - Funções mantidas: visualizar serviços, visualizar DAS
- Status `cancelled`: acesso somente leitura por 30 dias, depois desativação
- Desbloqueio: William atualiza manualmente para `active` após confirmar pagamento

### 6.4 Gerenciamento em V1

- William gerencia assinaturas diretamente pelo `/admin/usuarios`
- Sem cobrança automática — clientes pagam via transferência/Pix para a FLEX9 TECNOLOGIA
- Registro de pagamento = William atualiza `subscriptions.status` manualmente
- Todas as ações geram log em `admin_actions`

### 6.5 Gerenciamento em V2 (Stripe)

- Cobrança automatizada via Stripe Billing
- Webhook Stripe → atualiza `subscriptions.status` automaticamente
- Self-service: cliente atualiza plano pela própria tela de Configurações

---

## 7. Roadmap Priorizado

### V1 — Fundação (Status: Em produção)

**Objetivo:** MVP que resolve os 3 problemas principais de João sem fricção

| Feature | Prioridade | Status |
|---|---|---|
| Login Magic Link + Google | P0 | Feito |
| Dashboard com totais do mês | P0 | Feito |
| Registrar serviço | P0 | Feito |
| Lista de serviços | P0 | Feito |
| Link de pagamento MP + QR Code | P0 | Feito |
| Webhook MP (pagamento automático) | P0 | Feito |
| Controle DAS 12 meses | P0 | Feito |
| Cadastro de clientes | P1 | Feito |
| Configurações MEI + token MP | P1 | Feito |
| Admin panel (MRR, usuários, planos) | P1 | Feito |
| BottomNav mobile | P0 | Feito |

**Critério de conclusão V1:** João consegue registrar um serviço, gerar link MP e visualizar o DAS sem precisar de ajuda.

---

### V1.5 — NFS-e + Stripe + PWA (Próximo)

**Objetivo:** Habilitar João a conquistar clientes PJ e usar o app como PWA

| Feature | Prioridade | Estimativa |
|---|---|---|
| NFS-e via Focus NFe (emissão básica) | P0 | 3 sprints |
| Onboarding wizard (tela de boas-vindas) | P0 | 1 sprint |
| PWA (manifest, service worker, ícone) | P1 | 1 sprint |
| Stripe (link de pagamento básico) | P1 | 2 sprints |
| Alerta DASN-SIMEI (31/mai) | P1 | 0,5 sprint |
| Alerta limite MEI 80% | P1 | 0,5 sprint |
| Lista de NFS-e emitidas | P2 | 1 sprint |
| Cancelamento NFS-e | P2 | 1 sprint |

**Critério de entrada em V1.5:** V1 com > 50 usuários ativos, pelo menos 3 pedindo NFS-e.

---

### V2 — Escala + Relatórios + Cobrança Automática

**Objetivo:** crescer base de usuários, gerar receita recorrente automatizada

| Feature | Prioridade | Estimativa |
|---|---|---|
| Stripe Billing (assinatura automatizada) | P0 | 3 sprints |
| Relatório PDF mensal (exportar para contador) | P0 | 2 sprints |
| Recibo simples (sem NFS-e, para PF) | P1 | 1 sprint |
| Filtros avançados em serviços | P1 | 1 sprint |
| Gráficos de faturamento (recharts) | P2 | 1 sprint |
| Multi-idioma PT/ES | P3 | — |

---

### V3 — App Nativo + Automações

**Objetivo:** experiência nativa e automação para escalar sem suporte manual

| Feature | Prioridade | Notas |
|---|---|---|
| App nativo (React Native / Expo) | P0 | Requer validação de mercado em V2 |
| WhatsApp Bot (cobrança automática) | P1 | Depende de parceria Meta |
| Push notifications (DAS, pagamento) | P1 | Via FCM / OneSignal |
| Integração GOV.BR (PGMEI oficial) | P2 | Dependência regulatória |
| OCR de notas de fornecedor | P3 | — |

---

## 8. Métricas de Sucesso

### 8.1 Métricas de Ativação (D0–D7)

| Métrica | Meta V1 | Meta V1.5 |
|---|---|---|
| Taxa de conclusão do cadastro | > 80% | > 90% |
| Usuários que registram 1+ serviço em D1 | > 60% | > 70% |
| Usuários que geram 1+ link MP em D3 | > 40% | > 50% |
| Usuários que acessam DAS em D7 | > 30% | > 45% |

**Evento de ativação (North Star de ativação):** registrar 1 serviço + gerar 1 link de pagamento na mesma sessão.

### 8.2 Métricas de Retenção

| Métrica | Meta |
|---|---|
| Retenção D7 | > 50% |
| Retenção D30 | > 35% |
| Retenção D90 | > 20% |
| Sessões/semana por usuário ativo | > 3 |

**Proxy de engajamento:** usuário que marca DAS como pago todo mês tem alta probabilidade de reter.

### 8.3 Métricas de Receita

| Métrica | Meta 6 meses | Meta 12 meses |
|---|---|---|
| MRR | R$2.990 (100 usuários Básico) | R$14.950 (500 Básico) |
| Conversão trial → pago | > 25% | > 35% |
| Churn mensal | < 8% | < 5% |
| LTV médio (Básico) | R$358,80 (12m) | R$538,20 (18m) |

**CAC estimado (canais orgânicos):** R$0 em V1 (indicação). Meta: CAC < R$50 com Google Ads em V2.

### 8.4 Métricas de Produto

| Métrica | Meta |
|---|---|
| Tempo médio para gerar link de cobrança | < 60s |
| Taxa de erro no formulário de serviço | < 10% das submissões |
| NPS | > 50 |
| Crash rate | < 0,1% das sessões |
| Tempo de carregamento /inicio (SSR) | < 1,5s (LCP) |

### 8.5 North Star Metric

**Valor total pago via links gerados no flex9pag por mês (GMV)**

Justificativa: quando João recebe dinheiro via app, o app prova seu valor. GMV alto significa que João usa o app para cobrar, o que gera dados de serviços, que retém o usuário.

Meta 6 meses: GMV > R$100.000/mês  
Meta 12 meses: GMV > R$1.000.000/mês

---

*Documento gerado em abril/2026. Próxima revisão: início de V1.5.*
