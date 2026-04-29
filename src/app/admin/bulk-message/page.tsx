"use client";

import { useTranslation } from 'react-i18next';

export default function BulkMessagePage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="mb-4 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">{t('admin.bulkMessage.title')}</h1>
      <p className="text-slate-600">{t('admin.bulkMessage.description')}</p>
    </div>
  );
}