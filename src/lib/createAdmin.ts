import { registerUser } from './auth';

// إنشاء حساب الأدمن
export const createAdminAccount = async () => {
  try {
    const adminData = {
      name: "مدير النظام",
      email: "summit_kw@hotmail.com", 
      password: "9199",
      phone: "98899426"
    };

    const result = await registerUser(adminData);
    console.log('تم إنشاء حساب الأدمن بنجاح:', result);
    return result;
  } catch (error: any) {
    if (error.message.includes('البريد الإلكتروني مستخدم بالفعل')) {
      console.log('حساب الأدمن موجود بالفعل');
      return null;
    }
    console.error('خطأ في إنشاء حساب الأدمن:', error);
    throw error;
  }
};

// تشغيل الدالة تلقائياً عند تحميل الصفحة
if (typeof window !== 'undefined') {
  // تأخير لضمان تهيئة Firebase
  setTimeout(() => {
    createAdminAccount().catch(console.error);
  }, 2000);
}