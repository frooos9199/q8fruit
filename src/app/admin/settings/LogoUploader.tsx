"use client";
import { useRef, useState } from "react";

export default function LogoUploader() {
  const [logo, setLogo] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // حفظ الشعار في localStorage ليظهر في الشريط الجانبي
    if (logo) {
      window.localStorage.setItem('siteLogo', logo);
    }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
        {logo ? (
          <img src={logo} alt="شعار الموقع" className="object-contain w-full h-full" />
        ) : (
          <span className="text-gray-400">لا يوجد شعار</span>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={() => fileInput.current?.click()}
      >
        رفع الشعار
      </button>
      <button
        type="button"
        className="bg-blue-700 text-white px-4 py-2 rounded w-32 mt-2"
        onClick={handleSave}
        disabled={!logo}
      >
        حفظ
      </button>
      {success && (
        <div className="text-green-600 font-bold mt-2">تم حفظ الشعار بنجاح</div>
      )}
    </div>
  );
}
