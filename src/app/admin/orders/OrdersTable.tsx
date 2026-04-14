"use client";
import { useState, useEffect } from "react";
import OrderEditModal from "./OrderEditModal";
import InvoiceModal from "./InvoiceModal";
import { sendInvoiceViaWhatsApp } from "../../../lib/whatsappInvoice";
import { getOrderDisplayNumber, getOrderPricing, normalizeOrderForDisplay } from '../../../lib/orderUtils';
import { db } from "../../../lib/firebase";
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

interface OrderProduct {
  productId?: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  total?: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  customer: string;
  phone?: string;
  email?: string;
  address?: string;
  total: number;
  status: "جديد" | "قيد التنفيذ" | "مكتمل" | "ملغي";
  date: string;
  products: OrderProduct[];
  deliveryFee?: number;
  paymentType?: string;
  // Firebase fields
  delivery?: {
    address?: string;
    area?: string;
    block?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    notes?: string;
  };
  pricing?: {
    subtotal?: number;
    deliveryPrice?: number;
    total?: number;
  };
  items?: OrderProduct[];
  createdAt?: any;
  timestamp?: number;
}

function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState<{ orderId: string; type: string } | null>(null);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);

  // Transform Firebase order to match Order interface
  function transformFirebaseOrder(doc: any): Order {
    const data = doc.data();
    
    console.log('🔍 Transforming order:', doc.id, data);
    
    // Map Firebase status to Arabic status (handle both old and new statuses)
    const statusMap: Record<string, Order['status']> = {
      'new': 'جديد',
      'pending': 'جديد',
      'confirmed': 'قيد التنفيذ',
      'preparing': 'قيد التنفيذ',
      'delivering': 'قيد التنفيذ',
      'completed': 'مكتمل',
      'مكتمل': 'مكتمل',
      'جديد': 'جديد',
      'قيد التنفيذ': 'قيد التنفيذ',
      'cancelled': 'ملغي',
      'ملغي': 'ملغي'
    };

    const normalized = normalizeOrderForDisplay({ id: doc.id, ...data });

    // Get date
    let date = new Date().toISOString();
    if (data.createdAt) {
      try {
        if (typeof data.createdAt.toDate === 'function') {
          date = data.createdAt.toDate().toISOString();
        }
      } catch {
        date = new Date().toISOString();
      }
    } else if (data.timestamp) {
      date = new Date(data.timestamp).toISOString();
    }
    
    return {
      id: doc.id,
      orderNumber: normalized.orderNumber,
      customer: normalized.customer,
      phone: normalized.phone,
      email: normalized.email,
      address: normalized.address,
      total: normalized.total,
      status: statusMap[data.status] || 'جديد',
      date,
      products: normalized.products,
      deliveryFee: normalized.deliveryFee,
      paymentType: normalized.paymentMethod,
      delivery: data.delivery || data.deliveryAddress,
      pricing: data.pricing || {
        subtotal: normalized.subtotal,
        deliveryPrice: normalized.deliveryFee,
        total: normalized.total,
      },
      items: normalized.items,
      createdAt: data.createdAt,
      timestamp: data.timestamp
    };
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !("Notification" in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      setBrowserNotificationsEnabled(true);
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        setBrowserNotificationsEnabled(true);
      }
    }).catch(() => {
      setBrowserNotificationsEnabled(false);
    });
  }, []);

  // تحديث الطلبات من Firebase
  useEffect(() => {
    // Check if Firebase is available
    if (!db) {
      console.warn('Firebase not initialized, falling back to localStorage only');
      // Fallback to localStorage only
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("orders");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const localOrders = parsed.map((order: any) => ({
                ...order,
                id: `local_${order.id}`
              }));
              setOrders(localOrders);
            }
          } catch (e) {
            console.error("Error parsing orders from localStorage:", e);
          }
        }
      }
      return;
    }

    // Real-time listener for Firebase orders
    const ordersRef = collection(db, 'orders');
    // Try without orderBy first to see if we get any data
    // const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    console.log('🔥 Setting up Firebase listener for orders...');
    
    const seenOrders = new Set<string>();

    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      console.log('📦 Received orders from Firebase:', snapshot.docs.length, 'orders');
      const firebaseOrders = snapshot.docs.map(doc => {
        console.log('📝 Order doc:', doc.id, doc.data());
        return transformFirebaseOrder(doc);
      });
      console.log('✅ Transformed Firebase orders:', firebaseOrders);

      console.log('🎯 Total orders to display:', firebaseOrders.length, 'orders');

      if (browserNotificationsEnabled) {
        firebaseOrders.forEach((order) => {
          if (!seenOrders.has(order.id)) {
            if (seenOrders.size > 0) {
              new Notification('طلب جديد وصل', {
                body: `${order.customer} - ${getOrderPricing(order).total.toFixed(3)} د.ك`,
                tag: order.id,
              });
            }
            seenOrders.add(order.id);
          }
        });
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('orders', JSON.stringify(firebaseOrders));
      }

      setOrders(firebaseOrders);
    }, (error) => {
      console.error('❌ Error listening to orders:', error);
      
      // Fallback to localStorage only
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("orders");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              const localOrders = parsed.map((order: any) => ({
                ...order,
                id: `local_${order.id}`
              }));
              setOrders(localOrders);
            }
          } catch (e) {
            console.error("Error parsing orders from localStorage:", e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEditSave = async (updated: Order) => {
    // Check if it's a Firebase order (not prefixed with 'local_')
    if (!updated.id.startsWith('local_')) {
      // Update in Firebase
      try {
        if (db) {
          const orderRef = doc(db, 'orders', updated.id);
          
          // Map status back to English
          const statusMapReverse: Record<Order['status'], string> = {
            'جديد': 'pending',
            'قيد التنفيذ': 'confirmed',
            'مكتمل': 'completed',
            'ملغي': 'cancelled'
          };
          
          await updateDoc(orderRef, {
            status: statusMapReverse[updated.status] || 'pending',
            'customer.name': updated.customer,
            'customer.phone': updated.phone,
            total: updated.total,
            deliveryFee: updated.deliveryFee,
            paymentType: updated.paymentType,
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error updating order in Firebase:', error);
        alert('فشل تحديث الطلب');
        return;
      }
    } else {
      // Update in localStorage for legacy orders
      setOrders(prev => {
        const updatedOrders = prev.map((o: Order) => o.id === updated.id ? updated : o);
        if (typeof window !== "undefined") {
          // Remove 'local_' prefix before saving to localStorage
          const localOrders = updatedOrders
            .filter(o => o.id.startsWith('local_'))
            .map(o => ({ ...o, id: o.id.replace('local_', '') }));
          window.localStorage.setItem("orders", JSON.stringify(localOrders));
        }
        return updatedOrders;
      });
    }
    setEditOrder(null);
  };

  // حذف الطلب (الفاتورة)
  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('هل أنت متأكد من حذف الفاتورة؟')) {
      // Check if it's a Firebase order
      if (!orderId.startsWith('local_')) {
        // Delete from Firebase
        try {
          if (db) {
            const orderRef = doc(db, 'orders', orderId);
            await deleteDoc(orderRef);
          }
        } catch (error) {
          console.error('Error deleting order from Firebase:', error);
          alert('فشل حذف الطلب');
        }
      } else {
        // Delete from localStorage for legacy orders
        setOrders(prev => {
          const updated = prev.filter(o => o.id !== orderId);
          if (typeof window !== 'undefined') {
            const localOrders = updated
              .filter(o => o.id.startsWith('local_'))
              .map(o => ({ ...o, id: o.id.replace('local_', '') }));
            window.localStorage.setItem('orders', JSON.stringify(localOrders));
          }
          return updated;
        });
      }
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

  // ترتيب الطلبات: الأحدث أولاً (حسب createdAt أو timestamp أو date)
  const sortedOrders = [...orders].sort((a, b) => {
    // الأفضلية: timestamp > createdAt > date
    const getTime = (order: Order) => {
      if (order.timestamp) return order.timestamp;
      if (order.createdAt && typeof order.createdAt.toDate === 'function') return order.createdAt.toDate().getTime();
      if (order.date) return new Date(order.date).getTime();
      return 0;
    };
    return getTime(b) - getTime(a);
  });

  // دالة تنسيق التاريخ والوقت بشكل احترافي
  function formatDateTime(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('ar-KW', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' - ' + d.toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-100 p-4 text-center">
          <div className="text-2xl mb-2">📦</div>
          <div className="text-sm font-medium text-slate-600">إجمالي الطلبات</div>
          <div className="text-xl font-bold text-cyan-700">{orders.length}</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-100 p-4 text-center">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm font-medium text-slate-600">مكتملة</div>
          <div className="text-xl font-bold text-emerald-700">{orders.filter(o => o.status === 'مكتمل').length}</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-100 p-4 text-center">
          <div className="text-2xl mb-2">⏳</div>
          <div className="text-sm font-medium text-slate-600">قيد التنفيذ</div>
          <div className="text-xl font-bold text-amber-700">{orders.filter(o => o.status === 'قيد التنفيذ').length}</div>
        </div>
        <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-cyan-100 p-4 text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-sm font-medium text-slate-600">إجمالي المبيعات</div>
          <div className="text-lg font-bold text-teal-700">{orders.reduce((sum, o) => sum + getOrderPricing(o).total, 0).toFixed(3)} د.ك</div>
        </div>
      </div>

      {/* جدول الطلبات */}
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white/92 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
        <div className="p-6 bg-gradient-to-r from-green-500 to-blue-500">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span>
            إدارة الطلبات والفواتير
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-right font-semibold text-slate-700">رقم الطلب</th>
                <th className="p-4 text-right font-semibold text-slate-700">العميل</th>
                <th className="p-4 text-right font-semibold text-slate-700">الهاتف</th>
                <th className="p-4 text-right font-semibold text-slate-700">الإجمالي</th>
                <th className="p-4 text-right font-semibold text-slate-700">الحالة</th>
                <th className="p-4 text-right font-semibold text-slate-700">التاريخ</th>
                <th className="p-4 text-center font-semibold text-slate-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order, index) => (
                <tr key={order.id} className={`border-b border-slate-200 transition-colors hover:bg-emerald-50/60 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="p-4 font-bold text-cyan-700">{getOrderDisplayNumber(order)}</td>
                  <td className="p-4 font-medium">{order.customer}</td>
                  <td className="p-4 text-slate-600">{order.phone || 'غير محدد'}</td>
                  <td className="p-4 font-bold text-emerald-700">{getOrderPricing(order).total.toFixed(3)} د.ك</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'قيد التنفيذ' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'جديد' ? 'bg-cyan-100 text-cyan-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{formatDateTime(order.date)}</td>
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
              <h3 className="text-xl font-semibold text-slate-600 mb-2">لا توجد طلبات</h3>
              <p className="text-slate-500">لم يتم إنشاء أي طلبات بعد</p>
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
