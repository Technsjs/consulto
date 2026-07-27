export function isGmailProvider(provider?: string | null): boolean {
  const normalized = (provider ?? "").trim().toLowerCase();
  return normalized === "gmail" || normalized === "google";
}
