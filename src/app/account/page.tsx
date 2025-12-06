"use client";
import { useEffect, useState } from "react";
import BackToHome from "../../components/BackToHome";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("currentUser");
      if (userStr) setUser(JSON.parse(userStr));
      const invStr = window.localStorage.getItem("invoices");
      try {
        setInvoices(
          JSON.parse(invStr || '[]').filter((inv: any) => inv.userEmail === JSON.parse(userStr!).email)
        );
      } catch {
        setInvoices([]);
      }
    }
  }, []);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "" });
  useEffect(() => {
    if (user) setForm({ name: user.name || "", email: user.email || "", password: user.password || "", address: user.address || "" });
  }, [user]);

  const handleSave = () => {
    if (typeof window === "undefined") return;
    const users = JSON.parse(window.localStorage.getItem("users") || "[]");
    const idx = users.findIndex((u:any) => u.email === user.email);
    if (idx > -1) {
      users[idx] = { ...users[idx], ...form };
      window.localStorage.setItem("users", JSON.stringify(users));
      window.localStorage.setItem("currentUser", JSON.stringify(users[idx]));
      setUser(users[idx]);
      setEditMode(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-lg">يجب تسجيل الدخول أولاً.</div>;

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
      <BackToHome />
      <h1 className="text-2xl font-bold mb-4 text-center text-green-700">حسابي</h1>
      {!editMode ? (
        <>
          <div className="mb-2"><span className="font-bold">الاسم:</span> {user.name}</div>
          <div className="mb-2"><span className="font-bold">الإيميل:</span> {user.email}</div>
          <div className="mb-2"><span className="font-bold">العنوان:</span> {user.address || <span className="text-gray-400">غير محدد</span>}</div>
          <button onClick={() => setEditMode(true)} className="mt-2 px-4 py-1 rounded bg-blue-600 text-white font-bold">تعديل البيانات</button>
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-bold">الاسم</label>
            <input className="w-full border rounded p-2" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1 font-bold">الإيميل</label>
            <input className="w-full border rounded p-2" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1 font-bold">كلمة المرور</label>
            <input type="password" className="w-full border rounded p-2" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1 font-bold">العنوان</label>
            <input className="w-full border rounded p-2" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={handleSave} className="px-4 py-1 rounded bg-green-600 text-white font-bold">حفظ</button>
            <button onClick={() => setEditMode(false)} className="px-4 py-1 rounded bg-gray-400 text-white font-bold">إلغاء</button>
          </div>
        </div>
      )}
      <hr className="my-6" />
      <h2 className="text-xl font-bold mb-2 text-green-700">فواتيري</h2>
      {invoices.length === 0 ? (
        <div className="text-gray-500">لا توجد فواتير.</div>
      ) : (
        <ul className="space-y-2">
          {invoices.map((inv, i) => (
            <li key={i} className="border rounded p-2 flex flex-col">
              <span className="font-bold">رقم الفاتورة:</span> {inv.id}
              <span className="font-bold">المجموع:</span> {inv.total} د.ك
              <span className="font-bold">تاريخ:</span> {inv.date}
            </li>
          ))}
        </ul>
      )}
      <BackToHome className="mt-8" />
    </div>
  );
}
