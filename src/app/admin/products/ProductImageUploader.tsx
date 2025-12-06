"use client";
import { useRef, useState } from "react";

export default function ProductImageUploader() {
  const [images, setImages] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          newImages.push(ev.target?.result as string);
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // تقسيم الصور إلى مجموعات من 4 صور
  const imageGroups = [];
  for (let i = 0; i < images.length; i += 4) {
    imageGroups.push(images.slice(i, i + 4));
  }

  return (
    <div className="flex flex-col gap-8">
      {imageGroups.map((group, groupIdx) => (
        <div key={groupIdx} className="flex flex-col gap-2">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-2">
              {group.slice(row * 2, row * 2 + 2).map((img, idx) => (
                <div key={idx} className="relative w-32 h-32 border rounded overflow-hidden">
                  <img src={img} alt={`صورة منتج ${groupIdx * 4 + row * 2 + idx + 1}`} className="object-cover w-full h-full" />
                  <button
                    onClick={() => removeImage(groupIdx * 4 + row * 2 + idx)}
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
        رفع صور المنتجات
      </button>
    </div>
  );
}
