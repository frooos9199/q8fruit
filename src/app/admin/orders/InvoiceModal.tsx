import React from "react";


interface OrderProduct {
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface InvoiceProps {
  order: {
    id: string;
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
      try {
        const invoiceHtml = invoiceRef.current.innerHTML;
        // تنظيف HTML من المحتوى الضار
        const cleanHtml = invoiceHtml
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+="[^"]*"/gi, '');
          
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        if (printWindow) {
          printWindow.document.write(`
            <html dir="rtl" lang="ar">
              <head>
                <title>فاتورة الطلب</title>
                <style>
                  * { box-sizing: border-box; margin: 0; padding: 0; }
                  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f8fafc; padding: 20px; }
                  .invoice { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                  .logo { width: 80px; height: 80px; border-radius: 50%; border: 4px solid white; margin: 0 auto 15px; }
                  .invoice-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                  .invoice-number { background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 25px; display: inline-block; }
                  .customer-info { padding: 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
                  .customer-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                  .customer-details { font-size: 16px; opacity: 0.9; }
                  .products-section { padding: 30px; }
                  .products-title { text-align: center; font-size: 22px; font-weight: bold; color: #4a5568; margin-bottom: 20px; }
                  .products-table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                  .products-table th { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px; font-weight: bold; }
                  .products-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; }
                  .products-table tr:nth-child(even) { background: #f7fafc; }
                  .products-table tr:hover { background: #edf2f7; }
                  .delivery-row { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%) !important; }
                  .total-row { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important; font-weight: bold; font-size: 18px; }
                  .footer { background: #2d3748; color: white; padding: 25px; text-align: center; }
                  .footer-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                  .footer-contact { font-size: 14px; opacity: 0.8; }
                  .payment-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
                  @media print { body { background: white; padding: 0; } .invoice { box-shadow: none; } }
                </style>
              </head>
              <body>
                <div class="invoice">${cleanHtml}</div>
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
      } catch (error) {
        console.error('خطأ في طباعة الفاتورة:', error);
        alert('حدث خطأ أثناء طباعة الفاتورة');
      }
    }
  }, [autoPrint, onClose]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={invoiceRef} className="invoice max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="header">
          <img src="/images/fruits.png" alt="شعار المتجر" className="logo" />
          <div className="invoice-title">🍎 متجر الفواكه والخضار</div>
          <div className="invoice-number">فاتورة رقم #{1000 + (order.id ? Number(order.id) : 0)}</div>
          <div style={{marginTop: '15px', fontSize: '14px'}}>📅 {order.date}</div>
          {order.paymentType && (
            <div className="payment-badge" style={{marginTop: '10px'}}>
              💳 {order.paymentType === "knet" ? "دفع أونلاين" : "نقدي عند الاستلام"}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="customer-info">
          <div className="customer-name">👤 {order.customer}</div>
          <div className="customer-details">
            {order.phone && <div>📱 {order.phone}</div>}
            {order.address && <div>📍 {order.address}</div>}
          </div>
        </div>

        {/* Products */}
        <div className="products-section">
          <div className="products-title">📦 تفاصيل المنتجات</div>
          <table className="products-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الوحدة</th>
                <th>السعر</th>
                <th>الكمية</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(order.products) && order.products.length > 0 ? (
                <>
                  {order.products.map((prod, idx) => (
                    <tr key={idx}>
                      <td style={{fontWeight: 'bold'}}>{prod.name}</td>
                      <td style={{textAlign: 'center'}}>{prod.unit}</td>
                      <td style={{textAlign: 'center', color: '#4299e1'}}>{prod.price.toFixed(3)} د.ك</td>
                      <td style={{textAlign: 'center', fontWeight: 'bold'}}>{prod.quantity}</td>
                      <td style={{textAlign: 'center', fontWeight: 'bold', color: '#48bb78'}}>{(prod.price * prod.quantity).toFixed(3)} د.ك</td>
                    </tr>
                  ))}
                  <tr className="delivery-row">
                    <td colSpan={3} style={{textAlign: 'left', fontWeight: 'bold'}}>🚚 رسوم التوصيل</td>
                    <td style={{textAlign: 'center', fontWeight: 'bold'}}>-</td>
                    <td style={{textAlign: 'center', fontWeight: 'bold'}}>{order.deliveryFee ? order.deliveryFee.toFixed(3) : '0.000'} د.ك</td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan={3} style={{textAlign: 'left'}}>💰 المجموع الكلي</td>
                    <td style={{textAlign: 'center'}}>{order.products.reduce((sum, p) => sum + (p.quantity || 0), 0)}</td>
                    <td style={{textAlign: 'center'}}>{((order.total || 0) + (order.deliveryFee || 0)).toFixed(3)} د.ك</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', color: '#a0aec0'}}>لا توجد منتجات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-title">شكراً لتسوقكم معنا! 🌟</div>
          <div className="footer-contact">
            📱 للاستفسار: 98899426 | 🌐 متجر الفواكه والخضار الكويت
          </div>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => window.print()}
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all"
          title="طباعة"
        >
          🖨️
        </button>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all"
          title="إغلاق"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default InvoiceModal;
