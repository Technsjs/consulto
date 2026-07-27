"use client";

export default function ServiceUnavailablePage() {
  return (
    <div className="shell su-page">
      <div
        className="shell-bg"
        style={{ backgroundImage: "url(/images/images.jpeg)" }}
      />
      <div className="shell-gradient" />
      <div className="su-card">
        <div className="su-icon">⚠️</div>
        <h1 className="su-title">Service Temporarily Unavailable</h1>
        <p className="su-desc">
          Our service is currently experiencing high traffic due to an
          unusually large number of visitors.
        </p>
        <p className="su-bold">
          For the best experience, please open the invitation using your desktop
          or laptop device.
        </p>
        <button
          type="button"
          className="su-btn"
          onClick={() => window.location.reload()}
        >
          <span className="su-btn-icon">↻</span>
          Try Again
        </button>
      </div>
    </div>
  );
}
