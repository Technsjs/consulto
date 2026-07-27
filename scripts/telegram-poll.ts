/**
 * LOCAL DEV ONLY — polls Telegram for button clicks.
 * Does NOT delete the production webhook unless TELEGRAM_DELETE_WEBHOOK=true.
 *
 * Run: npm run telegram:poll
 */
import {
  getDataDir,
  getTelegramBotToken,
  listEnabledTelegramChannels,
  type TelegramChannel,
} from "../lib/server/env";
import { isRedisStore } from "../lib/server/persistence";
import { handleTelegramUpdate, type TelegramUpdate } from "../lib/server/telegram";

async function deleteWebhook(token: string, label: string) {
  const res = await fetch(
    `https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`,
  );
  const data = (await res.json()) as { ok: boolean; description?: string };
  if (data.ok) {
    console.log(`Webhook removed for ${label} bot (local polling).`);
  } else {
    console.warn(`Could not delete webhook (${label}):`, data.description ?? "unknown");
  }
}

async function pollChannel(channel: TelegramChannel) {
  const token = getTelegramBotToken(channel);
  let offset = 0;

  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?timeout=30&offset=${offset}`,
      );
      const data = (await res.json()) as {
        ok: boolean;
        result: TelegramUpdate[];
        description?: string;
      };

      if (!data.ok) {
        console.error(`getUpdates failed (${channel}):`, data.description ?? "unknown");
        if (data.description?.includes("webhook")) {
          console.error(
            "Tip: A webhook is active — Telegram won't send updates to poll.",
          );
          console.error(
            "Use TELEGRAM_DELETE_WEBHOOK=true npm run telegram:poll for local-only,",
          );
          console.error("or test production via webhook (npm run telegram:webhook).");
        }
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      if (data.result.length > 0) {
        for (const update of data.result) {
          offset = (update.update_id ?? 0) + 1;
          await handleTelegramUpdate(update, channel);
          console.log(`Handled ${channel} update ${update.update_id ?? "?"}`);
        }
      }
    } catch (err) {
      console.error(`Poll error (${channel}):`, err);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

async function poll() {
  const channels = listEnabledTelegramChannels();
  if (channels.length === 0) {
    console.error(
      "Set Telegram env vars in .env (Gmail and/or Other bot token + chat id).",
    );
    process.exit(1);
  }

  if (process.env.TELEGRAM_DELETE_WEBHOOK === "true") {
    for (const channel of channels) {
      await deleteWebhook(getTelegramBotToken(channel), channel);
    }
    console.warn(
      "WARNING: Webhooks deleted — production (Vercel) buttons will NOT work until you run npm run telegram:webhook",
    );
  } else {
    console.log("Keeping existing webhooks (production stays live).");
    console.log(
      "For local-only testing, run: TELEGRAM_DELETE_WEBHOOK=true npm run telegram:poll",
    );
  }

  console.log("\nTelegram polling started (local dev).");
  console.log(`Bots: ${channels.join(", ")}`);
  console.log(`Session data: ${getDataDir()}`);
  console.log(
    isRedisStore()
      ? "Redis: enabled"
      : "Redis: not set — using local files (test on localhost:3000)",
  );
  console.log("\nPress Ctrl+C to stop.\n");

  await Promise.all(channels.map((channel) => pollChannel(channel)));
}

poll();
