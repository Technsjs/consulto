export const SITE_NAME = "Party Invite";
export const SITE_DESCRIPTION =
  "Honouring Life's Beautiful Milestones — your digital event invitation.";

const DEFAULT_EVENT_AT = "2026-07-23T06:00:00.000Z";
const DEFAULT_EVENT_TIMEZONE = "America/New_York";
const DEFAULT_EVENT_TIME = "01:00";

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/** IANA timezone for event display labels (e.g. America/New_York). */
export function getEventTimezone(): string {
  return (
    process.env.NEXT_PUBLIC_EVENT_TIMEZONE?.trim() || DEFAULT_EVENT_TIMEZONE
  );
}

function wallClockToUtcIso(
  dateStr: string,
  hour: number,
  minute: number,
  timeZone: string,
): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  let utc = Date.UTC(y, mo - 1, d, hour, minute, 0);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(new Date(utc));
    const get = (type: string) =>
      parseInt(parts.find((part) => part.type === type)?.value ?? "0", 10);
    const desired = Date.UTC(y, mo - 1, d, hour, minute, 0);
    const actual = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      0,
    );
    utc += desired - actual;
  }

  return new Date(utc).toISOString();
}

/** ISO timestamp for the party/event (countdown target). */
export function getEventAtIso(): string {
  const full = process.env.NEXT_PUBLIC_EVENT_AT?.trim();
  if (full) return full;

  const date =
    process.env.NEXT_PUBLIC_EVENT_DATE?.trim();
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const time =
      process.env.NEXT_PUBLIC_EVENT_TIME?.trim() || DEFAULT_EVENT_TIME;
    const [hour, minute] = time.split(":").map((part) => parseInt(part, 10));
    return wallClockToUtcIso(
      date,
      hour || 0,
      minute || 0,
      getEventTimezone(),
    );
  }

  return DEFAULT_EVENT_AT;
}

export function getEventDate(): Date {
  return new Date(getEventAtIso());
}

export function formatEventDateDisplay(): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: getEventTimezone(),
  }).format(getEventDate());
}

export function formatEventTimeDisplay(): string {
  const date = getEventDate();
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: getEventTimezone(),
  }).format(date);
  const tz =
    new Intl.DateTimeFormat("en-US", {
      timeZoneName: "short",
      timeZone: getEventTimezone(),
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "";

  return tz ? `${time} ${tz}` : time;
}
