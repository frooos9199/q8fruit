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

interface CartItem {
  id: number;
  name: string;
  image?: string;
  unit: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
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
  const [deliveryPrice, setDeliveryPrice] = useState(1); // الافتراضي
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

  const handleCheckout = () => {
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
      const invoice = {
        id: Date.now(),
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

      // إرسال الفاتورة إلى إيميل المستخدم (mock فقط)
      const email = (window.localStorage.getItem("currentUser") && JSON.parse(window.localStorage.getItem("currentUser") || '{}').email) || "";
      if (email) {
        alert(`تم إرسال الفاتورة إلى بريدك الإلكتروني: ${email}`);
      } else {
        alert(`شكراً ${userInfo.name}! تم استلام طلبك بنجاح 🎉\nسنتواصل معك على رقم ${userInfo.phone} قريباً`);
      }
    }
    handleClear();
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-2 flex flex-col items-center" dir="rtl">
      {/* زر إغلاق الصفحة */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 z-10 text-white bg-green-600 hover:bg-green-800 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg focus:outline-none"
        aria-label="إغلاق الصفحة"
      >
        &times;
      </button>
  <h1 className="text-3xl font-extrabold text-green-500 mb-8 text-center tracking-tight drop-shadow-lg">سلة المشتريات</h1>
      
      {/* السلة دائماً */}
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
          </>
        )}
      </div>
      {/* باقي الحقول - تظهر دائماً */}
      {cart.length > 0 && (
        <>
          {/* بكس ملاحظات المستخدم */}
          <div className="mb-2 mt-8 w-full max-w-md">
            <label className="block text-gray-200 mb-1">ملاحظات إضافية (اختياري):</label>
            <textarea
              className="w-full rounded-xl p-3 bg-gray-900 border-2 border-green-300 text-white min-h-[40px] focus:ring-2 focus:ring-green-400 outline-none transition-all"
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              placeholder="اكتب أي ملاحظات أو تعليمات خاصة..."
            />
          </div>
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

          {/* نموذج بيانات المستخدم */}
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

          {/* خيارات الدفع */}
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
          <button onClick={handleCheckout} className="w-full mt-4 bg-pink-600 hover:bg-green-600 text-white font-extrabold py-4 rounded-full shadow text-xl transition max-w-md mx-auto">إتمام الطلب</button>
        </>
      )}
      <div className="mt-10 text-center w-full max-w-md">
        <Link href="/" className="inline-block bg-pink-600 hover:bg-green-600 text-white font-extrabold py-3 px-8 rounded-full shadow-lg text-lg transition-all">متابعة التسوق</Link>
      </div>
    </div>
  );
}
