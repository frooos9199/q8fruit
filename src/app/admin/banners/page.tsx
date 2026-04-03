"use client";
import BannerUploader from './BannerUploader';

export default function BannersPage() {
  return (
    <div>
      <h1 className="mb-4 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">إدارة البانر</h1>
      <p className="text-slate-600">هنا يمكنك إضافة أو حذف أو تعديل صور البانر.</p>
      <div className="mt-8">
        <BannerUploader />
      </div>
    </div>
  );
}
