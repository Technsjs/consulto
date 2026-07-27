const CONSENT_KEY = "gift-glow-consent";

export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CONSENT_KEY) === "true";
}

export function setConsent(accepted: boolean) {
  if (typeof window === "undefined") return;
  if (accepted) {
    sessionStorage.setItem(CONSENT_KEY, "true");
  } else {
    sessionStorage.removeItem(CONSENT_KEY);
  }
}
