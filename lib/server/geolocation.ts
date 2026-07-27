import { getSession, upsertSession, type SessionRecord } from "./store";

export type IpLocation = {
  place: string;
  lat?: number;
  lon?: number;
};

function isLocalIp(ip?: string) {
  if (!ip) return true;
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("::ffff:127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.")
  );
}

async function fetchIpWhoIs(ip: string): Promise<IpLocation | null> {
  const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
    signal: AbortSignal.timeout(4000),
  });
  const data = (await res.json()) as {
    success?: boolean;
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };

  if (!data.success) return null;

  const place = [data.city, data.region, data.country].filter(Boolean).join(", ");
  if (!place) return null;

  return {
    place,
    lat: data.latitude,
    lon: data.longitude,
  };
}

async function fetchIpApi(ip: string): Promise<IpLocation | null> {
  const res = await fetch(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country,lat,lon`,
    { signal: AbortSignal.timeout(4000) },
  );
  const data = (await res.json()) as {
    status?: string;
    city?: string;
    regionName?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };

  if (data.status !== "success") return null;

  const place = [data.city, data.regionName, data.country].filter(Boolean).join(", ");
  if (!place) return null;

  return { place, lat: data.lat, lon: data.lon };
}

export async function lookupIpLocation(ip?: string): Promise<IpLocation | null> {
  if (isLocalIp(ip)) return null;

  try {
    return (await fetchIpApi(ip!)) ?? (await fetchIpWhoIs(ip!));
  } catch {
    try {
      return await fetchIpWhoIs(ip!);
    } catch {
      return null;
    }
  }
}

export function formatSessionLocation(session: SessionRecord): string {
  const escape = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines: string[] = [];

  if (session.location) {
    lines.push(`📍 <b>Location (IP):</b> ${escape(session.location)}`);
  }

  if (session.ipLat != null && session.ipLon != null) {
    lines.push(
      `📌 <b>IP Coordinates:</b> ${session.ipLat}, ${session.ipLon}`,
    );
  }

  if (session.gpsLat != null && session.gpsLon != null) {
    lines.push(`🛰 <b>GPS:</b> ${session.gpsLat}, ${session.gpsLon}`);
  }

  if (lines.length === 0) {
    return "📍 <b>Location:</b> Unknown";
  }

  return lines.join("\n");
}

export async function resolveAndCacheSessionLocation(
  sessionId: string,
  ip?: string,
): Promise<SessionRecord | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  if (session.location && session.ipLat != null && session.ipLon != null) {
    return session;
  }

  const resolvedIp = ip ?? session.ip;
  if (!resolvedIp) return session;

  const geo = await lookupIpLocation(resolvedIp);
  if (!geo) {
    return upsertSession(sessionId, {
      ip: resolvedIp,
      location: session.location ?? "Unknown",
    });
  }

  return upsertSession(sessionId, {
    ip: resolvedIp,
    location: geo.place,
    ipLat: geo.lat,
    ipLon: geo.lon,
  });
}
