"use client";
import { useState, useEffect } from "react";
import OrderEditModal from "./OrderEditModal";
import InvoiceModal from "./InvoiceModal";
import { sendInvoiceViaWhatsApp } from "../../../lib/whatsappInvoice";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";

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

    // Build address from delivery object
    let address = '';
    
    // التحقق من deliveryAddress (من التطبيق) أو delivery (من الموقع)
    const deliveryData = data.deliveryAddress || data.delivery;
    
    if (deliveryData) {
      // إذا كان هناك fullAddress جاهز، استخدمه مباشرة
      if (deliveryData.fullAddress) {
        address = deliveryData.fullAddress;
      } else {
        // بناء العنوان من الحقول المنفصلة
        const parts = [];
        if (deliveryData.area) parts.push(deliveryData.area);
        if (deliveryData.block) parts.push(`قطعة ${deliveryData.block}`);
        if (deliveryData.street) parts.push(`شارع ${deliveryData.street}`);
        if (deliveryData.building) parts.push(`بناية ${deliveryData.building}`);
        if (deliveryData.floor) parts.push(`دور ${deliveryData.floor}`);
        if (deliveryData.apartment) parts.push(`شقة ${deliveryData.apartment}`);
        address = parts.join('، ');
        if (deliveryData.notes) address += ` - ${deliveryData.notes}`;
      }
    }

    // Get products from items or products field
    const products = (data.items || data.products || []).map((item: any) => ({
      productId: item.productId || '',
      name: item.name || '',
      unit: item.unit || '',
      price: item.price || 0,
      quantity: item.quantity || 0,
      total: item.total || (item.price * item.quantity),
      image: item.image || ''
    }));

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
    
    // Get customer name - handle different formats
    let customerName = 'عميل';
    if (data.customer) {
      if (typeof data.customer === 'string') {
        customerName = data.customer;
      } else if (data.customer.name) {
        customerName = data.customer.name;
      }
    }
    
    // Get phone - handle different formats
    let phone = '';
    if (data.customer && typeof data.customer === 'object' && data.customer.phone) {
      phone = data.customer.phone;
    } else if (data.phone) {
      phone = data.phone;
    }

    return {
      id: doc.id,
      orderNumber: data.orderNumber || `#${doc.id.slice(-6)}`,
      customer: customerName,
      phone: phone,
      email: data.customer?.email || data.email || '',
      address: address || data.deliveryAddress?.fullAddress || data.delivery?.address || data.address || 'غير محدد',
      total: data.pricing?.total || data.total || 0,
      status: statusMap[data.status] || 'جديد',
      date,
      products,
      deliveryFee: data.pricing?.deliveryPrice || data.deliveryFee || 0,
      paymentType: data.paymentType || 'نقدي',
      delivery: data.delivery,
      pricing: data.pricing,
      items: data.items,
      createdAt: data.createdAt,
      timestamp: data.timestamp
    };
  }

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
    
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      console.log('📦 Received orders from Firebase:', snapshot.docs.length, 'orders');
      const firebaseOrders = snapshot.docs.map(doc => {
        console.log('📝 Order doc:', doc.id, doc.data());
        return transformFirebaseOrder(doc);
      });
      console.log('✅ Transformed Firebase orders:', firebaseOrders);
      
      // Get localStorage orders (legacy)
      let localOrders: Order[] = [];
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("orders");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              localOrders = parsed.map((order: any) => ({
                ...order,
                id: `local_${order.id}` // Prefix to avoid conflicts
              }));
            }
          } catch (e) {
            console.error("Error parsing orders from localStorage:", e);
          }
        }
      }
      
      // Merge orders (Firebase first, then localStorage)
      const allOrders = [...firebaseOrders, ...localOrders];
      console.log('🎯 Total orders to display:', allOrders.length, 'orders');
      setOrders(allOrders);
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
