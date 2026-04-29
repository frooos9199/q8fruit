"use client";
import { useState } from "react";
import { useTranslation } from 'react-i18next';


interface OrderProduct {
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer: string;
  total: number;
  status: "جديد" | "قيد التنفيذ" | "مكتمل" | "ملغي";
  date: string;
  products: OrderProduct[];
  deliveryFee?: number;
  paymentType?: string;
}

interface Props {
  order: Order;
  onSave: (order: Order) => void;
  onClose: () => void;
}

export default function OrderEditModal({ order, onSave, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState<Order>({ ...order });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "total" ? Number(value) : value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div dir={i18n.dir()} className="min-w-[320px] rounded-2xl border border-white/80 bg-white/95 p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-slate-800">{t('admin.orders.edit.title')}</h2>
        <div className="flex flex-col gap-3">
          <label>
            {t('admin.orders.edit.customerName')}
            <input
              name="customer"
              value={form.customer}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
            />
          </label>
          <label>
            {t('admin.orders.edit.total')}
            <input
              name="total"
              type="number"
              value={form.total}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
            />
          </label>
          <label>
            {t('admin.orders.edit.status')}
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
            >
              <option value="جديد">{t('admin.orders.status.new')}</option>
              <option value="قيد التنفيذ">{t('admin.orders.status.inProgress')}</option>
              <option value="مكتمل">{t('admin.orders.status.completed')}</option>
              <option value="ملغي">{t('admin.orders.status.cancelled')}</option>
            </select>
          </label>
          <label>
            {t('admin.orders.edit.date')}
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
            />
          </label>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-400 px-4 py-2 text-white"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-white"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
