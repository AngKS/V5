import type { Metadata } from "next";
import { site } from "@/content/site";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "./globals.css";
import "@/components/discoveries.css";
import { PandaIntro } from "@/components/panda-intro";
import { MotionProvider } from "@/components/motion";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s | Kah Shin Ang" },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: "Kah Shin Ang", url: site.url }],
  creator: "Kah Shin Ang",
  category: "technology",
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_SG",
    type: "website",
    images: [
      {
        url: site.image,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: site.imageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [{ url: site.image, alt: site.imageAlt }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="application/json"
          href="/api/agent"
          title="Public portfolio data for agents"
        />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="Portfolio information for AI agents"
        />
      </head>
      <body>
        <MotionProvider>
          <PandaIntro>{children}</PandaIntro>
        </MotionProvider>
      </body>
    </html>
  );
}
