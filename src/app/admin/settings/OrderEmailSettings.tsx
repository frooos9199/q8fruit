"use client";
import { useState, useEffect } from 'react';

interface EmailConfig {
  emails: string[];
}

export default function OrderEmailSettings() {
  const [emails, setEmails] = useState<string[]>(['summit_kw@hotmail.com']);
  const [newEmail, setNewEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // تحميل الإيميلات المحفوظة من Firebase
  useEffect(() => {
    loadEmailsFromFirebase();
  }, []);

  const loadEmailsFromFirebase = async () => {
    setIsLoading(true);
    try {
      const { db } = await import('../../../lib/firebase');
      if (db) {
        const { doc, getDoc } = await import('firebase/firestore');
        const settingsDoc = await getDoc(doc(db, 'settings', 'orderNotificationEmails'));
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.emails && Array.isArray(data.emails) && data.emails.length > 0) {
            setEmails(data.emails);
          }
        }
      }
    } catch (error) {
      console.error('Error loading emails from Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // حفظ الإيميلات في Firebase
  const saveEmails = async () => {
    if (emails.length === 0) {
      setSaveMessage('⚠️ يجب إضافة إيميل واحد على الأقل');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setSaveMessage('⏳ جاري الحفظ...');
    
    try {
      const { db } = await import('../../../lib/firebase');
      if (db) {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'orderNotificationEmails'), {
          emails: emails,
          updatedAt: new Date().toISOString(),
        });
        
        setSaveMessage('✅ تم حفظ الإيميلات بنجاح في Firebase');
        setIsEditing(false);
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving emails to Firebase:', error);
      setSaveMessage('❌ خطأ في الحفظ. يرجى المحاولة مرة أخرى');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // إضافة إيميل جديد
  const addEmail = () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    
    if (!trimmedEmail) {
      setSaveMessage('⚠️ يرجى إدخال إيميل');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // التحقق من صحة الإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setSaveMessage('⚠️ الإيميل غير صحيح');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    // التحقق من عدم التكرار
    if (emails.includes(trimmedEmail)) {
      setSaveMessage('⚠️ هذا الإيميل موجود بالفعل');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setNewEmail('');
    setSaveMessage('✅ تمت الإضافة - لا تنسَ الحفظ');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // حذف إيميل
  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
    setSaveMessage('✅ تم الحذف - لا تنسَ الحفظ');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // إلغاء التعديلات
  const cancelEdit = () => {
    loadEmailsFromFirebase();
    setIsEditing(false);
    setNewEmail('');
    setSaveMessage('');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الإيميلات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">📧 إيميلات إشعارات الطلبات</h2>
          <p className="text-sm text-gray-600 mt-1">
            أضف الإيميلات التي تريد أن تصلها إشعارات الطلبات الجديدة (محفوظة في Firebase)
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            ✏️ تعديل
          </button>
        )}
      </div>

      {/* رسالة الحالة */}
      {saveMessage && (
        <div className={`p-3 rounded mb-4 ${
          saveMessage.includes('✅') ? 'bg-green-100 text-green-800' :
          saveMessage.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
          saveMessage.includes('⏳') ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* قائمة الإيميلات */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">الإيميلات المحفوظة:</h3>
        <div className="space-y-2">
          {emails.map((email, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
            >
              <span className="text-gray-800">{email}</span>
              {isEditing && (
                <button
                  onClick={() => removeEmail(email)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  حذف
                </button>
              )}
            </div>
          ))}
          {emails.length === 0 && (
            <p className="text-gray-500 text-center py-4">لا توجد إيميلات محفوظة</p>
          )}
        </div>
      </div>

      {/* إضافة إيميل جديد */}
      {isEditing && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-2">إضافة إيميل جديد:</h3>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEmail()}
              placeholder="example@domain.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addEmail}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              إضافة
            </button>
          </div>
        </div>
      )}

      {/* أزرار الحفظ والإلغاء */}
      {isEditing && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={saveEmails}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
          >
            💾 حفظ التغييرات
          </button>
          <button
            onClick={cancelEdit}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* معلومات إضافية */}
      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>ملاحظة:</strong> جميع الإيميلات المضافة ستستقبل إشعارات تلقائية عند كل طلب جديد من الموقع أو التطبيق.
          البيانات محفوظة في Firebase.
        </p>
      </div>
    </div>
  );
}
