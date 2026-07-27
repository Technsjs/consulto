import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Unavailable",
  description: "The service is temporarily unavailable. Please try again later.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ServiceUnavailableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
