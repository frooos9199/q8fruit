import {
  getOrderAddress,
  getOrderCustomerName,
  getOrderDisplayNumber,
  getOrderPaymentMethod,
  getOrderPhone,
  getOrderPricing,
  getOrderProducts,
} from './orderUtils';

// دالة للحصول على الرقم الرئيسي من الإعدادات
const getPrimaryWhatsAppNumber = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("whatsappNumbers");
    if (saved) {
      const numbers = JSON.parse(saved);
      return numbers[0] || "96550540999";
    }
  }
  return "96550540999";
};

// دالة لإرسال الفاتورة عبر الواتساب
export const sendInvoiceToWhatsApp = (invoice: any) => {
  const whatsappNumber = getPrimaryWhatsAppNumber();
  const products = getOrderProducts(invoice);
  const pricing = getOrderPricing(invoice);
  const paymentMethod = getOrderPaymentMethod(invoice);
  
  // تنسيق رسالة الفاتورة
  const message = `
🍎 *فاتورة متجر الفواكه والخضار - Q8 Fruit*

📋 *تفاصيل الطلب:*
رقم الطلب: ${getOrderDisplayNumber(invoice)}
التاريخ: ${invoice.date || new Date().toLocaleString('ar-EG')}

👤 *بيانات العميل:*
الاسم: ${getOrderCustomerName(invoice)}
الهاتف: ${getOrderPhone(invoice) || 'غير متوفر'}
العنوان: ${getOrderAddress(invoice)}

🛒 *المنتجات:*
${products.map((item) => 
  `• ${item.name} (${item.unit}) - الكمية: ${item.quantity} - الإجمالي: ${item.total.toFixed(3)} د.ك${item.image ? ` - صورة: ${item.image}` : ''}`
).join('\n')}

💰 *الملخص المالي:*
إجمالي المنتجات: ${pricing.subtotal.toFixed(3)} د.ك
رسوم التوصيل: ${pricing.deliveryFee.toFixed(3)} د.ك
المجموع الكلي: ${pricing.total.toFixed(3)} د.ك

💳 طريقة الدفع: ${paymentMethod === 'knet' ? 'رابط كنت' : 'نقدي عند الاستلام'}

${invoice.userNote ? `📝 ملاحظات العميل: ${invoice.userNote}` : ''}

---
شكراً لاختياركم متجر Q8 Fruit 🇰🇼
  `.trim();

  // إنشاء رابط الواتساب
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  
  // فتح الواتساب
  window.open(whatsappUrl, '_blank');
};

// دالة لإرسال الفاتورة من لوحة الإدارة
export const sendInvoiceViaWhatsApp = async (order: any, recipient: 'admin' | 'customer') => {
  try {
    const adminNumber = getPrimaryWhatsAppNumber();
    const customerPhone = getOrderPhone(order);
    const customerNumber = customerPhone ? `965${customerPhone.replace(/^\+?965/, '')}` : null;
    const products = getOrderProducts(order);
    const pricing = getOrderPricing(order);
    const customerName = getOrderCustomerName(order);
    const address = getOrderAddress(order);
    const paymentMethod = getOrderPaymentMethod(order);
    
    if (recipient === 'customer' && !customerNumber) {
      return { success: false, message: 'رقم هاتف العميل غير متوفر' };
    }
    
    const targetNumber = recipient === 'admin' ? adminNumber : customerNumber;
    
    // تنسيق رسالة الفاتورة
    const message = `
🍎 *فاتورة متجر الفواكه والخضار - Q8 Fruit*

📋 *تفاصيل الطلب:*
رقم الطلب: ${getOrderDisplayNumber(order)}
التاريخ: ${order.date || new Date().toLocaleString('ar-EG')}

👤 *بيانات العميل:*
الاسم: ${customerName}
الهاتف: ${customerPhone || 'غير محدد'}
العنوان: ${address}

🛒 *المنتجات:*
${products.map((item) => 
  `• ${item.name} (${item.unit}) - الكمية: ${item.quantity} - الإجمالي: ${item.total.toFixed(3)} د.ك${item.image ? ` - صورة: ${item.image}` : ''}`
).join('\n')}

💰 *الملخص المالي:*
إجمالي المنتجات: ${pricing.subtotal.toFixed(3)} د.ك
رسوم التوصيل: ${pricing.deliveryFee.toFixed(3)} د.ك
المجموع الكلي: ${pricing.total.toFixed(3)} د.ك

💳 طريقة الدفع: ${paymentMethod === 'knet' ? 'رابط كنت' : 'نقدي عند الاستلام'}

📊 حالة الطلب: ${order.status}

---
${recipient === 'admin' ? 'تم إرسال هذه الفاتورة من نظام الإدارة' : 'شكراً لاختياركم متجر Q8 Fruit 🇰🇼'}
    `.trim();

    // إنشاء رابط الواتساب
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
    
    // فتح الواتساب
    window.open(whatsappUrl, '_blank');
    
    return { success: true, message: 'تم إرسال الفاتورة بنجاح' };
  } catch (error) {
    return { success: false, message: 'حدث خطأ في إرسال الفاتورة' };
  }
};