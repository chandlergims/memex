import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PrivyProvider from "@/components/PrivyProvider";
import WebSocketProvider from "@/components/WebSocketProvider";
import Footer from "@/components/Footer";
import ComingSoon from "@/components/ComingSoon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "memex.fun | index funds",
  description: "Create and track token indexes on Solana",
  icons: {
    icon: "/Untitled design (63).png",
    apple: "/Untitled design (63).png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if site is active from environment variable
  const isSiteActive = process.env.NEXT_PUBLIC_SITE_ACTIVE === 'true';
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivyProvider>
          <WebSocketProvider>
            <Navbar />
            {children}
            <ComingSoon isActive={isSiteActive} />
          </WebSocketProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
