"use client";
import { useRef, useState } from "react";

export default function BannerUploader() {
  // جلب البنرات من localStorage أو الافتراضي
  function getInitialBanners() {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("banners");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return [
      '/banners/banner1.jpg',
      '/banners/banner2.jpg',
      '/banners/banner3.jpg',
      '/banners/banner4.jpg',
    ];
  }
  const [banners, setBanners] = useState<string[]>(getInitialBanners());
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newBanners: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          newBanners.push(ev.target?.result as string);
          if (newBanners.length === files.length) {
            setBanners((prev) => {
              const updated = [...prev, ...newBanners];
              if (typeof window !== "undefined") {
                window.localStorage.setItem("banners", JSON.stringify(updated));
              }
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeBanner = (idx: number) => {
    setBanners((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("banners", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // تقسيم البنرات إلى مجموعات من 4 صور
  const bannerGroups = [];
  for (let i = 0; i < banners.length; i += 4) {
    bannerGroups.push(banners.slice(i, i + 4));
  }

  return (
    <div className="flex flex-col gap-8">
      {bannerGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="flex flex-col gap-2">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-2">
              {group.slice(row * 2, row * 2 + 2).map((banner, idx) => (
                <div key={idx} className="relative w-40 h-24 border rounded overflow-hidden">
                  <img src={banner} alt={`بانر ${groupIdx * 4 + row * 2 + idx + 1}`} className="object-cover w-full h-full" />
                  <button
                    onClick={() => removeBanner(groupIdx * 4 + row * 2 + idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    title="حذف"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInput}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        className="bg-green-600 text-white px-4 py-2 rounded w-fit"
        onClick={() => fileInput.current?.click()}
      >
        رفع صور البانر
      </button>
    </div>
  );
}
