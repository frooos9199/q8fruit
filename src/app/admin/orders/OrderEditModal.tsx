"use client";
import { useState } from "react";


interface OrderProduct {
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer: string;
  total: number;
  status: "جديد" | "قيد التنفيذ" | "مكتمل" | "ملغي";
  date: string;
  products: OrderProduct[];
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg min-w-[320px]">
        <h2 className="text-xl font-bold mb-4">تعديل الطلب</h2>
        <div className="flex flex-col gap-3">
          <label>
            اسم العميل
            <input
              name="customer"
              value={form.customer}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label>
            الإجمالي
            <input
              name="total"
              type="number"
              value={form.total}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label>
            الحالة
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
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
              className="w-full border rounded p-2 mt-1"
            />
          </label>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-400 text-white"
          >
            إلغاء
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
