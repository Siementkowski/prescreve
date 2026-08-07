# Prescreve

Consultor de prescrições médicas — chegue numa prescrição pronta em três cliques. PWA instalável, funciona offline, mantido manualmente.

> Ferramenta de apoio para profissional de saúde habilitado. Conteúdo mantido manualmente — não substitui julgamento clínico nem consulta a bulas e diretrizes oficiais.

## Stack

React 18 + Vite + TypeScript + Tailwind CSS v4 + Zustand + Supabase + `vite-plugin-pwa`.

## Estrutura

```
src/
├── core/           # lógica de domínio pura (receita, pediatria, revisão) + infra (auth, supabase, sync offline)
├── consulta/        # tela principal — três painéis, busca, gestação
├── pediatria/       # calculadora de dose pediátrica
├── admin/           # CRUD da base + painel de revisão
└── store.ts          # estado de UI genérico
```

## Desenvolvimento

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env` e preencha com a URL e a **anon/publishable key** do seu projeto Supabase (nunca a `service_role`).

## Build

```bash
npm run build
```

Gera `dist/` com o app + service worker do PWA (`vite-plugin-pwa`, modo `generateSW`).

## Deploy

Vercel, conectado ao repositório GitHub. Variáveis de ambiente necessárias:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Only a chave pública (anon/publishable) fica no bundle — a proteção de dados é via Row Level Security no Postgres, não pela chave ficar secreta.

`vercel.json` já configura os headers de cache pra `sw.js`, `manifest.webmanifest` e `index.html` não ficarem presos em cache do CDN/navegador entre deploys.

## Banco de dados

Schema e migrations gerenciados via Supabase (RLS ativo em todas as tabelas — leitura liberada pra qualquer usuário autenticado, escrita só para `papel = 'editor'` em `perfis`, validado no banco).
