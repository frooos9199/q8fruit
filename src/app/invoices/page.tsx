"use client";
import { useEffect, useState } from "react";
import InvoicePrint from "../admin/orders/InvoicePrint";

// دالة تنسيق التاريخ والوقت بشكل احترافي (مطابقة للأدمن)
function formatDateTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('ar-KW', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' - ' + d.toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' });
}

interface User {
  email: string;
  name?: string;
  phone?: string;
}

interface Invoice {
  id: string;
  orderNumber?: string;
  userEmail: string;
  items?: any[];
  products?: any[];
  total: number;
  date: string;
  status: string;
  userInfo?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  customer?: string;
  phone?: string;
  address?: string;
  deliveryPrice?: number;
  deliveryFee?: number;
  paymentType?: string;
}

export default function InvoicesPage() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("currentUser");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window !== "undefined" && user) {
      const invStr = window.localStorage.getItem("invoices");
      if (invStr) {
        try {
          const allInvoices = JSON.parse(invStr).filter((inv: Invoice) => inv.userEmail === user.email);
          // ترتيب الفواتير من الأحدث للأقدم
          return allInvoices.sort((a: any, b: any) => {
            const getTime = (inv: any) => {
              if (inv.timestamp) return inv.timestamp;
              if (inv.date) return new Date(inv.date).getTime();
              return 0;
            };
            return getTime(b) - getTime(a);
          });
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  if (!user) return <div className="p-8 text-center text-lg text-slate-600">يجب تسجيل الدخول أولاً.</div>;

  return (
    <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/80 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
      <h1 className="mb-4 text-center text-2xl font-bold text-emerald-700">فواتيري</h1>
      {invoices.length === 0 ? (
        <div className="text-slate-500">لا توجد فواتير.</div>
      ) : (
        <ul className="space-y-2">
          {invoices.map((inv, i) => (
            <li key={i} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="font-bold">رقم الفاتورة:</span> {inv.orderNumber || inv.id}
                <span className="font-bold ml-4">المجموع:</span> {inv.total} د.ك
                <span className="font-bold ml-4">تاريخ:</span> {formatDateTime(inv.date)}
              </div>
              <button
                className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-1 font-bold text-white transition-all hover:from-emerald-700 hover:to-teal-600"
                onClick={() => setSelectedInvoice(inv)}
              >
                عرض الفاتورة
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="relative max-w-full rounded-2xl bg-white p-4 shadow-2xl">
            <button
              className="absolute top-2 left-2 text-gray-500 hover:text-red-600 font-bold border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setSelectedInvoice(null)}
              title="إغلاق"
            >
              ×
            </button>
            <InvoicePrint
              invoiceNumber={selectedInvoice.orderNumber || selectedInvoice.id}
              customer={selectedInvoice.userInfo?.name || selectedInvoice.customer || "عميل"}
              phone={selectedInvoice.userInfo?.phone || selectedInvoice.phone || ""}
              address={selectedInvoice.userInfo?.address || selectedInvoice.address || ""}
              date={selectedInvoice.date}
              products={selectedInvoice.items || selectedInvoice.products || []}
              deliveryFee={selectedInvoice.deliveryPrice || selectedInvoice.deliveryFee || 0}
              total={selectedInvoice.total - (selectedInvoice.deliveryPrice || selectedInvoice.deliveryFee || 0)}
              paymentType={selectedInvoice.paymentType}
            />
          </div>
        </div>
      )}
    </div>
  );
}
