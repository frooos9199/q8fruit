"use client";
import BannerUploader from './BannerUploader';

export default function BannersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">إدارة البانر</h1>
      <p>هنا يمكنك إضافة أو حذف أو تعديل صور البانر.</p>
      <div className="mt-8">
        <BannerUploader />
      </div>
    </div>
  );
}
