import React from "react";


interface OrderProduct {
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface InvoiceProps {
  order: {
    id: number;
    customer: string;
    phone?: string;
    address?: string;
    total: number;
    status: string;
    date: string;
    products: OrderProduct[];
    deliveryFee?: number;
    paymentType?: string; // "cash" | "knet"
  };
  onClose: () => void;
}

import { useEffect, useRef } from "react";
const InvoiceModal: React.FC<InvoiceProps & { autoPrint?: boolean }> = ({ order, onClose, autoPrint }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoPrint && invoiceRef.current) {
      // بناء HTML الفاتورة فقط بدون أي عناصر جانبية
      const invoiceHtml = invoiceRef.current.innerHTML;
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl" lang="ar">
            <head>
              <title>فاتورة الطلب</title>
              <style>
                html, body { background: #fff !important; margin: 0; padding: 0; height: 100%; }
                body { display: flex; align-items: flex-start; justify-content: center; min-height: 100vh; }
                * { box-sizing: border-box; }
                .print-container {
                  font-family: Tahoma, Arial, sans-serif;
                  margin: 0 auto;
                  padding: 0;
                  width: 420px;
                  max-width: 100vw;
                  background: #fff;
                  border-radius: 16px;
                  box-shadow: 0 0 0.5rem #eee;
                  border: 1.5px solid #e5e7eb;
                  margin-top: 24px;
                }
                .print-container img { display: block; margin: 0 auto 8px auto; }
                .print-container h3, .print-container h2 { text-align: center; }
                .print-container table { margin: 0 auto; }
                .print-container .text-center { text-align: center; }
                .print-container .text-left { text-align: left; }
                .print-container .text-right { text-align: right; }
                .print-container .font-bold { font-weight: bold; }
                .print-container .mb-2 { margin-bottom: 0.5rem; }
                .print-container .mb-6 { margin-bottom: 1.5rem; }
                .print-container .mt-1 { margin-top: 0.25rem; }
                .print-container .rounded-full { border-radius: 9999px; }
                .print-container .border { border: 1px solid #e5e7eb; }
                .print-container .bg-white { background: #fff; }
                .print-container .bg-yellow-50 { background: #fefce8; }
                .print-container .bg-green-50 { background: #f0fdf4; }
                .print-container .bg-gray-50 { background: #f9fafb; }
                .print-container .bg-gray-100 { background: #f3f4f6; }
                .print-container .text-black { color: #222; }
                .print-container .text-pink-700 { color: #be185d; }
                .print-container .bg-pink-100 { background: #fce7f3; }
                .print-container .p-2 { padding: 0.5rem; }
                .print-container .p-6 { padding: 1.5rem; }
                .print-container .shadow-lg { box-shadow: 0 2px 8px #e5e7eb; }
                .print-container .border-gray-300 { border-color: #d1d5db; }
                .print-container .min-w-\[340px\] { min-width: 340px; }
                .print-container .max-w-full { max-width: 100vw; }
                .print-container .relative { position: relative; }
                .print-container .w-20 { width: 80px; }
                .print-container .h-20 { height: 80px; }
                .print-container .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
                .print-container .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
                .print-container .font-normal { font-weight: normal; }
                .print-container .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
                .print-container hr { border: none; border-top: 1px solid #e5e7eb; margin: 0.5rem 0; }
                @media print {
                  html, body { background: #fff !important; }
                  body { min-height: unset; }
                  .print-container { box-shadow: none !important; border: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="print-container">${invoiceHtml}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          onClose();
        }, 400);
      }
    }
  }, [autoPrint, onClose]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 print:bg-white print:bg-opacity-100 print:relative print:inset-auto print:block">
      <div ref={invoiceRef} id="invoice-print-root" className="bg-white rounded-lg shadow-lg p-6 min-w-[340px] max-w-full relative border-2 border-gray-300 print:shadow-none">
        {/* رقم الفاتورة أعلى الصفحة */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-pink-700 bg-pink-100 rounded-full px-3 py-1" style={{fontSize:'1rem'}}>
            #{1000 + (order.id ? Number(order.id) : 0)}
          </span>
          {/* نوع الدفع */}
          {order.paymentType && (
            <span className="text-xs font-bold text-blue-700 bg-blue-100 rounded-full px-3 py-1 ml-2" style={{fontSize:'1rem'}}>
              نوع الدفع: {order.paymentType === "knet" ? "رابط أونلاين" : "نقدي عند الاستلام"}
            </span>
          )}
        </div>
        {/* شعار الموقع */}
        <div className="flex justify-center mb-2">
          <img src="/images/fruits.png" alt="شعار المتجر" className="h-20 w-20 rounded-full border-2 border-gray-300 bg-white shadow" />
        </div>
        {/* بيانات العميل */}
        <div className="mb-6 flex flex-col items-end text-black">
          <div className="font-bold text-base">{order.customer}</div>
          {order.phone && <div className="text-sm">{order.phone}</div>}
          {order.address && order.phone && <div className="text-sm">{order.address}</div>}
          {order.address && !order.phone && <div className="text-sm mt-1">{order.address}</div>}
        </div>
        <div className="absolute top-2 left-2 flex gap-2">
          <button
            className="text-gray-500 hover:text-red-600 font-bold border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
            onClick={onClose}
            title="إغلاق"
          >
            ×
          </button>
          <button
            className="text-gray-500 hover:text-green-600 font-bold border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center print:hidden"
            onClick={() => window.print()}
            title="طباعة الفاتورة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25M3 18.75A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75M3 18.75V16.5A2.25 2.25 0 0 1 5.25 14.25h13.5A2.25 2.25 0 0 1 21 16.5v2.25" />
            </svg>
          </button>
        </div>
        {/* حذف رقم الفاتورة من هنا */}
        <div className="mb-2 flex justify-between text-black font-bold">
          <span>التاريخ:</span>
          <span className="font-normal text-black">{order.date}</span>
        </div>
        {/* تم حذف الحالة من الفاتورة */}
        <div className="my-4">
          <h3 className="font-bold mb-2 text-black text-center">تفاصيل المنتجات:</h3>
          <table className="w-full border text-center text-sm bg-white rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="p-2 border">المنتج</th>
                <th className="p-2 border">الوحدة</th>
                <th className="p-2 border">السعر</th>
                <th className="p-2 border">الكمية</th>
                <th className="p-2 border">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(order.products) && order.products.length > 0 ? (
                <>
                  {order.products.map((prod, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="border p-2 font-bold text-black">{prod.name}</td>
                      <td className="border p-2 text-black">{prod.unit}</td>
                      <td className="border p-2 text-black">{prod.price} د.ك</td>
                      <td className="border p-2 text-black">{prod.quantity}</td>
                      <td className="border p-2 font-bold text-black">{(prod.price * prod.quantity).toFixed(3)} د.ك</td>
                    </tr>
                  ))}
                  {/* صف سعر التوصيل */}
                  <tr className="bg-yellow-50">
                    <td colSpan={3} className="border p-2 text-left font-bold text-black">سعر التوصيل</td>
                    <td className="border p-2 font-bold text-black">-</td>
                    <td className="border p-2 font-bold text-black">{order.deliveryFee ? order.deliveryFee.toFixed(3) : '0.000'} د.ك</td>
                  </tr>
                  {/* خط فاصل */}
                  <tr>
                    <td colSpan={5} className="p-0"><hr className="border-gray-300 my-0" /></td>
                  </tr>
                  {/* صف المجموع */}
                  <tr className="bg-green-50">
                    <td colSpan={3} className="border p-2 text-left font-bold text-black">المجموع</td>
                    <td className="border p-2 font-bold text-black">{order.products.reduce((sum, p) => sum + (p.quantity || 0), 0)}</td>
                    <td className="border p-2 font-bold text-black">{((order.total || 0) + (order.deliveryFee || 0)).toFixed(3)} د.ك</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={5} className="border p-2 text-center text-gray-400">لا توجد منتجات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* ...تم حذف قسم سعر التوصيل تحت الجدول... */}
      </div>
    </div>
  );
};

export default InvoiceModal;
