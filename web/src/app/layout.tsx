import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friends App - Multi-Platform Voice & Video Social Experience",
  description: "Connect with random friends, call celebrities with coins, discover nearby events, and access dedicated customer support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
