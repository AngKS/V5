import type { Metadata } from "next";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "./globals.css";
import "@/components/discoveries.css";
import { PandaIntro } from "@/components/panda-intro";
import { MotionProvider } from "@/components/motion";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.thatasiandude.com"),
  title: "Kah Shin — AI, curiosity & things that work",
  description:
    "Exploring computer vision, explainable AI, and infrastructure. Selected projects and notes by Kah Shin.",
  openGraph: {
    title: "Kah Shin — AI, curiosity & things that work",
    description: "A portfolio of experiments, ideas, and engineering.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>
          <PandaIntro>{children}</PandaIntro>
        </MotionProvider>
      </body>
    </html>
  );
}
