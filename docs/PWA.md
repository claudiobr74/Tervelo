# PWA

Quando compatível com Next.js App Router.

## Manifest

`src/app/manifest.ts` → `/manifest.webmanifest`

- nome **Tervelo**
- `display: standalone`
- `start_url: /app/today`
- ícones `public/icons/pwa-192.png` e `pwa-512.png`

## Service Worker

`public/sw.js` (registrado só em produção).

Cacheia:

- App Shell (`/app/today`)
- estáticos, fontes, ícones

Não cacheia:

- GraphQL / Nhost
- `/api/*`
- `/admin/*`
- dados privados como verdade

O SW **não** é o banco. Dados do atleta ficam no IndexedDB.

## Atualização

`skipWaiting` só por mensagem explícita. Com `SESSION_ACTIVE` / `resting`, **não** forçar reload. Mostrar depois: “Uma atualização do Tervelo está disponível.”

## Instalação

Prompt discreto “Adicionar Tervelo ao dispositivo”. Sem bloqueio e sem insistência.
