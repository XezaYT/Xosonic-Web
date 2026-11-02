import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xosonic • The Next-Gen Open Sound Ecosystem",
  description: "High-performance web player, privacy-preserving live listener radar, and multi-platform sound hub by XrLabs.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  themeColor: "#00f0ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
