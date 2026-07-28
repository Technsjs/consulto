"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="consult">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap");

        .consult {
          --ink: #0f1c18;
          --fog: rgba(244, 247, 245, 0.92);
          --mist: rgba(244, 247, 245, 0.72);
          --line: rgba(244, 247, 245, 0.28);
          --accent: #c8a45a;
          --accent-soft: rgba(200, 164, 90, 0.35);
          position: relative;
          min-height: 100dvh;
          overflow: hidden;
          color: var(--fog);
          font-family: "DM Sans", sans-serif;
          background: var(--ink);
        }

        .consult-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              105deg,
              rgba(15, 28, 24, 0.92) 0%,
              rgba(15, 28, 24, 0.72) 42%,
              rgba(15, 28, 24, 0.45) 100%
            ),
            url(/images/card.jpg) center / cover no-repeat;
          transform: scale(1.04);
          animation: consult-bg-drift 18s ease-in-out infinite alternate;
        }

        .consult-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.12) 0.6px,
            transparent 0.6px
          );
          background-size: 3px 3px;
          mix-blend-mode: soft-light;
        }

        .consult-shell {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100dvh;
          padding: clamp(1.5rem, 5vw, 4rem);
          max-width: 42rem;
        }

        .consult-brand {
          margin: 0 0 1.75rem;
          font-size: clamp(0.95rem, 1.6vw, 1.1rem);
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--accent);
          opacity: 0;
          animation: consult-rise 0.9s ease forwards 0.1s;
        }

        .consult-title {
          margin: 0;
          font-family: "Instrument Serif", Georgia, serif;
          font-size: clamp(3.2rem, 9vw, 5.6rem);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.02em;
          opacity: 0;
          animation: consult-rise 1s ease forwards 0.25s;
        }

        .consult-title em {
          font-style: italic;
          color: #f3e7c8;
        }

        .consult-copy {
          margin: 1.5rem 0 0;
          max-width: 28rem;
          font-size: clamp(1rem, 2.2vw, 1.15rem);
          line-height: 1.65;
          color: var(--mist);
          opacity: 0;
          animation: consult-rise 1s ease forwards 0.4s;
        }

        .consult-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem 1.25rem;
          margin-top: 2.25rem;
          opacity: 0;
          animation: consult-rise 1s ease forwards 0.55s;
        }

        .consult-cta {
          appearance: none;
          border: 0;
          border-radius: 999px;
          padding: 0.95rem 1.6rem;
          background: linear-gradient(135deg, #d4b36a, #b8923f);
          color: #1a1408;
          font: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
        }

        .consult-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.34);
        }

        .consult-cta:focus-visible {
          outline: 2px solid #f3e7c8;
          outline-offset: 3px;
        }

        .consult-note {
          margin: 0;
          font-size: 0.9rem;
          color: var(--mist);
        }

        .consult-rule {
          width: 3.5rem;
          height: 1px;
          margin: 1.35rem 0 0;
          background: linear-gradient(90deg, var(--accent), transparent);
          opacity: 0;
          animation: consult-rise 1s ease forwards 0.35s;
        }

        @keyframes consult-rise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes consult-bg-drift {
          from {
            transform: scale(1.04) translate3d(0, 0, 0);
          }
          to {
            transform: scale(1.08) translate3d(-1.5%, -1%, 0);
          }
        }

        @media (max-width: 640px) {
          .consult-shell {
            justify-content: flex-end;
            padding-bottom: 3.5rem;
          }

          .consult-bg {
            background:
              linear-gradient(
                180deg,
                rgba(15, 28, 24, 0.35) 0%,
                rgba(15, 28, 24, 0.78) 48%,
                rgba(15, 28, 24, 0.96) 100%
              ),
              url(/images/card.jpg) center / cover no-repeat;
          }

          .consult-actions {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="consult-bg" aria-hidden="true" />
      <div className="consult-grain" aria-hidden="true" />

      <div className="consult-shell">
        <p className="consult-brand">Sincere</p>
        <h1 className="consult-title">
          Join Your
          <br />
          <em>Consultation Call</em>
        </h1>
        <div className="consult-rule" aria-hidden="true" />
        <p className="consult-copy">
          You&apos;ve been personally invited to join us. Sign in to access your
          meeting details and join the call.
        </p>
        <div className="consult-actions">
          <button
            type="button"
            className="consult-cta"
            onClick={() => router.push("/home")}
          >
            Continue to Sign In
          </button>
          <p className="consult-note">Secure access · One-on-one session</p>
        </div>
      </div>
    </main>
  );
}
