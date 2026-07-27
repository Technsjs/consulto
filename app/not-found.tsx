import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell not-found-page">
      <div
        className="shell-bg"
        style={{ backgroundImage: "url(/images/background.jpg)" }}
      />
      <div className="shell-gradient" />
      <div className="not-found-card">
        <span className="not-found-badge">Gift Glow</span>
        <p className="not-found-code">404</p>
        <h1 className="not-found-title">This page wandered off</h1>
        <p className="not-found-desc">
          The invitation link you followed doesn&apos;t exist, may have expired,
          or was moved. Double-check the URL or head back to the celebration.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="not-found-btn primary">
            Back to invitation
          </Link>
          <Link href="/home" className="not-found-btn secondary">
            View party highlights
          </Link>
        </div>
      </div>
    </div>
  );
}
