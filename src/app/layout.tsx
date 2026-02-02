import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import BottomNav from "../components/BottomNav";
import AppDownloadBanner from "../components/AppDownloadBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "فكهاني الكويت - Q8 Fruit | فواكه وخضار طازجة",
  description: "متجر الفواكه والخضار الأول في الكويت. توصيل سريع، أسعار منافسة، جودة عالية",
  keywords: "فواكه، خضار، الكويت، توصيل، Q8 Fruit، فكهاني",
  authors: [{ name: "NexDev" }],
  themeColor: "#10b981",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "فكهاني الكويت",
  },
  openGraph: {
    title: "فكهاني الكويت - Q8 Fruit",
    description: "متجر الفواكه والخضار الأول في الكويت",
    url: siteUrl,
    siteName: "Q8 Fruit",
    images: ["/og-image.jpg"],
    locale: "ar_KW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "فكهاني الكويت - Q8 Fruit",
    description: "متجر الفواكه والخضار الأول في الكويت",
    images: ["/twitter-image.jpg"],
  },
  other: {
    "apple-itunes-app": "app-id=1487406440, app-argument=https://q8fruit.com",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#10b981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-blue-900 overflow-x-hidden min-h-screen`}
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      >
        <AppDownloadBanner />
        {children}
        <BottomNav />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
