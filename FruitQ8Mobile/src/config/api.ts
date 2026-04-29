// API Configuration
// تحديث هذا العنوان بعد نشر الموقع على Vercel أو أي خادم
export const API_CONFIG = {
  // التطبيق منشور ويستخدمه العملاء؛ لا نستخدم localhost نهائياً
  BASE_URL: 'https://www.q8fruit.com', // النطاق الفعلي للموقع
  
  ENDPOINTS: {
    SEND_ORDER_EMAIL: '/api/orders/send-email',
  }
};

// دالة مساعدة لإرسال طلب API
export const sendOrderEmail = async (orderData: any) => {
  try {
    // محاولة قراءة الإيميلات المحفوظة من AsyncStorage (إذا كان متاحاً)
    let recipientEmails = ['summit_kw@hotmail.com']; // الإيميل الافتراضي
    
    // في التطبيق، نستخدم الإيميل الافتراضي فقط
    // لأن الإعدادات تُدار من الموقع
    
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEND_ORDER_EMAIL}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        recipientEmails: recipientEmails, // إضافة قائمة الإيميلات
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ تم إرسال إيميل الطلب بنجاح');
      return { success: true, data };
    } else {
      console.error('❌ فشل إرسال إيميل الطلب:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ خطأ في إرسال إيميل الطلب:', error);
    return { success: false, error };
  }
};
