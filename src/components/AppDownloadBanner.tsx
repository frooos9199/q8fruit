'use client';

import { useEffect, useState } from 'react';

export default function AppDownloadBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // تحقق من نوع الجهاز
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const ios = /iphone|ipad|ipod/.test(userAgent.toLowerCase());

      setIsMobile(mobile);
      setIsIOS(ios);

      // تحقق من عدم وجود حفظ سابق لإغلاق البنر
      const bannerDismissed = localStorage.getItem('app-banner-dismissed');
      if (!bannerDismissed && mobile) {
        // أظهر البنر بعد 2 ثانية
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    checkDevice();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('app-banner-dismissed', 'true');
  };

  const handleDownload = () => {
    const appUrl = isIOS
      ? 'https://apps.apple.com/us/app/q8fruit-%D9%81%D9%83%D9%87%D8%A7%D9%86%D9%89-%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA/id1487406440'
      : 'https://play.google.com/store/apps/details?id=com.fruitq8mobile'; // أضف رابط Google Play عندما يكون متاح

    window.location.href = appUrl;
  };

  if (!isVisible || !isMobile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-full px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="font-bold text-sm">📱 تطبيق فكهاني الكويت</div>
          <div className="text-xs text-green-100 mt-1">احصل على تجربة أفضل مع التطبيق الأصلي</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDownload}
            className="bg-white text-green-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            تحميل
          </button>

          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-1 rounded transition-colors"
            aria-label="إغلاق"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
