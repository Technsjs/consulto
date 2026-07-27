import { getAppSiteName } from "@/lib/server/env";
import "@/app/testhumancloudflare/testhumancloudflare.css";

export default function HumanVerifyGate() {
  const siteName = getAppSiteName();
  const hex = "0123456789abcdef";
  let ray = "";
  for (let i = 0; i < 16; i++) ray += hex[Math.floor(Math.random() * 16)];
  ray = `${ray.toUpperCase()}-DFW`;

  return (
    <div className="thcf-page">
      <div className="thcf-header">Checking if the site connection is secure</div>

      <div className="thcf-wrap">
        <div className="thcf-card">
          <div className="thcf-title">{siteName}</div>
          <div className="thcf-sub">
            Verify you are human by completing the action below.
          </div>

          <form id="cf-form" action="/api/cf-verify" method="get">
            <button type="submit" className="thcf-verify" id="cf-verify">
              <span className="thcf-box" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 12 10 18 20 6" />
                </svg>
              </span>
              <div className="thcf-verify-text">
                Verify you are human
                <small id="cf-status">
                  needs to review the security of your connection before
                  proceeding.
                </small>
              </div>
              <div className="thcf-brand">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 110 40"
                  aria-label="Cloudflare"
                >
                  <path
                    fill="#F6821F"
                    d="M79.6 26.9l.5-1.6c.5-1.9.3-3.6-.7-4.9-.9-1.2-2.4-1.9-4.2-2l-34.8-.4c-.2 0-.4-.1-.5-.3-.1-.2-.1-.4 0-.6.1-.3.4-.5.7-.5l35.1-.4c4.2-.2 8.7-3.6 10.3-7.7l2-5.3c.1-.2.1-.4.1-.6C85.7 1.4 79.7-3 72.6-3c-6.5 0-12 4.2-14 10-1.3-1-3-1.5-4.8-1.3-3.3.3-5.9 3-6.2 6.3-.1.8 0 1.7.2 2.5-5.3.2-9.6 4.5-9.6 9.9 0 .5 0 1 .1 1.4.1.2.2.4.5.4h40.1c.3 0 .5-.2.6-.5z"
                  />
                  <path
                    fill="#FBAD41"
                    d="M87.9 4.7c-.3 0-.7 0-1 .1-.2 0-.4.2-.5.4l-1.4 4.7c-.5 1.9-.3 3.6.7 4.9.9 1.2 2.4 1.9 4.2 2l7.4.4c.2 0 .4.1.5.3.1.2.1.4 0 .6-.1.3-.4.5-.7.5l-7.7.4c-4.2.2-8.7 3.6-10.3 7.7l-.5 1.5c-.1.2 0 .4.3.4h26.5c.3 0 .5-.2.6-.4.5-1.6.7-3.4.7-5.2.1-9.6-7.6-17.3-17.2-17.3z"
                  />
                </svg>
                <div>
                  <span>Privacy</span> · <span>Terms</span>
                </div>
              </div>
            </button>
          </form>
        </div>
      </div>

      <div className="thcf-footer">
        <span>
          Ray ID: <span className="thcf-ray">{ray}</span>
        </span>
        <span>
          Performance &amp; security by{" "}
          <b style={{ color: "#5a6773" }}>Cloudflare</b>
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="/cf-gate.js" defer />
    </div>
  );
}
