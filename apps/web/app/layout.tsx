import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "KipWay · L'hébergement en route",
  description: "Trouvez un hôtel sur votre route en un clic. KipWay calcule votre trajet et affiche tous les hébergements disponibles sur le chemin.",
  icons: {
    icon: [
      { url: "/favicon-kipway.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-kipway.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon-kipway.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${nunito.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), sans-serif", background: "#F8F7F4", height: "100vh", overflow: "hidden" }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
