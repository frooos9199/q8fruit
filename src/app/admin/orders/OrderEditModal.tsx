"use client";
import { useState } from "react";


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
  const [form, setForm] = useState<Order>({ ...order });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "total" ? Number(value) : value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="min-w-[320px] rounded-2xl border border-white/80 bg-white/95 p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-slate-800">تعديل الطلب</h2>
        <div className="flex flex-col gap-3">
          <label>
            اسم العميل
            <input
              name="customer"
              value={form.customer}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
            />
          </label>
          <label>
            الإجمالي
            <input
              name="total"
              type="number"
              value={form.total}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
            />
          </label>
          <label>
            الحالة
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
            >
              <option value="جديد">جديد</option>
              <option value="قيد التنفيذ">قيد التنفيذ</option>
              <option value="مكتمل">مكتمل</option>
              <option value="ملغي">ملغي</option>
            </select>
          </label>
          <label>
            التاريخ
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
            إلغاء
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-white"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
