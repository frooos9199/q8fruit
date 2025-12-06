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
      width: 420,
      margin: '32px auto',
      background: '#fff',
      borderRadius: 16,
      border: '1.5px solid #e5e7eb',
      boxShadow: '0 2px 8px #e5e7eb',
      fontFamily: 'Tahoma, Arial, sans-serif',
      padding: 24,
      color: '#222',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 'bold', color: '#be185d', background: '#fce7f3', borderRadius: 8, padding: '4px 16px', fontSize: 16 }}>
          #{invoiceNumber}
        </span>
        <img src="/images/fruits.png" alt="شعار المتجر" style={{ height: 60, width: 60, borderRadius: '50%', border: '2px solid #e5e7eb', background: '#fff', boxShadow: '0 1px 4px #eee' }} />
      </div>
      {/* نوع الدفع */}
      {paymentType && (
        <div style={{ textAlign: 'right', marginBottom: 8 }}>
          <span style={{ fontWeight: 'bold', color: '#2563eb', background: '#dbeafe', borderRadius: 8, padding: '2px 12px', fontSize: 15 }}>
            نوع الدفع: {paymentTypeLabel}
          </span>
        </div>
      )}
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', fontSize: 18 }}>{customer}</div>
        {phone && <div style={{ fontSize: 14 }}>{phone}</div>}
        {address && <div style={{ fontSize: 14 }}>{address}</div>}
      </div>
      <div style={{ textAlign: 'right', marginBottom: 8 }}>
        <span style={{ fontWeight: 'bold' }}>التاريخ:</span> {date}
      </div>
      <h3 style={{ textAlign: 'center', fontWeight: 'bold', margin: '16px 0 8px 0' }}>تفاصيل المنتجات:</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f3f4f6', color: '#222' }}>
            <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>المنتج</th>
            <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>الوحدة</th>
            <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>السعر</th>
            <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>الكمية</th>
            <th style={{ border: '1px solid #e5e7eb', padding: 8 }}>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((prod, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9fafb' : '#fff' }}>
              <td style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 'bold' }}>{prod.name}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{prod.unit}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{prod.price} د.ك</td>
              <td style={{ border: '1px solid #e5e7eb', padding: 8 }}>{prod.quantity}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 'bold' }}>{(prod.price * prod.quantity).toFixed(2)} د.ك</td>
            </tr>
          ))}
          <tr style={{ background: '#fefce8' }}>
            <td colSpan={3} style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left', fontWeight: 'bold' }}>سعر التوصيل</td>
            <td style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 'bold' }}>-</td>
            <td style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 'bold' }}>{deliveryFee.toFixed(2)} د.ك</td>
          </tr>
          <tr>
            <td colSpan={5}><hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} /></td>
          </tr>
          <tr style={{ background: '#f0fdf4' }}>
            <td colSpan={3} style={{ border: '1px solid #e5e7eb', padding: 8, textAlign: 'left', fontWeight: 'bold' }}>المجموع</td>
            <td style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 'bold' }}>{products?.reduce((sum, p) => sum + (p.quantity || 0), 0)}</td>
            <td style={{ border: '1px solid #e5e7eb', padding: 8, fontWeight: 'bold' }}>{(total + deliveryFee).toFixed(2)} د.ك</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InvoicePrint;
