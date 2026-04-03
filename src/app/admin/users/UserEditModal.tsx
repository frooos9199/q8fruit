"use client";
import { useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  isAdmin?: boolean;
  isBlocked?: boolean;
  role?: "عميل" | "مدير" | "مندوب";
  password?: string;
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

      // تحديث isAdmin بناءً على الدور
      const updatedUser = {
        ...form,
        isAdmin: form.role === 'مدير',
        isBlocked: !form.active
      };
      
      onSave(updatedUser);
    } catch (error) {
      console.error('خطأ في حفظ المستخدم:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  }, [form, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="min-w-[320px] rounded-2xl border border-white/80 bg-white/95 p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-slate-800">تعديل المستخدم</h2>
        <div className="flex flex-col gap-3">
          <label>
            الاسم
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
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
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
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
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
              required
            />
          </label>
          <label>
            الدور
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
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
              className="mt-1 w-full rounded-xl border border-slate-300 p-2.5"
              minLength={6}
            />
          </label>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-400 px-4 py-2 text-white transition-colors hover:bg-slate-500"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-white transition-colors hover:from-emerald-700 hover:to-teal-600"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
