import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PrivyProvider from "@/components/PrivyProvider";
import WebSocketProvider from "@/components/WebSocketProvider";
import LiveTickerBar from "@/components/LiveTickerBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bonks",
  description: "Create and track token indexes on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivyProvider>
          <WebSocketProvider>
            <Navbar />
            <LiveTickerBar />
            {children}
          </WebSocketProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
