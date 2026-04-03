import React from "react";
import { getOrderAddress, getOrderPhone, getOrderPricing, getOrderProducts } from '../../../lib/orderUtils';

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
  paymentType?: string;
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
  const paymentTypeLabel = paymentType === "knet" ? "دفع أونلاين" : "نقدي عند الاستلام";
  const normalizedProducts = getOrderProducts({ products, deliveryFee, total });
  const pricing = getOrderPricing({ products, deliveryFee, total });
  
  return (
    <div style={{
      width: '100%',
      maxWidth: 900,
      margin: '0 auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: 25,
      overflow: 'hidden',
      boxShadow: '0 25px 80px rgba(102, 126, 234, 0.3)',
      fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
      color: '#1a202c',
      direction: 'rtl'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: 40,
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        <img 
          src="/images/fruits.png" 
          alt="شعار المتجر" 
          style={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            border: '5px solid white',
            background: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            margin: '0 auto 20px',
            position: 'relative',
            zIndex: 1
          }} 
        />
        <h1 style={{ 
          fontSize: 36, 
          fontWeight: 'bold', 
          margin: '0 0 15px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1
        }}>
          🍎 متجر الفواكه والخضار
        </h1>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)',
          padding: '12px 25px',
          borderRadius: 30,
          display: 'inline-block',
          fontSize: 18,
          fontWeight: 'bold',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1
        }}>
          فاتورة رقم #{invoiceNumber}
        </div>
      </div>

      {/* Customer & Date Info */}
      <div style={{
        background: 'white',
        padding: 30,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 30
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: 25,
          borderRadius: 20,
          color: 'white',
          boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: 20, fontWeight: 'bold' }}>👤 معلومات العميل</h3>
          <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{customer}</div>
          {phone && <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 5 }}>📱 {getOrderPhone({ phone })}</div>}
          {address && <div style={{ fontSize: 16, opacity: 0.9 }}>📍 {getOrderAddress({ address })}</div>}
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: 25,
          borderRadius: 20,
          color: 'white',
          boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: 20, fontWeight: 'bold' }}>📋 تفاصيل الفاتورة</h3>
          <div style={{ fontSize: 18, marginBottom: 8 }}>📅 {date}</div>
          {paymentType && (
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: 15,
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 10,
              backdropFilter: 'blur(10px)'
            }}>
              💳 {paymentTypeLabel}
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div style={{ background: 'white', padding: 30 }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: 28,
          fontWeight: 'bold',
          margin: '0 0 25px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📦 تفاصيل المنتجات
        </h2>
        
        <div style={{
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 15px 50px rgba(0,0,0,0.1)',
          border: '3px solid #e2e8f0'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: 16
          }}>
            <thead>
              <tr style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white' 
              }}>
                <th style={{ padding: 18, fontWeight: 'bold', fontSize: 18 }}>المنتج</th>
                <th style={{ padding: 18, fontWeight: 'bold', fontSize: 18 }}>الوحدة</th>
                <th style={{ padding: 18, fontWeight: 'bold', fontSize: 18 }}>السعر</th>
                <th style={{ padding: 18, fontWeight: 'bold', fontSize: 18 }}>الكمية</th>
                <th style={{ padding: 18, fontWeight: 'bold', fontSize: 18 }}>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {normalizedProducts.map((prod, idx) => (
                <tr key={idx} style={{ 
                  background: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease'
                }}>
                  <td style={{ padding: 15, fontWeight: 'bold', color: '#2d3748' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {prod.image ? <img src={prod.image} alt={prod.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10, border: '1px solid #e2e8f0' }} /> : null}
                      <span>{prod.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: 15, textAlign: 'center', color: '#4a5568' }}>{prod.unit}</td>
                  <td style={{ padding: 15, textAlign: 'center', color: '#3182ce', fontWeight: 'bold' }}>{prod.price.toFixed(3)} د.ك</td>
                  <td style={{ padding: 15, textAlign: 'center', fontWeight: 'bold', color: '#2d3748' }}>{prod.quantity}</td>
                  <td style={{ padding: 15, textAlign: 'center', fontWeight: 'bold', color: '#38a169', fontSize: 17 }}>{prod.total.toFixed(3)} د.ك</td>
                </tr>
              ))}
              
              {/* Delivery Row */}
              <tr style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
                <td colSpan={3} style={{ 
                  padding: 18, 
                  textAlign: 'left', 
                  fontWeight: 'bold', 
                  color: '#2d3748',
                  fontSize: 18
                }}>
                  🚚 رسوم التوصيل
                </td>
                <td style={{ padding: 18, textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>-</td>
                <td style={{ padding: 18, textAlign: 'center', fontWeight: 'bold', color: '#e17055', fontSize: 18 }}>
                  {pricing.deliveryFee.toFixed(3)} د.ك
                </td>
              </tr>
              
              {/* Total Row */}
              <tr style={{ background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', color: 'white' }}>
                <td colSpan={3} style={{ 
                  padding: 20, 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  fontSize: 22
                }}>
                  💰 المجموع الكلي
                </td>
                <td style={{ 
                  padding: 20, 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  fontSize: 20
                }}>
                  {normalizedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0)}
                </td>
                <td style={{ 
                  padding: 20, 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  fontSize: 24
                }}>
                  {pricing.total.toFixed(3)} د.ك
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
        color: 'white',
        padding: 30,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>
          شكراً لتسوقكم معنا! 🌟
        </div>
        <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 10 }}>
          📱 للاستفسار: 98899426 | 🌐 متجر الفواكه والخضار الكويت
        </div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>
          تم إنشاء الفاتورة بواسطة نظام Q8 Fruit المتطور
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
