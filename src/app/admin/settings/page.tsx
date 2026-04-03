"use client";
import LogoUploader from './LogoUploader';
import ApiKeysSettings from './ApiKeys';
import WhatsAppSettings from './WhatsAppSettings';
import OrderEmailSettings from './OrderEmailSettings';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center lg:text-right">
        <h1 className="mb-4 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">الإعدادات</h1>
        <p className="text-slate-600">هنا يمكنك ضبط إعدادات الموقع ورفع الشعار.</p>
      </div>
      
      <OrderEmailSettings />
      
      <WhatsAppSettings />
      
      <div className="mt-8">
        <LogoUploader />
      </div>
      
      <ApiKeysSettings />
    </div>
  );
}