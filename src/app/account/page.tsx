"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getUserProfile, updateUserProfile, logoutUser } from "../../lib/auth";
import { useRouter } from "next/navigation";
import BackToHome from "../../components/BackToHome";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'admin' | 'user';
  active: boolean;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            setForm({
              name: profile.name,
              phone: profile.phone,
              address: profile.address || ""
            });
          } else if (typeof window !== "undefined") {
            const currentUser = window.localStorage.getItem("currentUser");
            if (currentUser) {
              const parsed = JSON.parse(currentUser);
              setUser({
                uid: parsed.uid,
                name: parsed.name || firebaseUser.displayName || "",
                email: parsed.email || firebaseUser.email || "",
                phone: parsed.phone || "",
                address: parsed.address || "",
                role: parsed.role === "مدير" ? "admin" : "user",
                active: true,
              });
              setForm({
                name: parsed.name || firebaseUser.displayName || "",
                phone: parsed.phone || "",
                address: parsed.address || "",
              });
            }
          }
        } catch (error) {
          console.error('خطأ في جلب بيانات المستخدم:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    setError("");
    setSuccess("");
    setSaving(true);

    // التحقق من البيانات
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("الاسم يجب أن يكون حرفين على الأقل");
      setSaving(false);
      return;
    }

    if (!/^\d{8}$/.test(form.phone)) {
      setError("رقم الهاتف يجب أن يكون 8 أرقام");
      setSaving(false);
      return;
    }

    try {
      await updateUserProfile(user.uid, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim()
      });

      // تحديث البيانات المحلية
      const updatedUser = {
        ...user,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim()
      };
      setUser(updatedUser);
      
      // تحديث localStorage للتوافق مع الكود الحالي
      if (typeof window !== "undefined") {
        window.localStorage.setItem("currentUser", JSON.stringify({
          uid: updatedUser.uid,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role === "admin" ? "مدير" : "عميل"
        }));
      }

      setSuccess("تم حفظ البيانات بنجاح");
      setEditMode(false);
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("currentUser");
        window.localStorage.removeItem("isAdmin");
      }
      router.push("/");
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-slate-600">جاري تحميل بيانات الحساب...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2] p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/80 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">غير مسجل الدخول</h2>
          <p className="mb-6 text-slate-600">يجب تسجيل الدخول أولاً للوصول لحسابك</p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-2.5 font-semibold text-white transition-all hover:from-emerald-700 hover:to-teal-600"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2] p-4">
      <div className="max-w-2xl mx-auto">
        <BackToHome />
        
        <div className="mt-8 rounded-2xl border border-white/80 bg-white/92 p-8 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg shadow-emerald-200">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              حسابي الشخصي
            </h1>
            <p className="text-slate-600">إدارة بيانات حسابك الشخصي</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-emerald-700">{success}</span>
              </div>
            </div>
          )}

          {!editMode ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-1 block text-sm font-semibold text-slate-500">الاسم الكامل</label>
                  <p className="text-lg font-medium text-slate-900">{user.name}</p>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-1 block text-sm font-semibold text-slate-500">رقم الهاتف</label>
                  <p className="text-lg font-medium text-slate-900">{user.phone}</p>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-1 block text-sm font-semibold text-slate-500">البريد الإلكتروني</label>
                  <p className="text-lg font-medium text-slate-900">{user.email}</p>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-1 block text-sm font-semibold text-slate-500">الدور</label>
                  <p className="text-lg font-medium text-slate-900">
                    {user.role === 'admin' ? 'مدير' : 'عميل'}
                  </p>
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-1 block text-sm font-semibold text-slate-500">العنوان</label>
                <p className="text-lg font-medium text-slate-900">
                  {user.address || <span className="italic text-slate-400">غير محدد</span>}
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setEditMode(true)} 
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 font-bold text-white transition-all duration-200 hover:from-emerald-700 hover:to-teal-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  تعديل البيانات
                </button>
                
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition-all duration-200 hover:bg-red-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  تسجيل الخروج
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-semibold text-slate-700">الاسم الكامل</label>
                  <input 
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    disabled={saving}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                
                <div>
                  <label className="mb-2 block font-semibold text-slate-700">رقم الهاتف</label>
                  <input 
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none" 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} 
                    disabled={saving}
                    placeholder="12345678"
                    maxLength={8}
                  />
                  <p className="mt-1 text-xs text-slate-500">8 أرقام فقط</p>
                </div>
                
                <div>
                  <label className="mb-2 block font-semibold text-slate-700">العنوان</label>
                  <textarea 
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none" 
                    value={form.address} 
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
                    disabled={saving}
                    placeholder="أدخل عنوانك (اختياري)"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 font-bold text-white transition-all duration-200 hover:from-emerald-700 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      حفظ التغييرات
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => {
                    setEditMode(false);
                    setError("");
                    setSuccess("");
                    setForm({
                      name: user.name,
                      phone: user.phone,
                      address: user.address || ""
                    });
                  }} 
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-500 px-6 py-3 font-bold text-white transition-all duration-200 hover:bg-slate-600 disabled:bg-slate-400"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
