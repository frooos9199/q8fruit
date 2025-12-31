"use client";
import { useState } from "react";
import { optimizeFirebaseImage } from "../lib/imageOptimization";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function OptimizedImage({ src, alt, className, style, onError, size = 'medium' }: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = () => setLoaded(true);
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setError(true);
    onError?.(e);
  };

  // تحسين رابط الصورة
  const optimizedSrc = optimizeFirebaseImage(src, size);

  return (
    <div className="relative w-full h-full">
      {/* Placeholder أثناء التحميل */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800 dark:to-blue-800 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {/* الصورة الفعلية */}
      <img
        src={optimizedSrc}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
      
      {/* Placeholder في حالة فشل التحميل */}
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}