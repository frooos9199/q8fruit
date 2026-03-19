"use client";
import LogoUploader from './LogoUploader';
import ApiKeysSettings from './ApiKeys';
import WhatsAppSettings from './WhatsAppSettings';
import OrderEmailSettings from './OrderEmailSettings';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">الإعدادات</h1>
      <p>هنا يمكنك ضبط إعدادات الموقع ورفع الشعار.</p>
      
      <OrderEmailSettings />
      
      <WhatsAppSettings />
      
      <div className="mt-8">
        <LogoUploader />
      </div>
      
      <ApiKeysSettings />
    </div>
  );
}