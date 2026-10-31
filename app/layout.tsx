import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "GearGrid | Campus Marketplace",
  description: "Peer-to-peer campus marketplace for Pragati Engineering College",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased bg-slate-50 text-slate-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}