import type { Metadata } from "next";
import { Bungee, Manrope } from "next/font/google";
import "./globals.css";

const bungee = Bungee({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crack's 'n' Laughs — RSVP",
  description: "RSVP for Crack's 'n' Laughs Comedy Club, every first Friday.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bungee.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
