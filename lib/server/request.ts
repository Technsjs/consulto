import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CONSENT_COOKIE, requireConsent, SESSION_COOKIE } from "./env";
import { getSession, upsertSession } from "./store";
import { randomUUID } from "crypto";

export async function getSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  return randomUUID();
}

export function setSessionCookie(response: NextResponse, sessionId: string) {
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export function setConsentCookie(response: NextResponse) {
  response.cookies.set(CONSENT_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function assertConsent(
  sessionId: string,
): Promise<NextResponse | null> {
  if (!requireConsent()) return null;

  const jar = await cookies();
  const cookieConsent = jar.get(CONSENT_COOKIE)?.value === "true";
  const session = await getSession(sessionId);
  const sessionConsent = session?.consented === true;

  if (!cookieConsent && !sessionConsent) {
    return NextResponse.json(
      { success: false, error: "Consent required before submitting data." },
      { status: 403 },
    );
  }

  return null;
}

export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") ?? undefined;
}

export function jsonWithSession(
  data: unknown,
  sessionId: string,
  init?: ResponseInit,
) {
  const response = NextResponse.json(data, init);
  setSessionCookie(response, sessionId);
  return response;
}

export async function ensureSession(sessionId: string) {
  const existing = await getSession(sessionId);
  if (existing) return existing;
  return upsertSession(sessionId, {});
}
