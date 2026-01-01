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
  
  // تنسيق رسالة الفاتورة
  const message = `
🍎 *فاتورة متجر الفواكه والخضار - Q8 Fruit*

📋 *تفاصيل الطلب:*
رقم الطلب: ${invoice.id}
التاريخ: ${invoice.date}

👤 *بيانات العميل:*
الاسم: ${invoice.userInfo.name}
الهاتف: ${invoice.userInfo.phone}
العنوان: ${invoice.userInfo.address}

🛒 *المنتجات:*
${invoice.items.map((item: any) => 
  `• ${item.name} (${item.unit}) - الكمية: ${item.quantity} - السعر: ${(item.price * item.quantity).toFixed(3)} د.ك`
).join('\n')}

💰 *الملخص المالي:*
إجمالي المنتجات: ${(invoice.total - invoice.deliveryPrice).toFixed(3)} د.ك
رسوم التوصيل: ${invoice.deliveryPrice.toFixed(3)} د.ك
المجموع الكلي: ${invoice.total.toFixed(3)} د.ك

💳 طريقة الدفع: ${invoice.paymentType === 'knet' ? 'رابط كنت' : 'نقدي عند الاستلام'}

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
    const customerNumber = order.phone ? `965${order.phone.replace(/^\+?965/, '')}` : null;
    
    if (recipient === 'customer' && !customerNumber) {
      return { success: false, message: 'رقم هاتف العميل غير متوفر' };
    }
    
    const targetNumber = recipient === 'admin' ? adminNumber : customerNumber;
    
    // Extract numeric ID from order.id (can be "local_123" or Firebase ID)
    let displayId = 1000;
    if (order.id) {
      if (typeof order.id === 'string' && order.id.startsWith('local_')) {
        displayId = 1000 + parseInt(order.id.replace('local_', ''));
      } else if (typeof order.id === 'string') {
        displayId = parseInt(order.id.slice(-6), 16); // Use last 6 chars as hex
      } else {
        displayId = 1000 + order.id;
      }
    }
    
    // تنسيق رسالة الفاتورة
    const message = `
🍎 *فاتورة متجر الفواكه والخضار - Q8 Fruit*

📋 *تفاصيل الطلب:*
رقم الطلب: ${order.orderNumber || `#${displayId}`}
التاريخ: ${order.date}

👤 *بيانات العميل:*
الاسم: ${order.customer}
الهاتف: ${order.phone || 'غير محدد'}
العنوان: ${order.address || 'غير محدد'}

🛒 *المنتجات:*
${order.products.map((item: any) => 
  `• ${item.name} (${item.unit}) - الكمية: ${item.quantity} - السعر: ${(item.price * item.quantity).toFixed(3)} د.ك`
).join('\n')}

💰 *الملخص المالي:*
إجمالي المنتجات: ${(order.total - (order.deliveryFee || 0)).toFixed(3)} د.ك
رسوم التوصيل: ${(order.deliveryFee || 0).toFixed(3)} د.ك
المجموع الكلي: ${(order.total + (order.deliveryFee || 0)).toFixed(3)} د.ك

💳 طريقة الدفع: ${order.paymentType === 'knet' ? 'رابط كنت' : 'نقدي عند الاستلام'}

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