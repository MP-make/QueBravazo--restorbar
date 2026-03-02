import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../src/app/globals.css";
import { LayoutWrapper } from "@/components/shared/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "¡Qué Bravazo! Restobar",
  description: "Restobar de comida rápida peruana — Broaster, hamburguesas, alitas BBQ, cervezas y más. Delivery en Lima.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}