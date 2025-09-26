import type { Metadata } from "next";
import { Providers } from "@/providers";
import { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: "Klozbuy - Social Marketplace",
  description:
    "Connect with local businesses and neighbors in your Nigerian community",
  openGraph: {
    title: "Klozbuy - Social Marketplace",
    description:
      "Connect with local businesses and neighbors in your Nigerian community",
    type: "website",
    url: "https://klozbuy.com",
    images: [
      {
        url: "https://klozbuy.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Klozbuy - Social Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@klozbuy",
    images: ["https://klozbuy.com/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
