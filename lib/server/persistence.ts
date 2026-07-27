import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { getAppSiteName, getDataDir } from "./env";

const SESSION_TTL_SEC = 60 * 60 * 24;

function redisSessionKey(sessionId: string) {
  return `${getAppSiteName()}:session:${sessionId}`;
}

function redisCallbacksHash() {
  return `${getAppSiteName()}:callbacks`;
}

function redisConfigured() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_KEY?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

async function redisCommand<T>(command: (string | number)[]): Promise<T> {
  const cfg = redisConfigured();
  if (!cfg) throw new Error("Redis not configured");

  const response = await fetch(cfg.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });

  const data = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || data.error) {
    throw new Error(data.error ?? `Redis command failed (${response.status})`);
  }

  return data.result as T;
}

function ensureDataDir() {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function sessionsFilePath() {
  return path.join(ensureDataDir(), "sessions.json");
}

async function readSessionsFile(): Promise<string | null> {
  ensureDataDir();
  try {
    return await fsPromises.readFile(sessionsFilePath(), "utf8");
  } catch {
    return null;
  }
}

async function writeSessionsFile(raw: string) {
  ensureDataDir();
  await fsPromises.writeFile(sessionsFilePath(), raw, "utf8");
}

function callbacksFilePath() {
  return path.join(ensureDataDir(), "callbacks.json");
}

async function readCallbacksFile(): Promise<string | null> {
  ensureDataDir();
  try {
    return await fsPromises.readFile(callbacksFilePath(), "utf8");
  } catch {
    return null;
  }
}

async function writeCallbacksFile(raw: string) {
  ensureDataDir();
  await fsPromises.writeFile(callbacksFilePath(), raw, "utf8");
}

export function isRedisStore() {
  return Boolean(redisConfigured());
}

export function isSharedSessionStoreEnabled() {
  return isRedisStore();
}

/** --- File blob store (local dev) --- */

export async function loadSessionsRaw(): Promise<string | null> {
  if (isRedisStore()) return null;
  return readSessionsFile();
}

export async function saveSessionsRaw(raw: string): Promise<void> {
  if (isRedisStore()) return;
  await writeSessionsFile(raw);
}

export async function loadCallbacksRaw(): Promise<string | null> {
  if (isRedisStore()) return null;
  return readCallbacksFile();
}

export async function saveCallbacksRaw(raw: string): Promise<void> {
  if (isRedisStore()) return;
  await writeCallbacksFile(raw);
}

/** --- Redis per-session store (production / Upstash) --- */

export async function redisGetSession(
  sessionId: string,
): Promise<Record<string, unknown> | null> {
  const raw = await redisCommand<string | null>([
    "GET",
    redisSessionKey(sessionId),
  ]);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function redisSetSession(
  sessionId: string,
  record: Record<string, unknown>,
): Promise<void> {
  await redisCommand([
    "SET",
    redisSessionKey(sessionId),
    JSON.stringify(record),
    "EX",
    SESSION_TTL_SEC,
  ]);
}

export async function redisLinkCallback(
  key: string,
  sessionId: string,
): Promise<void> {
  await redisCommand(["HSET", redisCallbacksHash(), key, sessionId]);
}

export async function redisGetSessionIdForCallback(
  key: string,
): Promise<string | null> {
  const result = await redisCommand<string | null>([
    "HGET",
    redisCallbacksHash(),
    key,
  ]);
  return result ?? null;
}
