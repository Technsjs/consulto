"use client";

import { apiRecordConsent } from "@/lib/api";
import { hasConsent, setConsent } from "@/lib/consent";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  onConsented: () => void;
};

export default function ConsentGate({ onConsented }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasConsent()) {
      onConsented();
    } else {
      setVisible(true);
    }
  }, [onConsented]);

  if (!visible) return null;

  return (
    <div className="consent-banner">
      <h2>Important disclosure</h2>
      <p>
        <strong>
          Any data you enter on the following screens will be sent to this
          application&apos;s server and logged for demonstration purposes.
        </strong>{" "}
        This is not a real email provider login. Do not use your real account
        password.
      </p>
      <p>
        By clicking <strong>I Consent</strong>, you agree that inputs you
        provide may be stored on the server. Click <strong>Quit</strong> to
        leave without submitting anything.
      </p>
      {error && <p className="error">{error}</p>}
      <div className="consent-actions">
        <button
          type="button"
          className="consent-btn accept"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError("");
            const result = await apiRecordConsent();
            if (!result.ok) {
              setError(result.error);
              setLoading(false);
              return;
            }
            setConsent(true);
            setVisible(false);
            onConsented();
            setLoading(false);
          }}
        >
          {loading ? "Recording…" : "I Consent"}
        </button>
        <button
          type="button"
          className="consent-btn quit"
          onClick={() => router.push("/")}
        >
          Quit
        </button>
      </div>
    </div>
  );
}
