export function isValidEmail(value: string) {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(trimmed);
}

/** Gmail sign-in accepts username, email, or phone — not always a full email. */
export function isValidGmailSignInId(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  if (trimmed.includes("@")) return isValidEmail(trimmed);
  return trimmed.length >= 1;
}
