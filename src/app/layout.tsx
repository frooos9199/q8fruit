import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import BottomNav from "../components/BottomNav";
import AppDownloadBanner from "../components/AppDownloadBanner";
import Analytics from "../components/Analytics";
import { organizationSchema, websiteSchema, localBusinessSchema } from "@/lib/schema";
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
  title: {
    default: "فكهاني الكويت - Q8 Fruit | فواكه وخضار طازجة",
    template: "%s | Q8 Fruit - فكهاني الكويت",
  },
  description: "متجر الفواكه والخضار الأول في الكويت. توصيل سريع، أسعار منافسة، جودة عالية. اطلب الآن فواكه وخضروات طازجة مع توصيل مجاني للطلبات فوق 10 دينار كويتي.",
  keywords: [
    "فواكه الكويت",
    "خضار الكويت", 
    "توصيل فواكه",
    "Q8 Fruit",
    "فكهاني",
    "توصيل خضار الكويت",
    "فواكه طازجة",
    "خضروات طازجة",
    "متجر فواكه أونلاين",
    "Kuwait fruits delivery",
    "fresh fruits Kuwait",
    "vegetables delivery Kuwait",
  ],
  authors: [{ name: "Q8 Fruit Team" }],
  creator: "Q8 Fruit",
  publisher: "Q8 Fruit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "فكهاني الكويت",
    startupImage: [
      '/apple-splash-2048-2732.jpg',
      '/apple-splash-1668-2388.jpg',
    ],
  },
  openGraph: {
    type: "website",
    locale: "ar_KW",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "Q8 Fruit - فكهاني الكويت",
    title: "فكهاني الكويت - Q8 Fruit | أفضل فواكه وخضار في الكويت",
    description: "اطلب فواكه وخضروات طازجة من Q8 Fruit. توصيل سريع، جودة عالية، أسعار منافسة. خدمة عملاء ممتازة.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Q8 Fruit - فكهاني الكويت',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@q8fruit",
    creator: "@q8fruit",
    title: "فكهاني الكويت - Q8 Fruit",
    description: "متجر الفواكه والخضار الأول في الكويت - توصيل سريع وجودة عالية",
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'ar-KW': siteUrl,
      'en-US': `${siteUrl}/en`,
    },
  },
  other: {
    "apple-itunes-app": "app-id=YOUR_APP_ID, app-argument=https://q8fruit.com",
    "google-play-app": "app-id=com.q8fruit.app",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#10b981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        
        {/* Facebook Pixel */}
        {fbPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-blue-900 overflow-x-hidden min-h-screen`}
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      >
        <AppDownloadBanner />
        {children}
        <BottomNav />
        <Analytics />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
      </body>
    </html>
  );
}
