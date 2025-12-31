"use client";
import { useState, useEffect } from "react";

// Cache للصور المحملة
const imageCache = new Map<string, string>();

export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      const promises = urls.map(async (url) => {
        if (imageCache.has(url)) {
          setLoadedImages(prev => new Set([...prev, url]));
          return;
        }

        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCache.set(url, url);
            setLoadedImages(prev => new Set([...prev, url]));
            resolve();
          };
          img.onerror = () => resolve(); // تجاهل الأخطاء
          img.src = url;
        });
      });

      await Promise.all(promises);
    };

    if (urls.length > 0) {
      preloadImages();
    }
  }, [urls]);

  return loadedImages;
}

// دالة لتحسين رابط Firebase Storage
export function optimizeFirebaseImage(url: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!url.includes('firebasestorage.googleapis.com')) {
    return url;
  }

  const sizeMap = {
    small: '_400x400',
    medium: '_800x800', 
    large: '_1200x1200'
  };

  // إضافة معاملات التحسين لـ Firebase
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}alt=media&token=optimized${sizeMap[size]}`;
}