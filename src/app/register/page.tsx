"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.name.trim() || !user.phone.trim() || !user.email.trim() || !user.password.trim()) {
      setError("يرجى تعبئة جميع الحقول");
      return;
    }
    // حفظ المستخدم في localStorage (للتجربة فقط)
    const users = JSON.parse(window.localStorage.getItem("users") || "[]");
    users.push({ ...user, id: Date.now(), role: "عميل", active: true });
    window.localStorage.setItem("users", JSON.stringify(users));
    // إطلاق حدث مخصص لإعلام بقية الصفحات أن المستخدمين تغيروا
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("usersUpdated"));
    }
    setError("");
    alert("تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* زر إغلاق */}
        <button
          type="button"
          onClick={() => window.location.href = "/"}
          className="absolute left-3 top-3 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="إغلاق"
        >
          &times;
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center text-pink-600">تسجيل مستخدم جديد</h1>
        {error && <div className="mb-4 text-red-600 text-center font-bold">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-bold">الاسم الكامل</label>
          <input type="text" className="w-full rounded p-2 border border-gray-300" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold">رقم الهاتف</label>
          <input type="tel" className="w-full rounded p-2 border border-gray-300" value={user.phone} onChange={e => setUser({ ...user, phone: e.target.value })} required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-bold">البريد الإلكتروني</label>
          <input type="email" className="w-full rounded p-2 border border-gray-300" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} required />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-bold">كلمة المرور</label>
          <input type="password" className="w-full rounded p-2 border border-gray-300" value={user.password} onChange={e => setUser({ ...user, password: e.target.value })} required />
        </div>
        <button type="submit" className="w-full bg-pink-600 hover:bg-green-600 text-white font-bold py-3 rounded-full shadow text-lg transition">تسجيل</button>
      </form>
      <div className="mt-4 text-center">
        <a href="/login" className="text-green-700 dark:text-green-200 font-bold hover:underline">لدي حساب؟ تسجيل الدخول</a>
      </div>
    </div>
  );
}
