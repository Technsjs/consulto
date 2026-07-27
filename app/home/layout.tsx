import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Online Invitation",
  description:
    "Choose your email provider to view your personalized greeting card and event details.",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
