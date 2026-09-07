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

## Payment and fulfilment Worker

The order service is isolated in `worker/` and deploys to Cloudflare Workers with a D1 database. The public storefront remains on GitHub Pages.

What happens after a customer pays (all automatic, once a minute):

1. `reconcilePayments` matches a confirmed USDT TRC-20 transfer to the order by its unique amount.
2. `fulfillOrder` buys the profile from the supplier named in the catalogue row (`source` column: `esimerge` or `stellar`) with our order id as idempotency key. A temporary failure (empty wallet, 5xx) keeps the order in `manual_required` and it is retried every tick; a permanent rejection parks it as `failed` and alerts the owner on Telegram.
3. `deliverOrder` emails the QR code, the LPA string, the manual SM-DP+ pair and the one-tap iPhone link through Resend, then marks `email_status = sent`. The checkout page keeps polling until both steps are done.

Manual fallback for a profile bought by hand (supplier dashboard or affiliate link):

```bash
curl -X POST https://<worker>/api/admin/orders/<order id>/esim \
  -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" \
  -d '{"qr_code":"LPA:1$smdp.example.com$CODE","iccid":"8910..."}'
```

`POST /api/admin/orders/<id>/retry` re-queues a parked order after a wallet top-up.

Secrets (set with `wrangler secret put`): `ORDER_HMAC_SECRET`, `ESIMERGE_KEY`, `RESEND_API_KEY`, `ADMIN_TOKEN`; optional `STELLAR_WHOLESALE_KEY` (with `STELLAR_WHOLESALE_BASE` in `wrangler.jsonc`), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. `MAIL_FROM` must be on a domain verified in Resend. Apply migrations with `npm run db:migrate:remote`.

```bash
cd worker
npm ci
npm run check
```

## Catalogue

`public/data/catalog.csv` is built from every supplier the Worker can order from; when two suppliers sell the same plan shape the cheaper one is kept, and the price in the file is the sale price.

```bash
node scripts/build-catalog.mjs              # eSimerge + Stellar Wholesale, credentials from worker/.dev.vars
node scripts/probe-stellar-order.mjs --list # cheapest Stellar plans
node scripts/probe-stellar-order.mjs --plan <uuid>   # one real test order, prints the raw response
```
