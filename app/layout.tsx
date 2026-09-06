import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app"),
  title: "IZN | The Zen of Networking",
  description: "The Last Business Card You Will Ever Need. Instantly share your contact info right from your Apple or Samsung Wallet.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IZN",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfbfd",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

import NextTopLoader from 'nextjs-toploader';
import { ErrorTracking } from "@/components/error-tracking";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
            <body className="min-h-full flex flex-col bg-[#F5F5F7] text-[#1D1D1F] selection:bg-[#0071E3] selection:text-white font-sans">
        <NextTopLoader 
          color="#0071E3"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0071E3,0 0 5px #0071E3"
          zIndex={1600}
        />
        <ErrorTracking />
        {children}
      </body>
    </html>
  );
}
