import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gmail",
  description: "Sign in with your Google Account to continue to Gmail.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GmailLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
