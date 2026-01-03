"use client";
import { useState, useCallback } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  role: "عميل" | "مدير" | "مندوب";
  password: string;
}

interface Props {
  user: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

export default function UserEditModal({ user, onSave, onClose }: Props) {
  const [form, setForm] = useState<User>({ ...user });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(() => {
    try {
      // التحقق من صحة البيانات
      if (!form.name?.trim()) {
        alert('الاسم مطلوب');
        return;
      }
      if (!form.email?.trim()) {
        alert('البريد الإلكتروني مطلوب');
        return;
      }
      if (form.password && form.password.length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }
      
      onSave(form);
    } catch (error) {
      console.error('خطأ في حفظ المستخدم:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  }, [form, onSave]);

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
              required
            />
          </label>
          <label>
            الإيميل
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </label>
          <label>
            رقم الهاتف
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              required
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
              <option value="مندوب">مندوب</option>
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
              minLength={6}
            />
          </label>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
