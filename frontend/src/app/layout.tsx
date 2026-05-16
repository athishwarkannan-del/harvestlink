import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import "leaflet/dist/leaflet.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HarvestLink — Demand-First Smart Agriculture Platform",
  description:
    "Connect communities, farmers, and urban growers through demand-first farming. HarvestLink is a smart local food ecosystem for hyperlocal urban farming partnerships and community food subscriptions.",
  keywords: [
    "agritech",
    "demand-first farming",
    "urban farming",
    "community food",
    "local food ecosystem",
    "HarvestLink",
  ],
  authors: [{ name: "HarvestLink" }],
  openGraph: {
    title: "HarvestLink — Grow What People Need",
    description:
      "Connecting communities, farmers, and urban growers through demand-first farming.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full font-poppins antialiased bg-bg-page text-text-primary overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
