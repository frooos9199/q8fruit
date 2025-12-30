"use client";
import LogoUploader from './LogoUploader';
import ApiKeysSettings from './ApiKeys';
import WhatsAppSettings from './WhatsAppSettings';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">الإعدادات</h1>
      <p>هنا يمكنك ضبط إعدادات الموقع ورفع الشعار.</p>
      
      <WhatsAppSettings />
      
      <div className="mt-8">
        <LogoUploader />
      </div>
      
      <ApiKeysSettings />
    </div>
  );
}