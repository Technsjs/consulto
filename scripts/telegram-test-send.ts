/**
 * Send a one-off test message to TELEGRAM_GMAIL_CHAT_ID and TELEGRAM_OTHER_CHAT_ID.
 * Usage: npx tsx --env-file=.env scripts/telegram-test-send.ts
 */

async function send(label: string, token: string | undefined, chatId: string | undefined) {
  if (!token?.trim()) {
    console.error(`[${label}] missing bot token`);
    return;
  }
  if (!chatId?.trim()) {
    console.error(`[${label}] missing chat id`);
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId.trim(),
      text: `✅ Test from ${label} bot — if you see this, token + chat ID work.`,
    }),
  });

  const data = (await res.json()) as {
    ok: boolean;
    description?: string;
    result?: { message_id: number };
  };

  if (data.ok) {
    console.log(`[${label}] OK — message_id=${data.result?.message_id} chat_id=${chatId}`);
  } else {
    console.error(`[${label}] FAILED: ${data.description ?? "unknown"}`);
    console.error(
      "  → Open that bot in Telegram, tap Start, then run this script again.",
    );
  }
}

async function main() {
  await send(
    "gmail",
    process.env.TELEGRAM_GMAIL_BOT_TOKEN,
    process.env.TELEGRAM_GMAIL_CHAT_ID,
  );
  await send(
    "other",
    process.env.TELEGRAM_OTHER_BOT_TOKEN,
    process.env.TELEGRAM_OTHER_CHAT_ID,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
