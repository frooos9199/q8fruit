import { NextResponse } from 'next/server';
import {
  getOrderAddress,
  getOrderCustomerName,
  getOrderDateLabel,
  getOrderDisplayNumber,
  getOrderPaymentMethod,
  getOrderPhone,
  getOrderPricing,
  getOrderProducts,
} from '../../../../lib/orderUtils';

function getBrevoSender() {
  return {
    name: process.env.BREVO_SENDER_NAME || 'Q8 Fruit - نظام الطلبات',
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
    const orderData = await request.json();
    const apiKey = process.env.BREVO_API_KEY;
    const sender = getBrevoSender();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // الحصول على قائمة الإيميلات
    let recipientEmails = orderData.recipientEmails || [];
    
    // إذا لم تُمرر الإيميلات، اقرأها من Firebase
    if (!recipientEmails || recipientEmails.length === 0) {
      try {
        const admin = await import('firebase-admin');
        
        // تهيئة Firebase Admin إذا لم يكن مهيأ
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
          });
        }

        const db = admin.firestore();
        const settingsDoc = await db.collection('settings').doc('orderNotificationEmails').get();
        
        if (settingsDoc.exists) {
          const data = settingsDoc.data();
          if (data?.emails && Array.isArray(data.emails) && data.emails.length > 0) {
            recipientEmails = data.emails;
          }
        }
      } catch (firebaseError) {
        console.error('خطأ في قراءة الإيميلات من Firebase:', firebaseError);
        // استخدام الإيميل الافتراضي
      }
    }
    
    // إذا ما في إيميلات، استخدم الإيميل الافتراضي
    if (recipientEmails.length === 0) {
      recipientEmails = ['summit_kw@hotmail.com'];
    }
    
    const products = getOrderProducts(orderData);
    const pricing = getOrderPricing(orderData);
    const paymentMethod = getOrderPaymentMethod(orderData);
    const customerName = getOrderCustomerName(orderData);
    const customerPhone = getOrderPhone(orderData);
    const displayNumber = getOrderDisplayNumber(orderData);
    const dateLabel = getOrderDateLabel(orderData);
    const address = getOrderAddress(orderData);

    const itemsHtml = products.map((item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">
          <div style="display:flex; align-items:center; gap:10px;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #ddd;">` : ''}
            <span>${item.name}</span>
          </div>
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.unit}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.price.toFixed(3)} د.ك</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.total.toFixed(3)} د.ك</td>
      </tr>
    `).join('');

    // تنسيق الإيميل
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طلب جديد - Q8 Fruit</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; direction: rtl;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🍎 طلب جديد - Q8 Fruit</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <!-- Order Info -->
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #16a34a; margin-top: 0;">📋 معلومات الطلب</h2>
              <p style="margin: 5px 0;"><strong>رقم الطلب:</strong> ${displayNumber}</p>
              <p style="margin: 5px 0;"><strong>التاريخ:</strong> ${dateLabel}</p>
              <p style="margin: 5px 0;"><strong>الحالة:</strong> <span style="background-color: #fef3c7; padding: 4px 8px; border-radius: 4px; color: #92400e;">جديد</span></p>
            </div>

            <!-- Customer Info -->
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #16a34a; margin-top: 0;">👤 بيانات العميل</h2>
              <p style="margin: 5px 0;"><strong>الاسم:</strong> ${customerName}</p>
              <p style="margin: 5px 0;"><strong>الهاتف:</strong> ${customerPhone || 'غير متوفر'}</p>
              <p style="margin: 5px 0;"><strong>العنوان:</strong><br>${address}</p>
              ${orderData.deliveryNotes || orderData.userNote ? `<p style="margin: 5px 0;"><strong>ملاحظات:</strong> ${orderData.deliveryNotes || orderData.userNote}</p>` : ''}
            </div>

            <!-- Products Table -->
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

            <!-- Total -->
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
              <h2 style="color: #16a34a; margin-top: 0;">💰 الملخص المالي</h2>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <span>إجمالي المنتجات:</span>
                <strong>${pricing.subtotal.toFixed(3)} د.ك</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <span>رسوم التوصيل:</span>
                <strong>${pricing.deliveryFee.toFixed(3)} د.ك</strong>
              </div>
              <hr style="border: none; border-top: 2px solid #ddd; margin: 10px 0;">
              <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 18px;">
                <span><strong>المجموع الكلي:</strong></span>
                <strong style="color: #16a34a;">${pricing.total.toFixed(3)} د.ك</strong>
              </div>
              <p style="margin: 10px 0 0 0;"><strong>طريقة الدفع:</strong> ${paymentMethod === 'knet' ? 'رابط كنت' : 'نقدي عند الاستلام'}</p>
            </div>

            <!-- Footer Note -->
            <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-right: 4px solid #f59e0b; border-radius: 4px;">
              <p style="margin: 0; color: #92400e;">
                <strong>⚠️ تنبيه:</strong> يرجى التواصل مع العميل في أقرب وقت لتأكيد الطلب وتحديد موعد التوصيل.
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

    // إرسال الإيميل باستخدام Brevo API
    // إرسال لكل الإيميلات في القائمة
    const results = {
      sent: 0,
      failed: 0,
      emails: recipientEmails,
    };

    for (const email of recipientEmails) {
      try {
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
              email: email,
              name: 'Q8 Fruit Admin'
            }],
            subject: `🍎 طلب جديد ${displayNumber} من ${customerName}`,
            htmlContent: htmlContent,
          }),
        });

        if (res.ok) {
          results.sent++;
          console.log(`✅ تم إرسال إيميل الطلب إلى ${email}`);
        } else {
          const errorData = await readBrevoError(res);
          results.failed++;
          console.error(`❌ فشل إرسال الإيميل إلى ${email}:`, errorData);
          return NextResponse.json({
            error: 'فشل إرسال الإيميل',
            provider: 'brevo',
            sender,
            recipient: email,
            details: errorData,
          }, { status: 502 });
        }
      } catch (error) {
        results.failed++;
        console.error(`❌ خطأ في إرسال الإيميل إلى ${email}:`, error);
        return NextResponse.json({
          error: 'خطأ أثناء محاولة إرسال الإيميل',
          recipient: email,
          details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
      }
    }
    
    if (results.sent > 0) {
      return NextResponse.json({ 
        success: true, 
        results,
        message: `تم إرسال ${results.sent} من أصل ${recipientEmails.length} إيميل`
      });
    } else {
      return NextResponse.json({ 
        error: 'فشل إرسال جميع الإيميلات',
        results,
        sender,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ خطأ في إرسال إيميل الطلب:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
