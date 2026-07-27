import {
  assertConsent,
  ensureSession,
  getClientIp,
  getSessionId,
  jsonWithSession,
} from "@/lib/server/request";
import { resolveAndCacheSessionLocation } from "@/lib/server/geolocation";
import { upsertSession } from "@/lib/server/store";

type Body = {
  lat?: number;
  lon?: number;
};

function roundCoord(n: number) {
  return Math.round(n * 100_000) / 100_000;
}

export async function POST(request: Request) {
  const sessionId = await getSessionId();
  const denied = await assertConsent(sessionId);
  if (denied) return denied;

  const body = (await request.json()) as Body;
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await ensureSession(sessionId);

  await upsertSession(sessionId, {
    ip,
    userAgent,
    ...(typeof body.lat === "number" && typeof body.lon === "number"
      ? {
          gpsLat: roundCoord(body.lat),
          gpsLon: roundCoord(body.lon),
        }
      : {}),
  });

  await resolveAndCacheSessionLocation(sessionId, ip);

  return jsonWithSession({ success: true }, sessionId);
}
