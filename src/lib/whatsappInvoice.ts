// دالة إرسال الفاتورة عبر الواتساب
export const sendInvoiceViaWhatsApp = async (order: any, recipient: 'admin' | 'customer') => {
  try {
    // رقم الواتساب للإرسال منه
    const senderNumber = '+96598899426';
    
    // تحديد رقم المستقبل
    let recipientNumber = '';
    let message = '';
    
    if (recipient === 'admin') {
      recipientNumber = senderNumber; // نفس الرقم للإدارة
      message = `🧾 *فاتورة جديدة - إدارة*\n\n`;
    } else {
      recipientNumber = order.phone || ''; // رقم العميل
      message = `🍎 *فاتورة طلبكم من متجر الفواكه والخضار*\n\n`;
    }
    
    // إنشاء محتوى الفاتورة
    message += `📋 *رقم الطلب:* #${1000 + (order.id || 0)}\n`;
    message += `👤 *العميل:* ${order.customer}\n`;
    message += `📅 *التاريخ:* ${order.date}\n`;
    message += `💳 *طريقة الدفع:* ${order.paymentType === 'knet' ? 'دفع أونلاين' : 'نقدي عند الاستلام'}\n\n`;
    
    message += `📦 *المنتجات:*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    
    if (order.products && order.products.length > 0) {
      order.products.forEach((product: any, index: number) => {
        message += `${index + 1}. ${product.name}\n`;
        message += `   • الكمية: ${product.quantity} ${product.unit}\n`;
        message += `   • السعر: ${product.price.toFixed(3)} د.ك\n`;
        message += `   • الإجمالي: ${(product.price * product.quantity).toFixed(3)} د.ك\n\n`;
      });
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🚚 *رسوم التوصيل:* ${order.deliveryFee ? order.deliveryFee.toFixed(3) : '0.000'} د.ك\n`;
    message += `💰 *المجموع الكلي:* ${((order.total || 0) + (order.deliveryFee || 0)).toFixed(3)} د.ك\n\n`;
    
    if (recipient === 'customer') {
      message += `شكراً لتسوقكم معنا! 🌟\n`;
      message += `للاستفسار: ${senderNumber.replace('+965', '')}\n`;
      message += `متجر الفواكه والخضار - الكويت 🇰🇼`;
    } else {
      message += `📱 *رقم العميل:* ${order.phone || 'غير محدد'}\n`;
      message += `📍 *العنوان:* ${order.address || 'غير محدد'}\n`;
      message += `📊 *حالة الطلب:* ${order.status}`;
    }
    
    // إنشاء رابط الواتساب
    const whatsappUrl = `https://wa.me/${recipientNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    // فتح الواتساب
    window.open(whatsappUrl, '_blank');
    
    return { success: true, message: 'تم إرسال الفاتورة بنجاح' };
  } catch (error) {
    console.error('خطأ في إرسال الفاتورة:', error);
    return { success: false, message: 'حدث خطأ في إرسال الفاتورة' };
  }
};

// دالة لتحويل الفاتورة إلى صورة (اختيارية)
export const generateInvoiceImage = async (order: any): Promise<string> => {
  return new Promise((resolve) => {
    // إنشاء canvas لتحويل الفاتورة إلى صورة
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve('');
      return;
    }
    
    // إعداد الكانفاس
    canvas.width = 800;
    canvas.height = 1000;
    
    // خلفية بيضاء
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إعداد الخط
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    
    // رسم محتوى الفاتورة
    let y = 50;
    
    // العنوان
    ctx.font = 'bold 24px Arial';
    ctx.fillText('🍎 متجر الفواكه والخضار', canvas.width / 2, y);
    y += 40;
    
    ctx.font = '18px Arial';
    ctx.fillText(`فاتورة رقم #${1000 + (order.id || 0)}`, canvas.width / 2, y);
    y += 30;
    
    ctx.fillText(`العميل: ${order.customer}`, canvas.width / 2, y);
    y += 25;
    
    ctx.fillText(`التاريخ: ${order.date}`, canvas.width / 2, y);
    y += 40;
    
    // المنتجات
    ctx.font = 'bold 16px Arial';
    ctx.fillText('المنتجات:', canvas.width / 2, y);
    y += 30;
    
    ctx.font = '14px Arial';
    if (order.products && order.products.length > 0) {
      order.products.forEach((product: any, index: number) => {
        ctx.fillText(`${index + 1}. ${product.name} - ${product.quantity} ${product.unit}`, canvas.width / 2, y);
        y += 20;
        ctx.fillText(`${(product.price * product.quantity).toFixed(3)} د.ك`, canvas.width / 2, y);
        y += 25;
      });
    }
    
    y += 20;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`المجموع: ${((order.total || 0) + (order.deliveryFee || 0)).toFixed(3)} د.ك`, canvas.width / 2, y);
    
    // تحويل إلى base64
    const imageData = canvas.toDataURL('image/png');
    resolve(imageData);
  });
};