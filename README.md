# esim.free

Official storefront for prepaid, data-only travel eSIM plans sold and supported by esim.free.

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

