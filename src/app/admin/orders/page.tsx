"use client";
import OrdersTable from "./OrdersTable";
import { useTranslation } from 'react-i18next';

export default function OrdersPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* العنوان الرئيسي */}
      <div className="text-center lg:text-start">
        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center justify-center lg:justify-start gap-3">
          <span className="text-3xl">📋</span>
          {t('admin.orders.title')}
        </h1>
        <p className="text-sm text-slate-600 lg:text-base">{t('admin.orders.subtitle')}</p>
      </div>

      {/* معلومات مهمة */}
      <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📱</span>
          <h3 className="font-bold text-cyan-800">{t('admin.orders.whatsappFeature.title')}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span>👨💼</span>
            <span className="text-slate-700">{t('admin.orders.whatsappFeature.sendToAdmin')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span className="text-slate-700">{t('admin.orders.whatsappFeature.sendToCustomer')}</span>
          </div>
        </div>
      </div>

      {/* جدول الطلبات */}
      <OrdersTable />
    </div>
  );
}