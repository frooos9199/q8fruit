import type { Metadata } from "next";
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
  title: "فكهاني الكويت - أطيب الفواكه والخضار",
  description: "متجرك المفضل للفواكه والخضار الطازجة في الكويت. جودة عالية وأسعار منافسة مع خدمة توصيل سريعة",
  keywords: "فواكه، خضار، الكويت، توصيل، طازج، صحي",
  authors: [{ name: "NexDev" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-900 dark:to-blue-900`}
      >
        {children}
      </body>
    </html>
  );
}
