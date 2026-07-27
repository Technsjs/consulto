/**
 * Register Telegram webhooks for production (Vercel).
 * Run: npm run telegram:webhook
 */
import {
  getTelegramBotToken,
  listEnabledTelegramChannels,
  type TelegramChannel,
} from "../lib/server/env";
import { getSiteUrl } from "../lib/site";

async function registerWebhook(channel: TelegramChannel) {
  const token = getTelegramBotToken(channel);
  const base = getSiteUrl().replace(/\/$/, "");
  const webhookUrl = `${base}/api/telegram/webhook/${channel}`;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  const params = new URLSearchParams({ url: webhookUrl });
  if (secret) params.set("secret_token", secret);

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?${params}`,
  );
  const data = (await res.json()) as { ok: boolean; description?: string };

  if (data.ok) {
    console.log(`Webhook registered (${channel}):`);
    console.log(`  ${webhookUrl}`);
    if (secret) console.log(`  secret_token: ${secret}`);
  } else {
    console.error(`setWebhook failed (${channel}):`, data.description ?? "unknown");
    process.exit(1);
  }
}

async function main() {
  const channels = listEnabledTelegramChannels();
  if (channels.length === 0) {
    console.error(
      "Set Telegram env vars in .env (Gmail and/or Other bot token + chat id).",
    );
    process.exit(1);
  }

  for (const channel of channels) {
    await registerWebhook(channel);
  }

  console.log("\nProduction Telegram buttons will use these URLs.");
  console.log("Do NOT run telegram:poll with TELEGRAM_DELETE_WEBHOOK=true on production.");
}

main();
