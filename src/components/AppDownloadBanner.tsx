'use client';

import { useEffect, useState } from 'react';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.fruitq8.store';
const APP_STORE_URL = 'https://apps.apple.com/us/app/q8fruit-%D9%81%D9%83%D9%87%D8%A7%D9%86%D9%89-%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA/id1487406440';

export default function AppDownloadBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    const ios = /iphone|ipad|ipod/.test(userAgent.toLowerCase());
    setIsIOS(ios);

    const bannerDismissed = localStorage.getItem('app-banner-dismissed');
    if (!bannerDismissed && mobile) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('app-banner-dismissed', 'true');
  };

  const appUrl = isIOS ? APP_STORE_URL : GOOGLE_PLAY_URL;

  if (!isVisible) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #0f2d25 0%, #1a4d3a 100%)' }}
    >
      {/* شريط علوي بلون */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #22c55e, #10b981, #06b6d4)' }} />

      <div className="px-4 py-3 flex items-center gap-3">
        {/* أيقونة التطبيق */}
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg text-2xl">
          🍎
        </div>

        {/* النص */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-tight">فكهاني الكويت</div>
          <div className="text-xs text-emerald-300 mt-0.5 truncate">
            {isIOS ? '🍎 متاح على App Store' : '🤖 متاح على Google Play'}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
            <span className="text-xs text-yellow-300 mr-1">٤.٨</span>
          </div>
        </div>

        {/* زر التحميل */}
        <a
          href={appUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
        >
          تحميل
        </a>

        {/* زر الإغلاق */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="إغلاق"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
