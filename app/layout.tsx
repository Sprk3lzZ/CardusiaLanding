import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  title: "Cardusia — l'IA éthique et responsable",
  description:
    "Cardusia, l'IA éthique et responsable. Inscrivez-vous à la newsletter pour être informé du lancement.",
  openGraph: {
    title: "Cardusia — l'IA éthique et responsable",
    description: "Inscrivez-vous pour être informé du lancement.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
