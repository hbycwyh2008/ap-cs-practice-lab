import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AP CS Practice Lab",
  description: "AP Computer Science A FRQ practice platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
