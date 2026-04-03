"use client";
import { useEffect, useState } from "react";
// تعريف نوع بيانات المستخدم
interface UserInfo {
  name: string;
  phone: string;
  address: string;
}
import BackToHome from "../../components/BackToHome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendInvoiceToWhatsApp } from "../../lib/whatsappInvoice";
import { updateUserProfile } from "../../lib/auth";
import { addDoc, collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface CartItem {
  id: number;
  name: string;
  image?: string;
  unit: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  // خطوة الشراء الحالية
  const [currentStep, setCurrentStep] = useState(1);
  
  // ملاحظات المستخدم
  const [userNote, setUserNote] = useState("");
  // تحميل ملاحظة المستخدم من localStorage عند التحميل
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("userNote");
      if (stored) setUserNote(stored);
    }
  }, []);
  // حفظ ملاحظة المستخدم تلقائياً عند التغيير
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("userNote", userNote);
    }
  }, [userNote]);
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  // حالة بيانات المستخدم
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", phone: "", address: "" });


  // تحميل بيانات المستخدم من localStorage عند التحميل
  useEffect(() => {
    if (typeof window !== "undefined") {
      // أولوية: بيانات المستخدم الحالي من تسجيل الدخول
      const currentUser = window.localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          setUserInfo({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || ""
          });
          return;
        } catch {}
      }
      // fallback: بيانات userInfo القديمة
      const stored = window.localStorage.getItem("userInfo");
      if (stored) setUserInfo(JSON.parse(stored));
    }
  }, []);

  // حفظ بيانات المستخدم تلقائياً عند التغيير
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
  }, [userInfo]);
  const [showAlert, setShowAlert] = useState(false);
  const [deletedName, setDeletedName] = useState("");
  const [deliveryPrice, setDeliveryPrice] = useState(2.5); // تحديث القيمة الافتراضية
  const [paymentType, setPaymentType] = useState("cash"); // الافتراضي نقدي
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateCart = () => {
        const stored = window.localStorage.getItem("cart");
        setCart(stored ? JSON.parse(stored) : []);
      };
      updateCart();
      // جلب قيمة التوصيل من localStorage (تتم مزامنتها من صفحة الإدارة)
      const storedDelivery = window.localStorage.getItem("deliveryPrice");
      if (storedDelivery && !isNaN(Number(storedDelivery))) {
        setDeliveryPrice(Number(storedDelivery));
      }
      // جلب ملاحظة التوصيل من localStorage
      const storedNote = window.localStorage.getItem("deliveryNote");
      if (storedNote) setDeliveryNote(storedNote);
      // جلب وقت التوصيل من localStorage
      const storedTime = window.localStorage.getItem("deliveryTime");
      if (storedTime) setDeliveryTime(storedTime);

      window.addEventListener("storage", updateCart);
      // تحديث التوصيل والملاحظة ووقت التوصيل عند تغييرها من الإدارة
      const onStorage = (e: StorageEvent) => {
        if (e.key === "deliveryPrice" && e.newValue && !isNaN(Number(e.newValue))) {
          setDeliveryPrice(Number(e.newValue));
        }
        if (e.key === "deliveryNote") setDeliveryNote(e.newValue || "");
        if (e.key === "deliveryTime") setDeliveryTime(e.newValue || "");
        if (e.key === "cart") updateCart();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener("storage", updateCart);
        window.removeEventListener("storage", onStorage);
      };
    }
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemove = (id: number) => {
    const removed = cart.find((item) => item.id === id);
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cart", JSON.stringify(updated));
    }
    if (removed) {
      setDeletedName(removed.name);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 1500);
    }
  };

  const handleQuantity = (id: number, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      if (typeof window !== "undefined") {
        window.localStorage.setItem("cart", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleClear = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cart", JSON.stringify([]));
    }
  };

  const handleCheckout = async () => {
    // تحقق من تعبئة الحقول الأساسية فقط (الاسم ورقم الهاتف)
    if (!userInfo.name.trim() || !userInfo.phone.trim()) {
      alert("يرجى تعبئة الاسم ورقم الهاتف على الأقل");
      return;
    }
    if (typeof window !== "undefined") {
      // حفظ الفاتورة في localStorage (invoices)
      const invoices = JSON.parse(window.localStorage.getItem("invoices") || "[]");
      const currentUser = window.localStorage.getItem("currentUser");
      const userEmail = currentUser ? JSON.parse(currentUser).email : undefined;
      
      // الحصول على رقم الطلب التالي (يبدأ من 100)
      let orderNumber = 100;
      try {
        const { db } = await import('../../lib/firebase');
        if (db) {
          orderNumber = await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, 'settings', 'orderCounter');
            const counterDoc = await transaction.get(counterRef);
            const lastOrderNumber = counterDoc.exists()
              ? Number(counterDoc.data().lastOrderNumber) || 99
              : 99;
            const nextOrderNumber = Math.max(lastOrderNumber + 1, 100);

            transaction.set(counterRef, {
              lastOrderNumber: nextOrderNumber,
              updatedAt: new Date().toISOString(),
            }, { merge: true });

            return nextOrderNumber;
          });
          
          console.log('✅ رقم الطلب/الفاتورة الجديد:', orderNumber);
        } else {
          // fallback: استخدام localStorage
          const lastOrder = window.localStorage.getItem('lastOrderNumber');
          orderNumber = lastOrder ? parseInt(lastOrder) + 1 : 100;
          window.localStorage.setItem('lastOrderNumber', orderNumber.toString());
        }
      } catch (error) {
        console.error('❌ خطأ في الحصول على رقم الطلب:', error);
        // fallback: استخدام localStorage
        const lastOrder = window.localStorage.getItem('lastOrderNumber');
        orderNumber = lastOrder ? parseInt(lastOrder) + 1 : 100;
        window.localStorage.setItem('lastOrderNumber', orderNumber.toString());
      }
      
      const invoice = {
        id: orderNumber,
        orderNumber: orderNumber, // رقم موحد للفاتورة والطلبية
        date: new Date().toLocaleString(),
        items: cart,
        total: total + deliveryPrice,
        deliveryPrice,
        deliveryNote,
        deliveryTime,
        userInfo: {
          ...userInfo,
          // إذا ما كتب عنوان، حط رسالة توضيحية
          address: userInfo.address.trim() || "سيتم التواصل لتحديد العنوان"
        },
        paymentType,
        userEmail: userEmail || "زائر",
        isGuest: !userEmail, // علامة للطلبات الضيوف
      };
      invoices.unshift(invoice);
      window.localStorage.setItem("invoices", JSON.stringify(invoices));

      // إضافة الطلب إلى orders (للإدارة)
      const orders = JSON.parse(window.localStorage.getItem("orders") || "[]");
      const normalizedProducts = cart.map(item => ({
        productId: String(item.id),
        name: item.name,
        unit: item.unit,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        image: item.image || '',
      }));

      const addressText = userInfo.address.trim() || "سيتم التواصل لتحديد العنوان";

      const order = {
        id: orderNumber,
        orderNumber: orderNumber, // رقم موحد للفاتورة والطلبية
        source: 'web',
        customer: userInfo.name,
        customerName: userInfo.name,
        customerEmail: userEmail || '',
        phone: userInfo.phone,
        phoneNumber: userInfo.phone,
        address: addressText,
        deliveryAddress: {
          fullAddress: addressText,
          notes: userNote.trim() || '',
        },
        delivery: {
          address: addressText,
          fullAddress: addressText,
          notes: userNote.trim() || '',
        },
        userInfo: {
          ...userInfo,
          email: userEmail || '',
        },
        subtotal: total,
        total: invoice.total,
        deliveryFee: deliveryPrice,
        status: "جديد",
        date: invoice.date,
        products: normalizedProducts,
        items: normalizedProducts,
        pricing: {
          subtotal: total,
          deliveryPrice,
          total: invoice.total,
        },
        paymentType: paymentType,
        paymentMethod: paymentType,
        deliveryNotes: userNote.trim() || undefined,
        userNote: userNote.trim() || undefined,
        timestamp: Date.now(),
        isGuest: !userEmail, // علامة للطلبات الضيوف
      };
      orders.unshift(order);
      window.localStorage.setItem("orders", JSON.stringify(orders));
      
      // حفظ العنوان في بيانات المستخدم إذا كان مسجل دخول
      if (userEmail && userInfo.address.trim() && currentUser) {
        const currentUserData = JSON.parse(currentUser);
        currentUserData.address = userInfo.address.trim();
        window.localStorage.setItem("currentUser", JSON.stringify(currentUserData));

        const currentUserId = currentUserData.uid || currentUserData.id;
        if (currentUserId) {
          try {
            await updateUserProfile(currentUserId, {
              name: userInfo.name.trim(),
              phone: userInfo.phone.trim(),
              address: userInfo.address.trim(),
            });
          } catch (profileError) {
            console.error('❌ خطأ في تحديث عنوان المستخدم:', profileError);
          }
        }
      }
      
      try {
        if (db) {
          await addDoc(collection(db, 'adminNotifications'), {
            title: '📦 طلب جديد',
            message: `طلب جديد رقم ${orderNumber} من ${userInfo.name} - ${invoice.total.toFixed(3)} د.ك`,
            type: 'new_order',
            orderId: String(orderNumber),
            orderNumber,
            customerName: userInfo.name,
            phoneNumber: userInfo.phone,
            read: false,
            createdAt: serverTimestamp(),
          });

          await fetch('/api/notifications/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: '📦 طلب جديد',
              body: `طلب جديد رقم ${orderNumber} من ${userInfo.name} - ${invoice.total.toFixed(3)} د.ك`,
              topic: 'admin-orders',
              badgeSource: 'adminNotifications',
              data: {
                type: 'new_order',
                screen: 'ManageOrders',
                orderId: String(orderNumber),
                orderNumber: String(orderNumber),
                channelId: 'q8fruit-orders',
              },
            }),
          });
        }
      } catch (notificationError) {
        console.error('❌ خطأ في إنشاء إشعار الطلب:', notificationError);
      }

      // إرسال الفاتورة عبر الواتساب تلقائياً
      const invoiceWithNote = {
        ...invoice,
        userNote: userNote.trim() || undefined
      };
      
      // إرسال فوري بدون تأخير
      sendInvoiceToWhatsApp(invoiceWithNote);

      // إرسال إيميل للإدارة
      // الحصول على قائمة الإيميلات من Firebase
      let recipientEmails = ['summit_kw@hotmail.com']; // الافتراضي
      
      try {
        const { db } = await import('../../lib/firebase');
        if (db) {
          const { doc, getDoc } = await import('firebase/firestore');
          const settingsDoc = await getDoc(doc(db, 'settings', 'orderNotificationEmails'));
          
          if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            if (data.emails && Array.isArray(data.emails) && data.emails.length > 0) {
              recipientEmails = data.emails;
            }
          }
        }
      } catch (error) {
        console.error('خطأ في قراءة إيميلات الإشعارات من Firebase:', error);
        // استخدام الإيميل الافتراضي في حالة الخطأ
      }

      fetch('/api/orders/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmails: recipientEmails, // إضافة قائمة الإيميلات
          orderNumber: orderNumber,
          id: orderNumber,
          date: invoice.date,
          customerName: userInfo.name,
          customer: userInfo.name,
          phone: userInfo.phone,
          phoneNumber: userInfo.phone,
          address: userInfo.address.trim() || "سيتم التواصل لتحديد العنوان",
          userInfo: invoice.userInfo,
          items: cart.map(item => ({
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            image: item.image || '',
          })),
          subtotal: total,
          deliveryPrice: deliveryPrice,
          deliveryFee: deliveryPrice,
          total: invoice.total,
          paymentType: paymentType,
          paymentMethod: paymentType,
          userNote: userNote.trim() || undefined,
          deliveryNotes: userNote.trim() || undefined,
        }),
      }).then(res => {
        if (res.ok) {
          console.log('✅ تم إرسال إيميل الطلب بنجاح');
        } else {
          console.error('❌ فشل إرسال إيميل الطلب');
        }
      }).catch(error => {
        console.error('❌ خطأ في إرسال إيميل الطلب:', error);
      });

      // رسالة تأكيد للمستخدم
      alert(`شكراً ${userInfo.name}! تم استلام طلبك بنجاح 🎉\nسيتم إرسال الفاتورة عبر الواتساب الآن`);
    }
    handleClear();
  };

  return (
  <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2] px-2 py-4 text-slate-800 sm:py-8" dir="rtl">
      {/* زر إغلاق الصفحة */}
      <button
        onClick={() => router.push("/")}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-xl font-bold text-white shadow-lg shadow-emerald-200 focus:outline-none hover:from-emerald-700 hover:to-teal-600 sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-2xl"
        aria-label="إغلاق الصفحة"
      >
        &times;
      </button>
  <h1 className="mb-4 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-center text-2xl font-extrabold tracking-tight text-transparent sm:mb-6 sm:text-3xl">سلة المشتريات</h1>
      
      {/* خطوات الشراء */}
      {cart.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between relative">
            {/* الخط الواصل */}
            <div className="absolute left-0 right-0 top-5 -z-10 h-1 rounded-full bg-emerald-100">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
            </div>
            
            {/* الخطوة 1: السلة */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 1 ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-200'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className={`mt-2 text-xs font-bold ${currentStep >= 1 ? 'text-emerald-700' : 'text-slate-500'}`}>
                السلة
              </span>
            </div>

            {/* الخطوة 2: العنوان */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 2 ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-200'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className={`mt-2 text-xs font-bold ${currentStep >= 2 ? 'text-emerald-700' : 'text-slate-500'}`}>
                العنوان
              </span>
            </div>

            {/* الخطوة 3: الدفع */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 3 ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-200'
              }`}>
                {currentStep > 3 ? '✓' : '3'}
              </div>
              <span className={`mt-2 text-xs font-bold ${currentStep >= 3 ? 'text-emerald-700' : 'text-slate-500'}`}>
                الدفع
              </span>
            </div>

            {/* الخطوة 4: التأكيد */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 4 ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-200'
              }`}>
                {currentStep > 4 ? '✓' : '4'}
              </div>
              <span className={`mt-2 text-xs font-bold ${currentStep >= 4 ? 'text-emerald-700' : 'text-slate-500'}`}>
                تأكيد
              </span>
            </div>
          </div>
        </div>
      )}

      {/* السلة */}
      {showAlert && (
        <div className="mb-4 rounded-lg bg-red-500 px-4 py-2 text-center font-bold text-white shadow animate-pulse">تم حذف {deletedName} من السلة</div>
      )}
      <div className="w-full max-w-md">
        {cart.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white/92 py-8 text-center text-lg font-bold text-slate-500 shadow-inner">سلتك فارغة</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-base text-slate-600">عدد المنتجات: <span className="font-bold text-emerald-700">{totalItems}</span></span>
              <button onClick={handleClear} className="rounded-full bg-red-500 px-4 py-1 text-sm font-bold text-white shadow transition-all hover:bg-red-600">إفراغ السلة</button>
            </div>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="group relative flex items-center gap-4 rounded-2xl border border-white/80 bg-white/92 p-4 font-sans shadow-[0_18px_40px_rgba(15,118,110,0.10)] transition-all hover:border-emerald-300">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center">
                    <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl border-2 border-emerald-200 bg-white object-cover shadow-md" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="truncate text-lg font-bold text-emerald-700 sm:text-xl">{item.name}</div>
                    <div className="text-xs font-medium text-slate-500 sm:text-sm">{item.unit}</div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleQuantity(item.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-emerald-200 bg-emerald-50 text-xl font-bold text-emerald-700 shadow transition-all hover:bg-emerald-600 hover:text-white active:bg-emerald-700"
                        aria-label="نقص الكمية"
                      >
                        -
                      </button>
                      <span className="w-10 select-none text-center text-xl font-extrabold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-emerald-200 bg-emerald-50 text-xl font-bold text-emerald-700 shadow transition-all hover:bg-emerald-600 hover:text-white active:bg-emerald-700"
                        aria-label="زيادة الكمية"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-[70px]">
                    <div className="text-lg font-extrabold text-emerald-700 drop-shadow sm:text-xl">{(item.price * item.quantity).toFixed(3)} <span className="text-xs font-bold">د.ك</span></div>
                    <button onClick={() => handleRemove(item.id)} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-200 bg-red-500 text-xl font-extrabold text-white shadow transition-all hover:bg-red-600" aria-label="حذف المنتج">&times;</button>
                  </div>
                </div>
              ))}
            </div>

            {/* مربع الملاحظات تحت المنتجات مباشرة */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white/92 p-4">
              <label className="mb-2 block text-sm font-bold text-slate-700">📝 ملاحظات خاصة بالطلب:</label>
              <textarea
                className="min-h-[80px] w-full resize-none rounded-lg border-2 border-emerald-200 bg-white p-3 text-slate-900 outline-none transition-all focus:ring-2 focus:ring-emerald-300"
                value={userNote}
                onChange={e => setUserNote(e.target.value)}
                placeholder="مثال: أحتاج التوصيل صباحاً، أو طلبات إضافية..."
              />
            </div>
          </>
        )}
      </div>

      {/* باقي الحقول */}
      {cart.length > 0 && (
        <>
          {/* عرض الإجمالي - يظهر دائماً */}
          <div className="mt-6 flex w-full max-w-md items-center justify-end gap-2 text-right text-base font-bold text-emerald-700">
            {deliveryNote && (
              <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-normal text-emerald-700">{deliveryNote}</span>
            )}
            {deliveryTime && (
              <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-normal text-emerald-700">{deliveryTime}</span>
            )}
            <span>التوصيل: {deliveryPrice.toFixed(3)} د.ك</span>
          </div>
          <div className="mt-4 w-full max-w-md text-left text-xl font-extrabold text-emerald-700">الإجمالي: {(total + deliveryPrice).toFixed(3)} د.ك</div>

          {/* نموذج بيانات المستخدم - الخطوة 2 */}
          {currentStep >= 2 && (
            <div className="mt-8 mb-2 flex w-full max-w-md flex-col items-center rounded-2xl border border-white/80 bg-white/92 p-6 shadow-[0_18px_40px_rgba(15,118,110,0.10)]">
              <h2 className="mb-3 text-lg font-bold text-emerald-700">معلومات التوصيل</h2>
              <div className="mb-2 w-full">
                <label className="mb-1 block text-slate-700">الاسم *</label>
                <input
                  type="text"
                  className="w-full rounded-full border-2 border-emerald-200 bg-white p-3 text-lg text-slate-900 outline-none transition-all focus:ring-2 focus:ring-emerald-300"
                  value={userInfo.name}
                  onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                  placeholder="اكتب اسمك هنا..."
                  required
                />
              </div>
              <div className="mb-2 w-full">
                <label className="mb-1 block text-slate-700">رقم الهاتف *</label>
                <input
                  type="tel"
                  className="w-full rounded-full border-2 border-emerald-200 bg-white p-3 text-lg text-slate-900 outline-none transition-all focus:ring-2 focus:ring-emerald-300"
                  value={userInfo.phone}
                  onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                  placeholder="مثال: 98899426"
                  required
                />
              </div>
              <div className="mb-2 w-full">
                <label className="mb-1 block text-slate-700">العنوان (اختياري)</label>
                <textarea
                  className="min-h-[48px] w-full rounded-xl border-2 border-emerald-200 bg-white p-3 text-slate-900 outline-none transition-all focus:ring-2 focus:ring-emerald-300"
                  value={userInfo.address}
                  onChange={e => setUserInfo({ ...userInfo, address: e.target.value })}
                  placeholder="يمكنك كتابة العنوان هنا أو إرساله عبر الواتساب لاحقاً"
                />
              </div>
            </div>
          )}

          {/* خيارات الدفع - الخطوة 3 */}
          {currentStep >= 3 && (
            <div className="flex flex-row gap-8 mt-4 mb-2 justify-center items-center w-full max-w-md">
              <label className={`flex items-center gap-2 cursor-pointer px-6 py-3 rounded-full font-bold transition border-2 text-lg shadow-lg 
                ${paymentType === "cash" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="cash"
                  checked={paymentType === "cash"}
                  onChange={() => setPaymentType("cash")}
                  className="accent-green-600 hidden"
                />
                <span>الدفع نقدي عند الاستلام</span>
              </label>
              <label className={`flex items-center gap-2 cursor-pointer px-6 py-3 rounded-full font-bold transition border-2 text-lg shadow-lg 
                ${paymentType === "knet" ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="knet"
                  checked={paymentType === "knet"}
                  onChange={() => setPaymentType("knet")}
                  className="accent-green-600 hidden"
                />
                <span>رابط KNET</span>
              </label>
            </div>
          )}

          {/* ملخص الطلب في الخطوة 4 */}
          {currentStep === 4 && (
            <div className="mt-6 mb-2 w-full max-w-md rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
              <h2 className="mb-4 text-center text-xl font-bold text-emerald-700">📋 مراجعة الطلب</h2>
              
              <div className="mb-4 space-y-3 rounded-xl bg-white/80 p-4">
                <div className="flex justify-between text-slate-800">
                  <span className="text-slate-500">👤 الاسم:</span>
                  <span className="font-bold">{userInfo.name}</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span className="text-slate-500">📱 الهاتف:</span>
                  <span className="font-bold">{userInfo.phone}</span>
                </div>
                {userInfo.address && (
                  <div className="flex justify-between text-slate-800">
                    <span className="text-slate-500">📍 العنوان:</span>
                    <span className="font-bold text-sm">{userInfo.address}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-3 text-slate-800">
                  <span className="text-slate-500">💳 طريقة الدفع:</span>
                  <span className={`font-bold ${paymentType === 'knet' ? 'text-cyan-700' : 'text-emerald-700'}`}>
                    {paymentType === "knet" ? "رابط كنت" : "نقدي عند الاستلام"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-slate-800">
                  <span className="text-slate-500">📦 عدد المنتجات:</span>
                  <span className="font-bold text-emerald-700">{totalItems}</span>
                </div>
                <div className="flex justify-between text-lg text-slate-800">
                  <span className="text-slate-500">💰 المجموع:</span>
                  <span className="font-bold text-emerald-700">{(total + deliveryPrice).toFixed(3)} د.ك</span>
                </div>
              </div>
              
              <div className="text-center text-sm text-emerald-700">
                ✓ تأكد من صحة البيانات قبل إتمام الطلب
              </div>
            </div>
          )}

          {/* أزرار التنقل والتأكيد */}
          <div className="flex gap-4 mt-6 w-full max-w-md">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 rounded-full bg-slate-500 py-3 font-bold text-white shadow transition hover:bg-slate-600"
              >
                ← رجوع
              </button>
            )}
            {currentStep < 4 ? (
              <button 
                onClick={() => {
                  // التحقق من البيانات قبل الانتقال
                  if (currentStep === 2 && (!userInfo.name.trim() || !userInfo.phone.trim())) {
                    alert("يرجى تعبئة الاسم ورقم الهاتف");
                    return;
                  }
                  // الانتقال للخطوة التالية
                  setCurrentStep(currentStep + 1);
                }}
                className="flex-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-3 text-lg font-extrabold text-white shadow transition hover:from-emerald-700 hover:to-teal-600"
              >
                {currentStep === 3 ? '← متابعة للتأكيد' : 'التالي →'}
              </button>
            ) : (
              <button 
                onClick={() => {
                  // التحقق النهائي قبل الإتمام
                  if (!userInfo.name.trim() || !userInfo.phone.trim()) {
                    alert("يرجى تعبئة الاسم ورقم الهاتف");
                    setCurrentStep(2);
                    return;
                  }
                  handleCheckout();
                }}
                className="flex-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-4 text-xl font-extrabold text-white shadow transition hover:from-emerald-700 hover:to-teal-600"
                style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
              >
                ✓ تأكيد وإتمام الطلب
              </button>
            )}
          </div>
        </>
      )}
      <div className="mt-10 text-center w-full max-w-md">
        <Link href="/" className="inline-block rounded-full bg-gradient-to-r from-slate-600 to-slate-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-teal-500">← متابعة التسوق</Link>
      </div>
    </div>
  );
}
