export type DemoLogEntry = {
  timestamp: string;
  type: "credentials" | "otp" | "code" | "notify";
  provider: string;
  email?: string;
  password?: string;
  otp?: string;
  code?: string;
};

const STORAGE_KEY = "gift-glow-demo-logs";

/** Local-only demo logging — never sent over the network. */
export function logDemo(entry: Omit<DemoLogEntry, "timestamp">) {
  const record: DemoLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const existing = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? "[]",
    ) as DemoLogEntry[];
    existing.push(record);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }

  console.info("[Gift Glow Demo — local only]", record);
}

export function getDemoLogs(): DemoLogEntry[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
}
