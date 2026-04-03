import { NextResponse } from 'next/server';
import { getOrderDisplayNumber } from '../../../../lib/orderUtils';

function getBrevoSender() {
  return {
    name: process.env.BREVO_SENDER_NAME || 'Q8 Fruit - الأرشيف',
    email: process.env.BREVO_SENDER_EMAIL || 'orders@q8fruit.com',
  };
}

async function readBrevoError(response: Response) {
  try {
    return await response.json();
  } catch {
    return { message: await response.text() };
  }
}

export async function POST(request: Request) {
  try {
    const { orders } = await request.json();
    const apiKey = process.env.BREVO_API_KEY;
    const sender = getBrevoSender();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'No orders provided' }, { status: 400 });
    }

    const results = {
      total: orders.length,
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    // إرسال كل طلب على حدة مع تأخير بسيط لتجنب rate limit
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const displayNumber = getOrderDisplayNumber(order);
      
      try {
        // تنسيق بيانات المنتجات
        const itemsHtml = (order.products || order.items || []).map((item: any) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.name || item.productName || 'منتج'}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.unit || item.unitName || ''}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity || 0}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${(item.price || 0).toFixed(3)} د.ك</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${((item.total || (item.price * item.quantity)) || 0).toFixed(3)} د.ك</td>
          </tr>
        `).join('');

        // تنسيق العنوان
        let address = order.address || '';
        if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
          address = `
            المنطقة: ${order.deliveryAddress.area || ''}<br>
            القطعة: ${order.deliveryAddress.block || ''}<br>
            الشارع: ${order.deliveryAddress.street || ''}<br>
            البناية: ${order.deliveryAddress.building || ''}<br>
            ${order.deliveryAddress.floor ? `الدور: ${order.deliveryAddress.floor}<br>` : ''}
            ${order.deliveryAddress.apartment ? `الشقة: ${order.deliveryAddress.apartment}<br>` : ''}
          `;
        }

        const htmlContent = `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>طلب سابق - Q8 Fruit</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; direction: rtl;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🍎 طلب سابق - Q8 Fruit</h1>
                <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">⏰ هذا طلب تم إنشاؤه سابقاً</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <!-- Order Info -->
                <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #3b82f6;">
                  <h2 style="color: #1e40af; margin-top: 0;">📋 معلومات الطلب</h2>
                  <p style="margin: 5px 0;"><strong>رقم الطلب:</strong> ${displayNumber}</p>
                  <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${order.date || 'غير محدد'}</p>
                  <p style="margin: 5px 0;"><strong>الحالة:</strong> <span style="background-color: #dbeafe; padding: 4px 8px; border-radius: 4px; color: #1e40af;">${order.status || 'مكتمل'}</span></p>
                </div>

                <!-- Customer Info -->
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #16a34a; margin-top: 0;">👤 بيانات العميل</h2>
                  <p style="margin: 5px 0;"><strong>الاسم:</strong> ${order.customer || order.customerName || order.userInfo?.name || 'غير محدد'}</p>
                  <p style="margin: 5px 0;"><strong>الهاتف:</strong> ${order.phone || order.phoneNumber || order.userInfo?.phone || 'غير محدد'}</p>
                  <p style="margin: 5px 0;"><strong>العنوان:</strong><br>${address || 'غير محدد'}</p>
                  ${order.deliveryNote || order.userNote ? `<p style="margin: 5px 0;"><strong>ملاحظات:</strong> ${order.deliveryNote || order.userNote}</p>` : ''}
                </div>

                <!-- Products Table -->
                ${itemsHtml ? `
                <div style="margin-bottom: 20px;">
                  <h2 style="color: #16a34a;">🛒 المنتجات</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                      <tr style="background-color: #16a34a; color: white;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">المنتج</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">الوحدة</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">الكمية</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">السعر</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </div>
                ` : ''}

                <!-- Total -->
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                  <h2 style="color: #16a34a; margin-top: 0;">💰 الملخص المالي</h2>
                  <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                    <span>رسوم التوصيل:</span>
                    <strong>${((order.deliveryFee || order.deliveryPrice) || 0).toFixed(3)} د.ك</strong>
                  </div>
                  <hr style="border: none; border-top: 2px solid #ddd; margin: 10px 0;">
                  <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 18px;">
                    <span><strong>المجموع الكلي:</strong></span>
                    <strong style="color: #16a34a;">${(order.total || 0).toFixed(3)} د.ك</strong>
                  </div>
                  <p style="margin: 10px 0 0 0;"><strong>طريقة الدفع:</strong> ${order.paymentType === 'knet' || order.paymentMethod === 'knet' ? 'رابط كنت' : 'نقدي عند الاستلام'}</p>
                </div>

                <!-- Archive Notice -->
                <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-right: 4px solid #f59e0b; border-radius: 4px;">
                  <p style="margin: 0; color: #92400e;">
                    <strong>📌 ملاحظة:</strong> هذا طلب من الأرشيف - تم معالجته سابقاً
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Q8 Fruit - أفضل الفواكه والخضار الطازجة 🍎🥗<br>
                  الكويت 🇰🇼
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // إرسال الإيميل
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({
            sender,
            to: [{ 
              email: 'summit_kw@hotmail.com',
              name: 'Q8 Fruit Admin'
            }],
            subject: `📦 طلب سابق #${displayNumber} من ${order.customer || order.customerName || 'عميل'}`,
            htmlContent: htmlContent,
          }),
        });

        if (res.ok) {
          results.sent++;
          console.log(`✅ تم إرسال الطلب ${i + 1}/${orders.length}`);
        } else {
          const errorData = await readBrevoError(res);
          results.failed++;
          results.errors.push({ order: displayNumber, sender, error: errorData });
          console.error(`❌ فشل إرسال الطلب ${order.id}:`, errorData);
        }

        // تأخير بسيط بين كل إيميل (300ms) لتجنب rate limiting
        if (i < orders.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

      } catch (error) {
        results.failed++;
        results.errors.push({ order: displayNumber, error: String(error) });
        console.error(`❌ خطأ في إرسال الطلب ${order.id}:`, error);
      }
    }

    console.log('📊 نتيجة الإرسال:', results);
    return NextResponse.json({ 
      success: true, 
      results,
      message: `تم إرسال ${results.sent} من أصل ${results.total} طلب`
    });

  } catch (error) {
    console.error('❌ خطأ عام في إرسال الطلبات:', error);
    return NextResponse.json({ 
      error: 'Failed to send orders',
      details: String(error)
    }, { status: 500 });
  }
}
