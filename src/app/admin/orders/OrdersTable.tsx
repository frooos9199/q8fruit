"use client";
import { useState } from "react";
import OrderEditModal from "./OrderEditModal";
import InvoiceModal from "./InvoiceModal";
import { sendInvoiceViaWhatsApp } from "../../../lib/whatsappInvoice";

interface OrderProduct {
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer: string;
  phone?: string;
  address?: string;
  total: number;
  status: "جديد" | "قيد التنفيذ" | "مكتمل" | "ملغي";
  date: string;
  products: OrderProduct[];
  deliveryFee?: number;
  paymentType?: string;
}

import { useEffect } from "react";
import { useRef } from "react";

function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState<{ orderId: number; type: string } | null>(null);

  // تحديث الطلبات عند أي تغيير في localStorage
  useEffect(() => {
    function getOrdersFromStorage(): Order[] {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("orders");
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {}
        }
      }
      // بيانات افتراضية فقط إذا لم يوجد أي طلبات
      return [
        {
          id: 1,
          customer: "محمد أحمد",
          phone: "55512345",
          address: "الكويت - السالمية",
          total: 12.5,
          status: "جديد",
          date: "2025-11-28",
          deliveryFee: 1.5,
          paymentType: "cash",
          products: [
            { name: "تفاح أحمر", unit: "كيلو", price: 3.5, quantity: 2 },
            { name: "موز", unit: "كيلو", price: 2.5, quantity: 1 },
            { name: "برتقال", unit: "كيلو", price: 4, quantity: 1 },
          ],
        },
        {
          id: 2,
          customer: "سارة علي",
          phone: "55567890",
          address: "الكويت - حولي",
          total: 8.0,
          status: "قيد التنفيذ",
          date: "2025-11-27",
          deliveryFee: 1.0,
          paymentType: "knet",
          products: [
            { name: "تفاح أخضر", unit: "كيلو", price: 4, quantity: 1 },
            { name: "عنب", unit: "كيلو", price: 4, quantity: 1 },
          ],
        },
        {
          id: 3,
          customer: "خالد يوسف",
          phone: "55522222",
          address: "الكويت - الفروانية",
          total: 15.2,
          status: "مكتمل",
          date: "2025-11-26",
          deliveryFee: 2.0,
          paymentType: "cash",
          products: [
            { name: "بطيخ", unit: "حبة", price: 7, quantity: 1 },
            { name: "مانجو", unit: "كيلو", price: 8.2, quantity: 1 },
          ],
        },
        {
          id: 4,
          customer: "أحمد سالم",
          phone: "55533333",
          address: "الكويت - الجهراء",
          total: 5.5,
          status: "ملغي",
          date: "2025-11-25",
          deliveryFee: 1.5,
          paymentType: "cash",
          products: [
            { name: "خيار", unit: "كيلو", price: 2.5, quantity: 1 },
            { name: "طماطم", unit: "كيلو", price: 3, quantity: 1 },
          ],
        },
      ];
    }
    function updateOrders() {
      setOrders(getOrdersFromStorage());
    }
    window.addEventListener("storage", updateOrders);
    // تحديث عند الدخول للصفحة أيضاً
    updateOrders();
    return () => window.removeEventListener("storage", updateOrders);
  }, []);

  const handleEditSave = async (updated: Order) => {
    setOrders(prev => {
      const updatedOrders = prev.map((o: Order) => o.id === updated.id ? updated : o);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("orders", JSON.stringify(updatedOrders));
        // مزامنة فورية مع Firebase
        import('../../../lib/firebaseSync').then(({ syncAllDataToFirebase }) => {
          syncAllDataToFirebase().catch(console.error);
        });
      }
      return updatedOrders;
    });
    setEditOrder(null);
  };

  // حذف الطلب (الفاتورة) من localStorage
  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm('هل أنت متأكد من حذف الفاتورة؟')) {
      setOrders(prev => {
        const updated = prev.filter(o => o.id !== orderId);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('orders', JSON.stringify(updated));
          // مزامنة فورية مع Firebase
          import('../../../lib/firebaseSync').then(({ syncAllDataToFirebase }) => {
            syncAllDataToFirebase().catch(console.error);
          });
        }
        return updated;
      });
    }
  };

  // إرسال الفاتورة عبر الواتساب
  const handleSendWhatsApp = async (order: Order, recipient: 'admin' | 'customer') => {
    setSendingWhatsApp({ orderId: order.id, type: recipient });
    
    try {
      const result = await sendInvoiceViaWhatsApp(order, recipient);
      
      if (result.success) {
        alert(`✅ تم إرسال الفاتورة ${recipient === 'admin' ? 'للإدارة' : 'للعميل'} بنجاح!`);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert('❌ حدث خطأ في إرسال الفاتورة');
    } finally {
      setSendingWhatsApp(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-700">
          <div className="text-2xl mb-2">📦</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">إجمالي الطلبات</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{orders.length}</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-4 text-center border border-green-200 dark:border-green-700">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">مكتملة</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{orders.filter(o => o.status === 'مكتمل').length}</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl p-4 text-center border border-orange-200 dark:border-orange-700">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">قيد التنفيذ</div>
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{orders.filter(o => o.status === 'قيد التنفيذ').length}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-700">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">إجمالي المبيعات</div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{orders.reduce((sum, o) => sum + (o.total + (o.deliveryFee || 0)), 0).toFixed(3)} د.ك</div>
        </div>
      </div>

      {/* جدول الطلبات */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 bg-gradient-to-r from-green-500 to-blue-500">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span>
            إدارة الطلبات والفواتير
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-300">رقم الطلب</th>
                <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-300">العميل</th>
                <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-300">الهاتف</th>
                <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-300">الإجمالي</th>
                <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
                <th className="p-4 text-right font-semibold text-gray-700 dark:text-gray-300">التاريخ</th>
                <th className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id} className={`border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}`}>
                  <td className="p-4 font-bold text-blue-600 dark:text-blue-400">#{1000 + order.id}</td>
                  <td className="p-4 font-medium">{order.customer}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{order.phone || 'غير محدد'}</td>
                  <td className="p-4 font-bold text-green-600 dark:text-green-400">{((order.total || 0) + (order.deliveryFee || 0)).toFixed(3)} د.ك</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'مكتمل' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      order.status === 'قيد التنفيذ' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      order.status === 'جديد' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{order.date}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {/* تعديل */}
                      <button
                        onClick={() => setEditOrder(order)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        title="تعديل الطلب"
                      >
                        <span>✏️</span>
                        <span className="hidden sm:inline">تعديل</span>
                      </button>
                      
                      {/* عرض الفاتورة */}
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        title="عرض الفاتورة"
                      >
                        <span>👁️</span>
                        <span className="hidden sm:inline">عرض</span>
                      </button>
                      
                      {/* طباعة */}
                      <button
                        onClick={() => setPrintOrder(order)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        title="طباعة الفاتورة"
                      >
                        <span>🖨️</span>
                        <span className="hidden sm:inline">طباعة</span>
                      </button>
                      
                      {/* إرسال للإدارة */}
                      <button
                        onClick={() => handleSendWhatsApp(order, 'admin')}
                        disabled={sendingWhatsApp?.orderId === order.id && sendingWhatsApp?.type === 'admin'}
                        className="px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        title="إرسال للإدارة عبر الواتساب"
                      >
                        <span>👨‍💼</span>
                        <span className="hidden sm:inline">
                          {sendingWhatsApp?.orderId === order.id && sendingWhatsApp?.type === 'admin' ? 'جاري الإرسال...' : 'للإدارة'}
                        </span>
                      </button>
                      
                      {/* إرسال للعميل */}
                      <button
                        onClick={() => handleSendWhatsApp(order, 'customer')}
                        disabled={sendingWhatsApp?.orderId === order.id && sendingWhatsApp?.type === 'customer' || !order.phone}
                        className="px-3 py-1 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        title={order.phone ? 'إرسال للعميل عبر الواتساب' : 'رقم الهاتف غير متوفر'}
                      >
                        <span>👤</span>
                        <span className="hidden sm:inline">
                          {sendingWhatsApp?.orderId === order.id && sendingWhatsApp?.type === 'customer' ? 'جاري الإرسال...' : 'للعميل'}
                        </span>
                      </button>
                      
                      {/* حذف */}
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        title="حذف الطلب"
                      >
                        <span>🗑️</span>
                        <span className="hidden sm:inline">حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-500 dark:text-gray-500">لم يتم إنشاء أي طلبات بعد</p>
            </div>
          )}
        </div>
      </div>
      
      {/* المودالات */}
      {editOrder && (
        <OrderEditModal
          order={editOrder}
          onSave={handleEditSave}
          onClose={() => setEditOrder(null)}
        />
      )}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
      {printOrder && (
        <InvoiceModal
          order={printOrder}
          onClose={() => setPrintOrder(null)}
          autoPrint={true}
        />
      )}
    </div>
  );
}

export default OrdersTable;
