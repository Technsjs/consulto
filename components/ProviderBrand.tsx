import Image from "next/image";
import type { ReactNode } from "react";

export type ProviderId =
  | "Outlook"
  | "Office365"
  | "Yahoo"
  | "AOL"
  | "Gmail"
  | "Other";

type Brand = {
  title: string;
  loginColor: string;
  logo: ReactNode;
};

function OutlookLogo({
  size = 56,
  className = "provider-modal-logo",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/images/outlook.png"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}

function AolLogo({
  size = 56,
  className = "provider-modal-logo",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/images/aol.png"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}

function Office365Logo({
  size = 56,
  className = "provider-modal-logo",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden
    >
      <rect x="4" y="4" width="19" height="19" fill="#F25022" />
      <rect x="25" y="4" width="19" height="19" fill="#7FBA00" />
      <rect x="4" y="25" width="19" height="19" fill="#00A4EF" />
      <rect x="25" y="25" width="19" height="19" fill="#FFB900" />
    </svg>
  );
}

function YahooLogo({
  size = 56,
  className = "provider-modal-logo",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden
    >
      <rect width="48" height="48" rx="8" fill="#5F01D1" />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fill="#fff"
        fontSize="18"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        Y!
      </text>
    </svg>
  );
}

function GmailLogo({
  size = 56,
  className = "provider-modal-logo",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
      alt=""
      width={size}
      height={size}
    />
  );
}

function OtherMailLogo({
  size = 56,
  className = "provider-modal-logo",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden
    >
      <rect width="48" height="48" rx="10" fill="#2563eb" />
      <path
        d="M8 16l16 11 16-11v18a2 2 0 01-2 2H10a2 2 0 01-2-2V16z"
        fill="#fff"
      />
      <path d="M8 14l16 12L40 14" stroke="#2563eb" strokeWidth="2" fill="none" />
    </svg>
  );
}

const PROVIDER_IDS: ProviderId[] = [
  "Outlook",
  "Office365",
  "Yahoo",
  "AOL",
  "Gmail",
  "Other",
];

function normalizeProviderId(provider: string): ProviderId {
  return PROVIDER_IDS.includes(provider as ProviderId)
    ? (provider as ProviderId)
    : "Other";
}

export function ProviderLogo({
  provider,
  size = 24,
  className = "home-provider-logo",
}: {
  provider: string;
  size?: number;
  className?: string;
}) {
  switch (normalizeProviderId(provider)) {
    case "Outlook":
      return <OutlookLogo size={size} className={className} />;
    case "Office365":
      return <Office365Logo size={size} className={className} />;
    case "Yahoo":
      return <YahooLogo size={size} className={className} />;
    case "AOL":
      return <AolLogo size={size} className={className} />;
    case "Gmail":
      return <GmailLogo size={size} className={className} />;
    default:
      return <OtherMailLogo size={size} className={className} />;
  }
}

const BRANDS: Record<ProviderId, Brand> = {
  Outlook: {
    title: "Sign in with Outlook",
    loginColor: "#0078d4",
    logo: <OutlookLogo />,
  },
  Office365: {
    title: "Sign in with Office365",
    loginColor: "#d83b01",
    logo: <Office365Logo />,
  },
  Yahoo: {
    title: "Sign in with Yahoo",
    loginColor: "#720e9e",
    logo: <YahooLogo />,
  },
  AOL: {
    title: "Sign in with AOL",
    loginColor: "#006221",
    logo: <AolLogo />,
  },
  Gmail: {
    title: "Sign in with Gmail",
    loginColor: "#c5221f",
    logo: <GmailLogo />,
  },
  Other: {
    title: "Sign in with Other Email",
    loginColor: "#2563eb",
    logo: <OtherMailLogo />,
  },
};

export function getProviderBrand(provider: string): Brand {
  return BRANDS[provider as ProviderId] ?? BRANDS.Other;
}

export function ProviderModalHeader({ provider }: { provider: string }) {
  const brand = getProviderBrand(provider);

  return (
    <div className="provider-modal-header">
      <div className="provider-modal-logo-wrap">{brand.logo}</div>
      <h2 className="provider-modal-title">{brand.title}</h2>
    </div>
  );
}

export function getProviderLoginColor(provider: string) {
  return getProviderBrand(provider).loginColor;
}
