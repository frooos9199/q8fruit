"use client";
import LogoUploader from './LogoUploader';
import ApiKeysSettings from './ApiKeys';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الإعدادات</h1>
      <p>هنا يمكنك ضبط إعدادات الموقع ورفع الشعار.</p>
      <div className="mt-8">
        <LogoUploader />
      </div>
      <ApiKeysSettings />
    </div>
  );
}