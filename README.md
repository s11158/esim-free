# Esim.free

Official storefront for prepaid, data-only travel eSIM plans sold and supported by Esim.free.

## Local development

```bash
npm ci
npm run dev
```

## Production build

```bash
npm run lint
npm run build
```

Next.js exports the static site to `out/`. GitHub Actions deploys that directory to GitHub Pages. The custom domain is declared in `public/CNAME`.

## Payment Worker

The USDT TRC-20 order service is isolated in `worker/` and deploys to Cloudflare Workers with a D1 database. The public storefront remains on GitHub Pages.

```bash
cd worker
npm ci
npm run check
```
