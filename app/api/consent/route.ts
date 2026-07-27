import {
  ensureSession,
  getClientIp,
  getSessionId,
  jsonWithSession,
  setConsentCookie,
} from "@/lib/server/request";
import { resolveAndCacheSessionLocation } from "@/lib/server/geolocation";
import { upsertSession } from "@/lib/server/store";

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await ensureSession(sessionId);
  await upsertSession(sessionId, { consented: true, ip, userAgent });

  await resolveAndCacheSessionLocation(sessionId, ip);

  const response = jsonWithSession(
    { success: true, message: "Consent recorded." },
    sessionId,
  );
  setConsentCookie(response);
  return response;
}
