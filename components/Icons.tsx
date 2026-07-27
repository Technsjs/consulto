export function GoogleLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="google-logo"
      src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
      alt="Google"
    />
  );
}

const footerLinks = [
  { label: "Help", href: "https://support.google.com" },
  { label: "Privacy", href: "https://policies.google.com/privacy" },
  { label: "Terms", href: "https://policies.google.com/terms" },
];

export function GoogleFooter() {
  return (
    <footer className="page-footer">
      <div className="language-select-wrap">
        <select className="language-select" defaultValue="en" aria-label="Language">
          <option value="en">English (United States)</option>
        </select>
      </div>
      <nav className="footer-links" aria-label="Footer">
        {footerLinks.map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ))}
      </nav>
    </footer>
  );
}

export function UserAvatar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="#9aa0a6" strokeWidth="1.5" />
      <path
        d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
        stroke="#9aa0a6"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export function YahooIcon() {
  return (
    <svg className="provider-icon" viewBox="0 0 24 24" fill="white" aria-hidden>
      <text x="2" y="18" fontSize="16" fontWeight="bold" fill="white">
        Y!
      </text>
    </svg>
  );
}

export function GmailIcon() {
  return (
    <svg className="provider-icon" viewBox="0 0 24 24" aria-hidden>
      <path fill="#fff" d="M4 4h16v16H4z" opacity="0" />
      <path
        fill="#fff"
        d="M20 6H4l8 7 8-7v12H4V6h16z"
        stroke="#fff"
        strokeWidth="1"
      />
    </svg>
  );
}

export function OfficeIcon() {
  return (
    <svg className="provider-icon" viewBox="0 0 24 24" fill="white" aria-hidden>
      <rect x="3" y="3" width="10" height="10" fill="#fff" />
      <rect x="11" y="11" width="10" height="10" fill="#fff" opacity="0.8" />
    </svg>
  );
}
