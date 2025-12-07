"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // بيانات الأدمن الثابتة
  const ADMIN_EMAIL = "summit_kw@hotmail.com";
  const ADMIN_PASSWORD = "9199";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // الأدمن
      if (typeof window !== "undefined") {
        window.localStorage.setItem("isAdmin", "true");
        window.localStorage.setItem("currentUser", JSON.stringify({ email, role: "مدير" }));
      }
      router.push("/admin");
      return;
    }
    // تحقق من المستخدمين المسجلين
    if (typeof window !== "undefined") {
      const users = JSON.parse(window.localStorage.getItem("users") || "[]");
      const found = users.find((u:any) => u.email === email && u.password === password);
      if (found) {
        window.localStorage.setItem("isAdmin", "false");
        window.localStorage.setItem("currentUser", JSON.stringify(found));
        router.push("/");
        return;
      }
    }
    setError("بيانات الدخول غير صحيحة.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="relative bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-sm">
        {/* زر إغلاق */}
        <button
          type="button"
          onClick={() => window.location.href = "/"}
          className="absolute left-3 top-3 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
          aria-label="إغلاق"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h2>
        <div className="mb-4">
          <label className="block mb-1">الإيميل</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">كلمة المرور</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded p-2 pr-10"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 left-0 flex items-center px-2 text-gray-500 hover:text-green-600 focus:outline-none"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.664-2.09A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.664 2.09A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575m1.664-2.09A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.403 3.22-1.125 4.575m-1.664 2.09A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </button>
          </div>
        </div>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">دخول</button>
        <div className="mt-2 text-center">
          <a href="/register" className="text-green-700 dark:text-green-200 font-bold hover:underline">ليس لدي حساب؟ سجل الآن</a>
        </div>
      </form>
    </div>
  );
}
