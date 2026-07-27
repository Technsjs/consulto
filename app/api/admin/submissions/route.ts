import { getDataDir } from "@/lib/server/env";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Admin API not configured." },
      { status: 404 },
    );
  }

  const provided = request.headers.get("x-admin-key");
  if (provided !== apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = path.join(getDataDir(), "submissions.jsonl");
  if (!fs.existsSync(file)) {
    return NextResponse.json({ submissions: [] });
  }

  const lines = fs
    .readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean);

  const submissions = lines.map((line) => JSON.parse(line));
  return NextResponse.json({ submissions });
}
