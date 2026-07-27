import {
  assertConsent,
  ensureSession,
  getSessionId,
  jsonWithSession,
} from "@/lib/server/request";
import { resolveDecision } from "@/lib/server/store";

export async function GET() {
  const sessionId = await getSessionId();
  const denied = await assertConsent(sessionId);
  if (denied) {
    return jsonWithSession({ decision: null }, sessionId);
  }

  const session = await ensureSession(sessionId);
  const decision = await resolveDecision(session);

  return jsonWithSession({ decision }, sessionId);
}
