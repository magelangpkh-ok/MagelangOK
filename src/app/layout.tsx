import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CandiSketch from "@/components/CandiSketch";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const pressStart2P = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-press-start' });

export const metadata: Metadata = {
  title: "MagelangOK - Semua Ada",
  description: "Portal Informasi Program Keluarga Harapan Kabupaten Magelang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${pressStart2P.variable}`}>
        <Navigation />
        <CandiSketch />
        <div className="cyber-grid" />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
