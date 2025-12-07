import React from "react";

interface InvoiceProduct {
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface InvoiceProps {
  invoiceNumber: string | number;
  customer: string;
  phone?: string;
  address?: string;
  date: string;
  products?: InvoiceProduct[];
  deliveryFee?: number;
  total: number;
  paymentType?: string; // "cash" | "knet"
}

const InvoicePrint: React.FC<InvoiceProps> = ({
  invoiceNumber,
  customer,
  phone,
  address,
  date,
  products = [],
  deliveryFee = 0,
  total,
  paymentType,
}) => {
  // تحويل قيمة الدفع لنص عربي واضح
  const paymentTypeLabel = paymentType === "knet" ? "رابط أونلاين" : "نقدي عند الاستلام";
  return (
    <div style={{
      width: '100%',
      maxWidth: 800,
      margin: '40px auto',
      background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
      borderRadius: 20,
      border: '3px solid #10b981',
      boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2)',
      fontFamily: 'Tahoma, Arial, sans-serif',
      padding: 40,
      color: '#1f2937',
      direction: 'rtl'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: '3px solid #10b981'
      }}>
        <div>
          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 'bold', 
            color: '#10b981',
            margin: 0,
            marginBottom: 8
          }}>
            فاتورة مبيعات
          </h1>
          <div style={{ 
            fontSize: 18, 
            color: '#6b7280',
            fontWeight: 'bold'
          }}>
            رقم الفاتورة: <span style={{ 
              color: '#10b981',
              background: '#d1fae5',
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: 20
            }}>#{invoiceNumber}</span>
          </div>
        </div>
        <img 
          src="/images/fruits.png" 
          alt="شعار المتجر" 
          style={{ 
            height: 100, 
            width: 100, 
            borderRadius: '50%', 
            border: '4px solid #10b981',
            background: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }} 
        />
      </div>

      {/* معلومات العميل والتاريخ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        marginBottom: 30,
        background: '#f0fdf4',
        padding: 20,
        borderRadius: 12,
        border: '2px solid #d1fae5'
      }}>
        <div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>معلومات العميل:</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#059669', marginBottom: 4 }}>
            👤 {customer}
          </div>
          {phone && (
            <div style={{ fontSize: 16, color: '#374151', marginBottom: 4 }}>
              📱 {phone}
            </div>
          )}
          {address && (
            <div style={{ fontSize: 16, color: '#374151' }}>
              📍 {address}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>تفاصيل الفاتورة:</div>
          <div style={{ fontSize: 16, color: '#374151', marginBottom: 4 }}>
            📅 {date}
          </div>
          {paymentType && (
            <div style={{ 
              fontSize: 16, 
              fontWeight: 'bold',
              color: paymentType === "knet" ? '#2563eb' : '#059669',
              background: paymentType === "knet" ? '#dbeafe' : '#d1fae5',
              padding: '8px 16px',
              borderRadius: 8,
              marginTop: 8,
              display: 'inline-block'
            }}>
              💳 {paymentTypeLabel}
            </div>
          )}
        </div>
      </div>

      {/* جدول المنتجات */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ 
          textAlign: 'center', 
          fontWeight: 'bold', 
          margin: '0 0 20px 0',
          fontSize: 22,
          color: '#059669',
          background: '#f0fdf4',
          padding: 12,
          borderRadius: 10,
          border: '2px solid #d1fae5'
        }}>
          📦 تفاصيل المنتجات
        </h3>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'separate',
          borderSpacing: 0,
          fontSize: 16,
          overflow: 'hidden',
          borderRadius: 12,
          border: '2px solid #d1fae5'
        }}>
          <thead>
            <tr style={{ background: 'linear-gradient(to right, #10b981, #059669)', color: '#fff' }}>
              <th style={{ padding: 14, textAlign: 'center', borderBottom: '2px solid #10b981' }}>المنتج</th>
              <th style={{ padding: 14, textAlign: 'center', borderBottom: '2px solid #10b981' }}>الوحدة</th>
              <th style={{ padding: 14, textAlign: 'center', borderBottom: '2px solid #10b981' }}>السعر</th>
              <th style={{ padding: 14, textAlign: 'center', borderBottom: '2px solid #10b981' }}>الكمية</th>
              <th style={{ padding: 14, textAlign: 'center', borderBottom: '2px solid #10b981' }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((prod, idx) => (
              <tr key={idx} style={{ 
                background: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                transition: 'all 0.2s'
              }}>
                <td style={{ padding: 12, fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #e5e7eb' }}>{prod.name}</td>
                <td style={{ padding: 12, textAlign: 'center', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>{prod.unit}</td>
                <td style={{ padding: 12, textAlign: 'center', color: '#059669', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>{prod.price.toFixed(3)} د.ك</td>
                <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb' }}>{prod.quantity}</td>
                <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold', color: '#10b981', fontSize: 17, borderBottom: '1px solid #e5e7eb' }}>{(prod.price * prod.quantity).toFixed(3)} د.ك</td>
              </tr>
            ))}
            
            {/* التوصيل */}
            <tr style={{ background: '#fffbeb' }}>
              <td colSpan={3} style={{ padding: 14, textAlign: 'left', fontWeight: 'bold', color: '#92400e', borderBottom: '2px solid #fde68a' }}>
                🚚 سعر التوصيل
              </td>
              <td style={{ padding: 14, textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #fde68a' }}>-</td>
              <td style={{ padding: 14, textAlign: 'center', fontWeight: 'bold', color: '#d97706', fontSize: 17, borderBottom: '2px solid #fde68a' }}>{deliveryFee.toFixed(3)} د.ك</td>
            </tr>
            
            {/* المجموع النهائي */}
            <tr style={{ background: 'linear-gradient(to right, #d1fae5, #a7f3d0)' }}>
              <td colSpan={3} style={{ 
                padding: 16, 
                textAlign: 'left', 
                fontWeight: 'bold', 
                fontSize: 20,
                color: '#065f46'
              }}>
                💰 المجموع الكلي
              </td>
              <td style={{ 
                padding: 16, 
                textAlign: 'center', 
                fontWeight: 'bold',
                fontSize: 18,
                color: '#065f46'
              }}>
                {products?.reduce((sum, p) => sum + (p.quantity || 0), 0)}
              </td>
              <td style={{ 
                padding: 16, 
                textAlign: 'center', 
                fontWeight: 'bold', 
                fontSize: 22,
                color: '#065f46'
              }}>
                {(total + deliveryFee).toFixed(3)} د.ك
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: 40,
        paddingTop: 20,
        borderTop: '3px solid #10b981',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981', marginBottom: 8 }}>
          شكراً لتسوقكم معنا! 🌟
        </div>
        <div style={{ fontSize: 14 }}>
          📱 للاستفسار: 98899426 | 🌐 www.q8fruit.com
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
          تم إنشاء الفاتورة بواسطة نظام Q8 Fruit
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
