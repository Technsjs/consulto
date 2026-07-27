"use client";

import Countdown from "@/components/Countdown";
import { formatEventDateDisplay, formatEventTimeDisplay } from "@/lib/site";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="shell landing-page">
      <div
        className="shell-bg"
        style={{ backgroundImage: "url(/images/images.jpeg)" }}
      />
      <div className="shell-gradient landing-gradient" />
      <div className="landing-ambient" aria-hidden="true">
        <span className="landing-orb landing-orb--one" />
        <span className="landing-orb landing-orb--two" />
        <span className="landing-orb landing-orb--three" />
      </div>

      <div className="landing-content">
        <div className="landing-invite-card">
          <div className="landing-frame landing-frame--tl" aria-hidden="true" />
          <div className="landing-frame landing-frame--tr" aria-hidden="true" />
          <div className="landing-frame landing-frame--bl" aria-hidden="true" />
          <div className="landing-frame landing-frame--br" aria-hidden="true" />

          <span className="brand-pill brand-pill--light landing-badge">
            You&apos;re Invited
          </span>

          <h1 className="landing-title">
            <span className="landing-title-line">Honouring Life&apos;s</span>
            <span className="landing-title-accent">
              Beautiful
              <br className="landing-title-break" aria-hidden="true" />
              <em>Milestones</em>
            </span>
          </h1>

          <div className="landing-divider">
            <span className="landing-divider-gem" aria-hidden="true" />
          </div>

          <p className="landing-subtitle landing-subtitle--short">
            Join us for a memorable evening of warmth, laughter, and meaningful
            connections.
          </p>
          <p className="landing-subtitle landing-subtitle--full">
            Join us for an evening of warmth, laughter, and meaningful
            connections — crafted to celebrate the moments that matter most.
          </p>

          <p className="landing-subtitle landing-hint">
            For the richest experience, we recommend opening this invitation
            on your computer.
          </p>

          <button
            type="button"
            className="landing-cta-btn"
            onClick={() => router.push("/home")}
          >
            <span className="landing-cta-shine" aria-hidden="true" />
            <span className="landing-cta-label">View Party Highlights</span>
            <span className="landing-cta-arrow" aria-hidden="true">
              →
            </span>
          </button>

          <p className="landing-subtitle-small">
            Explore highlights, event details, and RSVP — all in one place.
          </p>
        </div>

        <div className="landing-lower landing-info-panel">
          <div className="landing-countdown-wrap">
            <p className="landing-countdown-heading">Countdown to celebration</p>
            <Countdown />
          </div>

          <div className="landing-details">
            <div className="detail-item">
              <span className="detail-icon-wrap" aria-hidden="true">
                <span className="detail-icon">📅</span>
              </span>
              <div className="detail-copy">
                <span className="detail-label">When</span>
                <span className="detail-value">{formatEventDateDisplay()}</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon-wrap" aria-hidden="true">
                <span className="detail-icon">📍</span>
              </span>
              <div className="detail-copy">
                <span className="detail-label">Where</span>
                <span className="detail-value">TBD</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon-wrap" aria-hidden="true">
                <span className="detail-icon">🕐</span>
              </span>
              <div className="detail-copy">
                <span className="detail-label">Time</span>
                <span className="detail-value">{formatEventTimeDisplay()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
