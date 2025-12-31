"use client";
import { useEffect, useState } from "react";
import InvoicePrint from "../admin/orders/InvoicePrint";

interface User {
  email: string;
  name?: string;
  phone?: string;
}

interface Invoice {
  id: string;
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
          const allInvoices = JSON.parse(invStr);
          return allInvoices.filter((inv: Invoice) => inv.userEmail === user.email);
        } catch {
          return [];
        }
      }
    }
    return [];
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  if (!user) return <div className="p-8 text-center text-lg">يجب تسجيل الدخول أولاً.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-green-700">فواتيري</h1>
      {invoices.length === 0 ? (
        <div className="text-gray-500">لا توجد فواتير.</div>
      ) : (
        <ul className="space-y-2">
          {invoices.map((inv, i) => (
            <li key={i} className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <span className="font-bold">رقم الفاتورة:</span> {inv.id}
                <span className="font-bold ml-4">المجموع:</span> {inv.total} د.ك
                <span className="font-bold ml-4">تاريخ:</span> {inv.date}
              </div>
              <button
                className="px-3 py-1 rounded bg-green-600 text-white font-bold hover:bg-green-800"
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
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-full relative">
            <button
              className="absolute top-2 left-2 text-gray-500 hover:text-red-600 font-bold border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setSelectedInvoice(null)}
              title="إغلاق"
            >
              ×
            </button>
            <InvoicePrint
              invoiceNumber={selectedInvoice.id}
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
