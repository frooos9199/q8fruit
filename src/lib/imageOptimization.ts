"use client";
import { useState, useEffect } from "react";

// Cache للصور المحملة
const imageCache = new Map<string, string>();

export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (urls.length === 0) return;

    const preloadImages = async () => {
      const newLoadedImages = new Set<string>();
      
      const promises = urls.map(async (url) => {
        if (imageCache.has(url)) {
          newLoadedImages.add(url);
          return;
        }

        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCache.set(url, url);
            newLoadedImages.add(url);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        });
      });

      await Promise.all(promises);
      setLoadedImages(newLoadedImages);
    };

    preloadImages();
  }, [urls.join(',')]);

  return loadedImages;
}

// دالة لتحسين رابط Firebase Storage
export function optimizeFirebaseImage(url: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!url || !url.includes('firebasestorage.googleapis.com')) {
    return url;
  }

  try {
    // إزالة أي معاملات موجودة قد تسبب مشاكل
    const baseUrl = url.split('?')[0];

    const sizeMap = {
      small: 'w_200,h_200,c_fill',
      medium: 'w_400,h_400,c_fill',
      large: 'w_800,h_800,c_fill'
    };

    // استخدام Firebase Image API للتحسين
    return `${baseUrl}?alt=media&${sizeMap[size]}`;
  } catch (error) {
    console.warn('Error optimizing Firebase image:', error);
    return url;
  }
}