"use client";
import { useState } from "react";
import OrderEditModal from "./OrderEditModal";
import InvoiceModal from "./InvoiceModal";


interface OrderProduct {
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customer: string;
  total: number;
  status: "جديد" | "قيد التنفيذ" | "مكتمل" | "ملغي";
  date: string;
  products: OrderProduct[];
}

// جلب الطلبات من localStorage أو استخدام بيانات افتراضية



import { useEffect } from "react";

import { useRef } from "react";
function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

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
          total: 12.5,
          status: "جديد",
          date: "2025-11-28",
          products: [
            { name: "تفاح أحمر", unit: "كيلو", price: 3.5, quantity: 2 },
            { name: "موز", unit: "كيلو", price: 2.5, quantity: 1 },
            { name: "برتقال", unit: "كيلو", price: 4, quantity: 1 },
          ],
        },
        {
          id: 2,
          customer: "سارة علي",
          total: 8.0,
          status: "قيد التنفيذ",
          date: "2025-11-27",
          products: [
            { name: "تفاح أخضر", unit: "كيلو", price: 4, quantity: 1 },
            { name: "عنب", unit: "كيلو", price: 4, quantity: 1 },
          ],
        },
        {
          id: 3,
          customer: "خالد يوسف",
          total: 15.2,
          status: "مكتمل",
          date: "2025-11-26",
          products: [
            { name: "بطيخ", unit: "حبة", price: 7, quantity: 1 },
            { name: "مانجو", unit: "كيلو", price: 8.2, quantity: 1 },
          ],
        },
        {
          id: 4,
          customer: "أحمد سالم",
          total: 5.5,
          status: "ملغي",
          date: "2025-11-25",
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

  const handleEditSave = (updated: Order) => {
    setOrders(prev => {
      const updatedOrders = prev.map((o: Order) => o.id === updated.id ? updated : o);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("orders", JSON.stringify(updatedOrders));
      }
      return updatedOrders;
    });
    setEditOrder(null);
  };

  // حذف الطلب (الفاتورة) من localStorage
  const handleDeleteOrder = (orderId: number) => {
    if (window.confirm('هل أنت متأكد من حذف الفاتورة؟')) {
      setOrders(prev => {
        const updated = prev.filter(o => o.id !== orderId);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('orders', JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <span className="text-lg font-bold">عدد الطلبات: </span>
        <span className="text-lg text-blue-600 font-bold">{orders.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-center">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2">رقم الطلب</th>
              <th className="p-2">العميل</th>
              <th className="p-2">الإجمالي</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">التاريخ</th>
              <th className="p-2">تعديل</th>
              <th className="p-2">عرض الفاتورة</th>
              <th className="p-2">حذف</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b">
                <td className="p-2">{order.id}</td>
                <td className="p-2">{order.customer}</td>
                <td className="p-2">{order.total} د.ك</td>
                <td className="p-2">{order.status}</td>
                <td className="p-2">{order.date}</td>
                <td className="p-2">
                  <button
                    onClick={() => setEditOrder(order)}
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                  >
                    تعديل
                  </button>
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => setInvoiceOrder(order)}
                    className="px-3 py-1 rounded bg-green-600 text-white"
                  >
                    عرض الفاتورة
                  </button>
                  <button
                    onClick={() => setPrintOrder(order)}
                    className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-900"
                  >
                    طباعة
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
