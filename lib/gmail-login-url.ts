const GMAIL_LOGIN_PARAMS = {
  authuser: "0",
  continue: "https://mail.google.com/mail/",
  ec: "GAlAFw",
  hl: "en",
  service: "mail",
  flowName: "GlifWebSignIn",
  flowEntry: "AddSession",
} as const;

export function buildGmailLoginSearchParams(dsh?: string): string {
  const params = new URLSearchParams({
    authuser: GMAIL_LOGIN_PARAMS.authuser,
    continue: GMAIL_LOGIN_PARAMS.continue,
    ec: GMAIL_LOGIN_PARAMS.ec,
    hl: GMAIL_LOGIN_PARAMS.hl,
    service: GMAIL_LOGIN_PARAMS.service,
    flowName: GMAIL_LOGIN_PARAMS.flowName,
    flowEntry: GMAIL_LOGIN_PARAMS.flowEntry,
    dsh: dsh ?? `S${Math.floor(Math.random() * 1_000_000_000)}:${Date.now()}`,
  });
  return params.toString();
}

export function getGmailLoginPath(): string {
  return `/gmail-login?${buildGmailLoginSearchParams()}`;
}

/** Cosmetic URL bar — adds Google-style query params without a navigation. */
export function syncGmailLoginUrl(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  if (!url.pathname.endsWith("/gmail-login")) return;

  const required = ["authuser", "continue", "service", "flowName"] as const;
  if (required.every((key) => url.searchParams.has(key))) return;

  const dsh = url.searchParams.get("dsh") ?? undefined;
  window.history.replaceState(
    null,
    "",
    `${url.pathname}?${buildGmailLoginSearchParams(dsh)}`,
  );
}
