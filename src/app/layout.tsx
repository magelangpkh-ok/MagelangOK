import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CandiSketch from "@/components/CandiSketch";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MagelangOK - Pusat Operasi PKH",
  description: "Portal Informasi Program Keluarga Harapan Kabupaten Magelang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Navigation />
        <CandiSketch />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
