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
          const { doc, getDoc, setDoc, increment } = await import('firebase/firestore');
          const counterDoc = await getDoc(doc(db, 'settings', 'orderCounter'));
          
          if (counterDoc.exists()) {
            orderNumber = counterDoc.data().lastOrderNumber + 1;
          }
          
          // تحديث العداد في Firebase
          await setDoc(doc(db, 'settings', 'orderCounter'), {
            lastOrderNumber: orderNumber,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          
          console.log('✅ رقم الطلب الجديد:', orderNumber);
        }
      } catch (error) {
        console.error('❌ خطأ في الحصول على رقم الطلب:', error);
        // fallback: استخدام timestamp
        orderNumber = Date.now();
      }
      
      const invoice = {
        id: orderNumber,
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
      invoices.push(invoice);
      window.localStorage.setItem("invoices", JSON.stringify(invoices));

      // إضافة الطلب إلى orders (للإدارة)
      const orders = JSON.parse(window.localStorage.getItem("orders") || "[]");
      const order = {
        id: invoice.id,
        customer: userInfo.name,
        phone: userInfo.phone,
        address: userInfo.address.trim() || "سيتم التواصل لتحديد العنوان",
        total: invoice.total,
        deliveryFee: deliveryPrice,
        status: "جديد",
        date: invoice.date,
        products: cart.map(item => ({
          name: item.name,
          unit: item.unit,
          price: item.price,
          quantity: item.quantity
        })),
        paymentType: paymentType,
        isGuest: !userEmail, // علامة للطلبات الضيوف
      };
      orders.push(order);
      window.localStorage.setItem("orders", JSON.stringify(orders));
      
      // حفظ العنوان في بيانات المستخدم إذا كان مسجل دخول
      if (userEmail && userInfo.address.trim() && currentUser) {
        const currentUserData = JSON.parse(currentUser);
        currentUserData.address = userInfo.address.trim();
        window.localStorage.setItem("currentUser", JSON.stringify(currentUserData));
        
        // تحديث قاعدة بيانات المستخدمين
        const users = JSON.parse(window.localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex((u: any) => u.email === userEmail);
        if (userIndex !== -1) {
          users[userIndex].address = userInfo.address.trim();
          window.localStorage.setItem("users", JSON.stringify(users));
        }
      }
      
      // مزامنة فورية مع Firebase
      import('../../lib/firebaseSync').then(({ syncAllDataToFirebase }) => {
        syncAllDataToFirebase().catch(console.error);
      });

      // إرسال الفاتورة عبر الواتساب تلقائياً
      const invoiceWithNote = {
        ...invoice,
        userNote: userNote.trim() || undefined
      };
      
      // إرسال فوري بدون تأخير
      sendInvoiceToWhatsApp(invoiceWithNote);

      // رسالة تأكيد للمستخدم
      alert(`شكراً ${userInfo.name}! تم استلام طلبك بنجاح 🎉\nسيتم إرسال الفاتورة عبر الواتساب الآن`);
    }
    handleClear();
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 sm:py-8 px-2 flex flex-col items-center" dir="rtl">
      {/* زر إغلاق الصفحة */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 text-white bg-green-600 hover:bg-green-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg focus:outline-none"
        aria-label="إغلاق الصفحة"
      >
        &times;
      </button>
  <h1 className="text-2xl sm:text-3xl font-extrabold text-green-500 mb-4 sm:mb-6 text-center tracking-tight drop-shadow-lg">سلة المشتريات</h1>
      
      {/* خطوات الشراء */}
      {cart.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between relative">
            {/* الخط الواصل */}
            <div className="absolute top-5 right-0 left-0 h-1 bg-gray-700 -z-10">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
            </div>
            
            {/* الخطوة 1: السلة */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className={`mt-2 text-xs font-bold ${currentStep >= 1 ? 'text-green-400' : 'text-gray-500'}`}>
                السلة
              </span>
            </div>

            {/* الخطوة 2: العنوان */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className={`mt-2 text-xs font-bold ${currentStep >= 2 ? 'text-green-400' : 'text-gray-500'}`}>
                العنوان
              </span>
            </div>

            {/* الخطوة 3: الدفع */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {currentStep > 3 ? '✓' : '3'}
              </div>
              <span className={`mt-2 text-xs font-bold ${currentStep >= 3 ? 'text-green-400' : 'text-gray-500'}`}>
                الدفع
              </span>
            </div>

            {/* الخطوة 4: التأكيد */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 4 ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {currentStep > 4 ? '✓' : '4'}
              </div>
              <span className={`mt-2 text-xs font-bold ${currentStep >= 4 ? 'text-green-400' : 'text-gray-500'}`}>
                تأكيد
              </span>
            </div>
          </div>
        </div>
      )}

      {/* السلة */}
      {showAlert && (
        <div className="mb-4 text-center text-white bg-red-600 rounded-lg py-2 px-4 font-bold shadow animate-pulse">تم حذف {deletedName} من السلة</div>
      )}
      <div className="w-full max-w-md">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 bg-gray-800 rounded-xl py-8 shadow-inner font-bold text-lg">سلتك فارغة</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-base text-gray-200">عدد المنتجات: <span className="font-bold text-green-400">{totalItems}</span></span>
              <button onClick={handleClear} className="text-red-200 hover:text-white font-bold text-sm bg-red-700 px-4 py-1 rounded-full shadow transition-all">إفراغ السلة</button>
            </div>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center bg-gray-900 rounded-2xl shadow-lg p-4 gap-4 border-2 border-gray-700 relative group">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-full border-2 border-green-400 shadow-md" />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="font-bold text-lg text-white">{item.name}</div>
                    <div className="text-sm text-gray-300">{item.unit}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-xl font-bold text-white hover:bg-green-600 active:bg-green-700 transition-all border-2 border-green-400"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-xl text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-xl font-bold text-white hover:bg-green-600 active:bg-green-700 transition-all border-2 border-green-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-green-300 font-bold text-lg">{(item.price * item.quantity).toFixed(3)} د.ك</div>
                    <button onClick={() => handleRemove(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white font-bold text-xl shadow hover:bg-red-800 transition-all">&times;</button>
                  </div>
                </div>
              ))}
            </div>

            {/* مربع الملاحظات تحت المنتجات مباشرة */}
            <div className="mt-4 bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <label className="block text-gray-200 mb-2 font-bold text-sm">📝 ملاحظات خاصة بالطلب:</label>
              <textarea
                className="w-full rounded-lg p-3 bg-gray-900 border-2 border-green-300 text-white min-h-[80px] focus:ring-2 focus:ring-green-400 outline-none transition-all resize-none"
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
          <div className="flex items-center justify-end gap-2 text-base font-bold text-green-400 text-right mt-6 w-full max-w-md">
            {deliveryNote && (
              <span className="text-xs font-normal text-green-700 dark:text-green-200 bg-green-50 dark:bg-green-900 rounded-full px-3 py-0.5 border border-green-200 dark:border-green-700 ml-2">{deliveryNote}</span>
            )}
            {deliveryTime && (
              <span className="text-xs font-normal text-green-700 dark:text-green-200 bg-green-50 dark:bg-green-900 rounded-full px-3 py-0.5 border border-green-200 dark:border-green-700 ml-2">{deliveryTime}</span>
            )}
            <span>التوصيل: {deliveryPrice.toFixed(3)} د.ك</span>
          </div>
          <div className="text-xl font-extrabold text-green-300 text-left mt-4 w-full max-w-md">الإجمالي: {(total + deliveryPrice).toFixed(3)} د.ك</div>

          {/* نموذج بيانات المستخدم - الخطوة 2 */}
          {currentStep >= 2 && (
            <div className="bg-gray-800 rounded-2xl p-6 mt-8 mb-2 border-2 border-green-400 w-full max-w-md flex flex-col items-center">
              <h2 className="text-lg font-bold text-green-400 mb-3">معلومات التوصيل</h2>
              <div className="mb-2 w-full">
                <label className="block text-gray-200 mb-1">الاسم *</label>
                <input
                  type="text"
                  className="w-full rounded-full p-3 bg-gray-900 border-2 border-green-300 text-white text-lg focus:ring-2 focus:ring-green-400 outline-none transition-all"
                  value={userInfo.name}
                  onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                  placeholder="اكتب اسمك هنا..."
                  required
                />
              </div>
              <div className="mb-2 w-full">
                <label className="block text-gray-200 mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  className="w-full rounded-full p-3 bg-gray-900 border-2 border-green-300 text-white text-lg focus:ring-2 focus:ring-green-400 outline-none transition-all"
                  value={userInfo.phone}
                  onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                  placeholder="مثال: 98899426"
                  required
                />
              </div>
              <div className="mb-2 w-full">
                <label className="block text-gray-200 mb-1">العنوان (اختياري)</label>
                <textarea
                  className="w-full rounded-xl p-3 bg-gray-900 border-2 border-green-300 text-white min-h-[48px] focus:ring-2 focus:ring-green-400 outline-none transition-all"
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
                ${paymentType === "cash" ? "bg-green-600 border-green-600 text-white" : "bg-gray-900 border-gray-700 text-white hover:bg-green-700 hover:border-green-600"}`}
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
                ${paymentType === "knet" ? "bg-green-600 border-green-600 text-white" : "bg-gray-900 border-gray-700 text-white hover:bg-green-700 hover:border-green-600"}`}
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
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-6 mt-6 mb-2 border-2 border-green-400 w-full max-w-md">
              <h2 className="text-xl font-bold text-green-300 mb-4 text-center">📋 مراجعة الطلب</h2>
              
              <div className="space-y-3 bg-gray-900/50 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-white">
                  <span className="text-gray-300">👤 الاسم:</span>
                  <span className="font-bold">{userInfo.name}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-gray-300">📱 الهاتف:</span>
                  <span className="font-bold">{userInfo.phone}</span>
                </div>
                {userInfo.address && (
                  <div className="flex justify-between text-white">
                    <span className="text-gray-300">📍 العنوان:</span>
                    <span className="font-bold text-sm">{userInfo.address}</span>
                  </div>
                )}
                <div className="flex justify-between text-white border-t border-gray-700 pt-3">
                  <span className="text-gray-300">💳 طريقة الدفع:</span>
                  <span className={`font-bold ${paymentType === 'knet' ? 'text-blue-400' : 'text-green-400'}`}>
                    {paymentType === "knet" ? "رابط كنت" : "نقدي عند الاستلام"}
                  </span>
                </div>
                <div className="flex justify-between text-white border-t border-gray-700 pt-3">
                  <span className="text-gray-300">📦 عدد المنتجات:</span>
                  <span className="font-bold text-green-400">{totalItems}</span>
                </div>
                <div className="flex justify-between text-white text-lg">
                  <span className="text-gray-300">💰 المجموع:</span>
                  <span className="font-bold text-green-400">{(total + deliveryPrice).toFixed(3)} د.ك</span>
                </div>
              </div>
              
              <div className="text-center text-green-300 text-sm">
                ✓ تأكد من صحة البيانات قبل إتمام الطلب
              </div>
            </div>
          )}

          {/* أزرار التنقل والتأكيد */}
          <div className="flex gap-4 mt-6 w-full max-w-md">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-full shadow transition"
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 rounded-full shadow text-lg transition"
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-extrabold py-4 rounded-full shadow text-xl transition"
                style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
              >
                ✓ تأكيد وإتمام الطلب
              </button>
            )}
          </div>
        </>
      )}
      <div className="mt-10 text-center w-full max-w-md">
        <Link href="/" className="inline-block bg-gray-700 hover:bg-green-600 text-white font-extrabold py-3 px-8 rounded-full shadow-lg text-lg transition-all">← متابعة التسوق</Link>
      </div>
    </div>
  );
}
