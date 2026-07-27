import { processTelegramWebhook } from "@/lib/server/telegram";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const result = await processTelegramWebhook(request);
  return NextResponse.json({ ok: result.ok }, { status: result.status });
}
