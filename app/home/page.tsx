import { cookies } from "next/headers";
import HumanVerifyGate from "@/components/HumanVerifyGate";
import { requireConsent } from "@/lib/server/env";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const jar = await cookies();
  const verified = jar.get("cf_verified")?.value === "1";

  if (!verified) {
    return <HumanVerifyGate />;
  }

  return <HomePageClient requireConsent={requireConsent()} />;
}
