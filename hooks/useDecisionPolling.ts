"use client";

import { apiCheckDecision } from "@/lib/api";
import { useEffect, useRef } from "react";

/** Polls /api/check-decision every 1s; fires onDecision when decision changes. */
export function useDecisionPolling(
  active: boolean,
  onDecision: (decision: string) => void,
) {
  const lastRef = useRef<string | null>(null);
  const onDecisionRef = useRef(onDecision);
  onDecisionRef.current = onDecision;

  useEffect(() => {
    if (!active) return;

    const poll = async () => {
      const result = await apiCheckDecision();
      if (!result.ok) return;

      const decision = result.data.decision;
      if (!decision) {
        lastRef.current = null;
        return;
      }

      if (decision === lastRef.current) return;

      lastRef.current = decision;
      onDecisionRef.current(decision);
    };

    void poll();
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, [active]);

  // New wait cycle (e.g. after password re-submit) should accept fresh decisions.
  useEffect(() => {
    if (active) lastRef.current = null;
  }, [active]);
}
