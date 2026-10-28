# SweetFlow — Frontend

Interface web do **SweetFlow**, plataforma SaaS de gestão para confeitarias desenvolvida pela **Mastercode**.
Cada confeitaria (tenant) tem seu painel administrativo, seu catálogo público e seu próprio plano de assinatura.

> Repositório do backend: `saas-conf-backend` (Fastify + MySQL). Este projeto consome a API dele.

---

## Sumário

1. [Funcionalidades](#funcionalidades)
2. [Stack](#stack)
3. [Pré-requisitos](#pré-requisitos)
4. [Como rodar localmente](#como-rodar-localmente)
5. [Variáveis de ambiente](#variáveis-de-ambiente)
6. [Scripts](#scripts)
7. [Estrutura de pastas](#estrutura-de-pastas)
8. [Rotas da aplicação](#rotas-da-aplicação)
9. [Comunicação com a API](#comunicação-com-a-api)
10. [Fluxo de cadastro, contrato e pagamento](#fluxo-de-cadastro-contrato-e-pagamento)
11. [Editando o contrato](#editando-o-contrato)
12. [Deploy no Render](#deploy-no-render)
13. [Solução de problemas](#solução-de-problemas)
14. [Segurança](#segurança)
15. [Licença](#licença)

---

## Funcionalidades

**Painel da confeitaria (área logada)**
- Dashboard com indicadores e gráficos
- Pedidos, produtos, clientes e pagamentos
- Relatórios, auditoria e configurações
- Controle de desperdício, previsão de demanda, precificação, cardápio inteligente, recorrência e lucro
- Personalização visual do catálogo (design/tema)
- Integrações (Telegram, iFood, Zapier)
- Widget de chat com IA

**Catálogo público** (`/catalogo/:slug`)
- Vitrine da confeitaria, carrinho, checkout e área do cliente (login, perfil e meus pedidos)

**Assinatura (SaaS)**
- Cadastro da confeitaria com escolha de plano
- **Contrato da Mastercode** exibido antes do pagamento, com aceite só após leitura até o fim
- Pagamento por **Stripe**, **Mercado Pago** (PIX com QR Code na tela ou cartão) e **Pagar.me**
- Página de retorno do gateway que confirma o pagamento no servidor

**Super Admin** (`/super-admin`)
- Gestão de confeitarias, planos, assinaturas e receita da plataforma

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Rotas | React Router DOM |
| Estilo | Tailwind CSS |
| HTTP | Axios |
| Gráficos | Recharts |
| Ícones / UI | Lucide React, React Hot Toast |
| Datas / utilitários | date-fns, clsx |

---

## Pré-requisitos

- **Node.js 20 ou 22 (LTS)** e npm
- Backend do SweetFlow rodando (local ou no Render)

---

## Como rodar localmente

```bash
# 1. instalar dependências
npm install

# 2. criar o arquivo de ambiente
cp .env.example .env        # no Windows: copy .env.example .env

# 3. subir o servidor de desenvolvimento
npm run dev
```

A aplicação abre em **http://localhost:5173**.

Em desenvolvimento, o Vite redireciona `/api` para `http://localhost:3000` (veja `vite.config.ts`).
Por isso, **com o backend local rodando na porta 3000, não é preciso definir `VITE_API_URL`**.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Só em produção | URL do backend, **sem barra no final e sem `/api`**. Ex.: `https://seu-backend.onrender.com`. O código acrescenta `/api` sozinho. |
| `VITE_GROQ_API_KEY` | Não | Chave do Groq para o widget de chat com IA. |

> ⚠️ **Toda variável `VITE_*` é embutida no JavaScript publicado e fica visível para qualquer visitante.**
> Nunca coloque nelas chaves secretas de pagamento, senhas ou tokens privados. Chaves de gateway (Stripe, Mercado Pago, Pagar.me) pertencem **somente ao backend**.
> Se a chave do Groq for ilimitada, considere movê-la para o backend e fazer o chat passar por uma rota da API.

O arquivo `.env` real **não deve ir para o Git** (já está no `.gitignore`). O `.env.example` deve conter apenas placeholders, nunca valores reais.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarregamento (porta 5173) |
| `npm run build` | Verifica os tipos (`tsc`) e gera a pasta `dist` para produção |
| `npm run preview` | Serve o build de produção localmente para teste |

---

## Estrutura de pastas

```
saas-conf-frontend/
├── index.html
├── vite.config.ts            # build, chunks e proxy de desenvolvimento
├── tailwind.config.js
├── render.yaml               # configuração do Static Site no Render
├── public/
│   └── _redirects            # regra SPA: /* -> /index.html
└── src/
    ├── main.tsx              # ponto de entrada
    ├── App.tsx               # definição de todas as rotas
    ├── index.css
    ├── context/
    │   └── AuthContext.tsx   # sessão do usuário (login, logout, tenant)
    ├── components/
    │   ├── layout/           # Layout do painel (menu lateral, topo)
    │   ├── catalog/          # modais do catálogo (checkout, login do cliente, pedidos, perfil)
    │   └── ui/               # componentes reutilizáveis e AIChatWidget
    ├── data/
    │   └── saasContract.ts   # texto e condições do contrato da Mastercode
    ├── hooks/                # useCart, useCustomerAuth
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── OtherPages.tsx             # inclui Onboard (cadastro + contrato + pagamento)
    │   ├── SubscriptionReturnPage.tsx # retorno do gateway de pagamento
    │   ├── DashboardPage.tsx, OrdersPage.tsx, ProductsPage.tsx, ClientsPage.tsx, PaymentsPage.tsx
    │   ├── WastePage.tsx, DemandForecastPage.tsx, PricingPage.tsx, SmartMenuPage.tsx
    │   ├── RecurrencePage.tsx, ProfitPage.tsx, SuperAdminPage.tsx
    │   ├── catalog/CatalogPage.tsx
    │   ├── integrations/IntegrationsPage.tsx
    │   └── settings/DesignSettings.tsx
    ├── services/
    │   ├── api.ts                     # instância do Axios (token, tenant, refresh)
    │   ├── paymentGatewayService.ts   # checkout da assinatura e verificação de pagamento
    │   ├── catalogService.ts, customerAuthService.ts
    │   ├── integrationsService.ts, themeService.ts
    ├── types/                # tipos TypeScript (index.ts, theme.ts)
    └── utils/                # funções auxiliares (formatação, etc.)
```

---

## Rotas da aplicação

**Públicas**

| Rota | Página |
|---|---|
| `/login` | Login da confeitaria |
| `/onboard` | Cadastro da confeitaria, contrato e pagamento |
| `/assinatura/retorno` | Retorno do gateway após o pagamento |
| `/catalogo/:slug` | Catálogo público da confeitaria |

**Privadas** (exigem login; usam `PrivateRoute`)

`/dashboard`, `/orders`, `/products`, `/clients`, `/payments`, `/reports`, `/audit`, `/settings`,
`/waste`, `/demand`, `/pricing`, `/smart-menu`, `/recurrence`, `/profit`, `/design`, `/integrations`, `/super-admin`

`/` e qualquer rota desconhecida redirecionam para `/dashboard`.

---

## Comunicação com a API

O arquivo `src/services/api.ts` centraliza as chamadas:

- **Base URL:** `${VITE_API_URL}/api` em produção, ou `/api` em desenvolvimento (via proxy do Vite).
- **Cabeçalhos automáticos:** `Authorization: Bearer <accessToken>` e `X-Tenant-Slug: <slug da confeitaria>`.
- **Renovação de sessão:** ao receber `401`, tenta `POST /auth/refresh` com o `refreshToken`. Se falhar, limpa a sessão e envia para `/login`.
- **Dados guardados no `localStorage`:** `accessToken`, `refreshToken`, `user` e `tenantSlug`.

O backend é **multi-tenant**: toda chamada autenticada precisa identificar a confeitaria pelo cabeçalho `X-Tenant-Slug`. Isso já é feito automaticamente.

---

## Fluxo de cadastro, contrato e pagamento

Implementado em `OnboardPage` (`src/pages/OtherPages.tsx`):

1. **Dados:** o usuário informa os dados da confeitaria e escolhe o plano.
2. **Contrato:** o contrato da Mastercode (versão 2.0) é exibido. O aceite só é liberado depois de rolar até o fim. Há botão para imprimir/salvar em PDF. O aceite é registrado no backend com IP, data e versão.
3. **Pagamento:** o usuário escolhe o gateway.
   - **Mercado Pago + PIX:** o QR Code e o código "copia e cola" aparecem na própria tela. O sistema consulta o pagamento a cada 5 segundos até a confirmação.
   - **Mercado Pago + Cartão, Stripe e Pagar.me:** o navegador é redirecionado para a página de pagamento do gateway.
4. **Retorno:** o gateway devolve o cliente para `/assinatura/retorno`. A página **confirma o pagamento no servidor** (nunca confia apenas na URL), limpa os parâmetros da barra de endereços com `history.replaceState` e mostra o resultado: aprovado, pendente ou não concluído.
5. **E-mail:** o backend envia a confirmação de compra com o recibo em PDF.

**Planos:** Econômico, Standard e Premium. Ciclos de cobrança: mensal (sem fidelidade) e 12, 24 ou 36 meses, com 10%, 15% e 20% de desconto respectivamente.

---

## Editando o contrato

Todo o texto fica em `src/data/saasContract.ts`. No topo do arquivo há dois blocos de configuração:

- `MASTERCODE`: razão social, **CNPJ, endereço, e-mails e foro**. Preencha com os dados reais antes de publicar.
- `TERMS`: prazos e percentuais (arrependimento, multa de fidelidade, multa e juros de mora, SLA, aviso prévio etc.).

O texto das cláusulas se atualiza sozinho a partir desses valores.

Ao alterar o conteúdo de forma relevante, **aumente `CONTRACT_VERSION`** e mantenha o mesmo número em `contract.content.ts` no backend, para que cada aceite registre a versão correta.

> Recomenda-se revisão por advogado antes de usar o contrato em produção.

---

## Deploy no Render

O projeto é publicado como **Static Site**. A configuração está no `render.yaml`:

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Rewrite:** `/*` → `/index.html` (necessário para as rotas do React, como `/assinatura/retorno`, funcionarem ao abrir direto pela URL)
- **Variável de ambiente:** `VITE_API_URL` apontando para o backend, **sem `/api` no final**

Passo a passo:

1. Conecte o repositório no Render como **Static Site**.
2. Em **Environment**, defina `VITE_API_URL` (ex.: `https://seu-backend.onrender.com`).
3. Faça o deploy. Sempre que mudar uma variável `VITE_*`, é preciso **um novo deploy**, pois o valor é embutido no build.
4. No backend, configure `FRONTEND_URL` com o endereço deste site, para o CORS e os redirecionamentos de pagamento funcionarem.

---

## Solução de problemas

| Sintoma | Causa provável e solução |
|---|---|
| Chamadas indo para `/api/api/...` | `VITE_API_URL` foi definida **com** `/api` no final. Remova o `/api`. |
| Erro de CORS no navegador | O `FRONTEND_URL` do backend não bate com o endereço do frontend. Corrija no backend e reinicie. |
| `Tenant não identificado` | Falta o cabeçalho `X-Tenant-Slug`. Faça login de novo para o `tenantSlug` ser salvo. |
| 404 ao abrir uma rota direto pela URL | A regra de rewrite do SPA não está ativa. Confira `render.yaml` e `public/_redirects`. |
| Tela em branco após o deploy | Rode `npm run build` localmente e veja se há erro de TypeScript. |
| PIX não gera código | A conta do Mercado Pago precisa ter chave PIX, e o e-mail do pagador não pode ser o da conta vendedora. |
| Pagamento aprovado mas plano não ativa | O webhook do gateway não chegou ao backend. Veja o README do backend (seção de webhooks). |

---

## Segurança

- Nunca coloque chaves secretas (gateways, banco, JWT) em variáveis `VITE_*` nem no `.env.example`.
- Não versione o `.env`. Se uma chave real for commitada por engano, **revogue e gere outra imediatamente**: apagar o arquivo não remove a chave do histórico do Git.
- Os tokens de sessão ficam no `localStorage`. Mantenha as dependências atualizadas (`npm audit`) e evite inserir HTML não confiável nas páginas.

---

## Licença

A definir pelo proprietário do projeto. © Mastercode.
