'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// ضع Pixel ID من: https://ads.snapchat.com → Assets → Pixels
const SNAPCHAT_PIXEL_ID = process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID || '';

declare global {
  interface Window {
    snaptr: (...args: unknown[]) => void;
  }
}

export function trackSnapEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.snaptr) {
    window.snaptr('track', event, params || {});
  }
}

export default function SnapchatPixel() {
  useEffect(() => {
    if (!SNAPCHAT_PIXEL_ID) return;
    if (typeof window !== 'undefined' && window.snaptr) {
      window.snaptr('init', SNAPCHAT_PIXEL_ID, {});
      window.snaptr('track', 'PAGE_VIEW');
    }
  }, []);

  if (!SNAPCHAT_PIXEL_ID) return null;

  return (
    <>
      <Script id="snapchat-pixel" strategy="afterInteractive">
        {`
          (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
          {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
          a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
          r.src=n;var u=t.getElementsByTagName(s)[0];
          u.parentNode.insertBefore(r,u);})(window,document,
          'https://sc-static.net/scevent.min.js');
        `}
      </Script>
    </>
  );
}
