"use client";
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  role: "عميل" | "مدير";
  password: string;
}

interface Props {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

export default function UserEditModal({ user, onSave, onClose }: Props) {
  const [form, setForm] = useState<User>({ ...user });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg min-w-[320px]">
        <h2 className="text-xl font-bold mb-4">تعديل المستخدم</h2>
        <div className="flex flex-col gap-3">
          <label>
            الاسم
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label>
            الإيميل
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label>
            رقم الهاتف
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label>
            الدور
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            >
              <option value="عميل">عميل</option>
              <option value="مدير">مدير</option>
            </select>
          </label>
          <label>
            كلمة المرور
            <input
              name="password"
              type="password"
              value={form.password}
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
