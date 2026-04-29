const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

function getBrevoSender() {
  return {
    name: process.env.BREVO_SENDER_NAME || 'Q8 Fruit',
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@q8fruit.com',
  };
}

async function readBrevoError(response) {
  try {
    return await response.json();
  } catch (error) {
    return { message: await response.text(), parseError: error.message };
  }
}

// Define BREVO_API_KEY as a parameter
const brevoApiKey = defineString('BREVO_API_KEY');

/**
 * Cloud Function يتم تشغيلها تلقائياً عند إنشاء طلب جديد في Firestore
 * تراقب collection "orders" وترسل إيميل لكل طلب جديد
 */
exports.sendOrderNotificationEmail = onDocumentCreated('orders/{orderId}', async (event) => {
    try {
      const snap = event.data;
      const orderData = snap.data();
      const orderId = event.params.orderId;

      console.log('📧 طلب جديد:', orderId);

      // الحصول على قائمة الإيميلات من الإعدادات
      let recipientEmails = ['summit_kw@hotmail.com']; // الإيميل الافتراضي
      
      try {
        const settingsDoc = await admin.firestore()
          .collection('settings')
          .doc('orderNotificationEmails')
          .get();
        
        if (settingsDoc.exists) {
          const settingsData = settingsDoc.data();
          if (settingsData.emails && Array.isArray(settingsData.emails) && settingsData.emails.length > 0) {
            recipientEmails = settingsData.emails;
          }
        }
      } catch (error) {
        console.error('خطأ في قراءة الإيميلات من الإعدادات:', error);
        // استخدام الإيميل الافتراضي
      }

      console.log('📬 سيتم الإرسال إلى:', recipientEmails);

      // الحصول على BREVO_API_KEY من environment
      const apiKey = brevoApiKey.value();
      
      if (!apiKey) {
        console.error('❌ BREVO_API_KEY غير موجود في Firebase Config');
        return null;
      }

      // تنسيق البيانات
      const orderInfo = {
        orderNumber: orderId,
        date: orderData.createdAt?.toDate?.()?.toLocaleString('ar-EG') || new Date().toLocaleString('ar-EG'),
        customerName: orderData.customerName || 'غير محدد',
        phoneNumber: orderData.phoneNumber || 'غير محدد',
        deliveryAddress: orderData.deliveryAddress || 'غير محدد',
        deliveryNotes: orderData.deliveryNotes || '-',
        paymentMethod: orderData.paymentMethod === 'cash' ? 'نقدي عند الاستلام' : 'غير محدد',
        items: orderData.items || [],
        subtotal: orderData.subtotal || 0,
        deliveryFee: orderData.deliveryFee || 0,
        total: orderData.total || 0,
      };

      // إنشاء HTML للطلب
      const itemsHtml = orderInfo.items.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.name || item.nameAr}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${(item.price || 0).toFixed(3)} د.ك</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${((item.quantity * item.price) || 0).toFixed(3)} د.ك</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">📦 طلب جديد - Q8 Fruit</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">رقم الطلب: ${orderInfo.orderNumber.substring(0, 8)}</p>
            </div>
  
            <!-- Content -->
            <div style="padding: 30px;">
              <!-- Customer Info -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">👤 معلومات العميل</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 120px;"><strong>الاسم:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${orderInfo.customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>الهاتف:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${orderInfo.phoneNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>التاريخ:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${orderInfo.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>طريقة الدفع:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${orderInfo.paymentMethod}</td>
                  </tr>
                </table>
              </div>
  
              <!-- Delivery Info -->
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #ffc107;">
                <h2 style="margin: 0 0 15px 0; color: #856404; font-size: 20px;">🚚 معلومات التوصيل</h2>
                <p style="margin: 0; color: #856404; line-height: 1.6;"><strong>العنوان:</strong><br>${orderInfo.deliveryAddress}</p>
                ${orderInfo.deliveryNotes !== '-' ? `<p style="margin: 10px 0 0 0; color: #856404;"><strong>ملاحظات:</strong> ${orderInfo.deliveryNotes}</p>` : ''}
              </div>
  
              <!-- Items Table -->
              <div style="margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">📋 تفاصيل الطلب</h2>
                <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #667eea; color: white;">
                      <th style="padding: 12px; text-align: right;">المنتج</th>
                      <th style="padding: 12px; text-align: center;">الكمية</th>
                      <th style="padding: 12px; text-align: right;">السعر</th>
                      <th style="padding: 12px; text-align: right;">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>
  
              <!-- Total Summary -->
              <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; border-right: 4px solid #4caf50;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #2e7d32; font-size: 16px;"><strong>المجموع الفرعي:</strong></td>
                    <td style="padding: 8px 0; color: #2e7d32; text-align: left; font-size: 16px;">${orderInfo.subtotal.toFixed(3)} د.ك</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #2e7d32; font-size: 16px;"><strong>رسوم التوصيل:</strong></td>
                    <td style="padding: 8px 0; color: #2e7d32; text-align: left; font-size: 16px;">${orderInfo.deliveryFee.toFixed(3)} د.ك</td>
                  </tr>
                  <tr style="border-top: 2px solid #4caf50;">
                    <td style="padding: 12px 0 0 0; color: #1b5e20; font-size: 20px;"><strong>المجموع الكلي:</strong></td>
                    <td style="padding: 12px 0 0 0; color: #1b5e20; text-align: left; font-size: 24px; font-weight: bold;">${orderInfo.total.toFixed(3)} د.ك</td>
                  </tr>
                </table>
              </div>
            </div>
  
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #666;">
              <p style="margin: 0; font-size: 14px;">يمكنك إدارة الطلب من لوحة التحكم</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Q8 Fruit • www.q8fruit.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // إرسال إيميل لكل مستلم
      const sendPromises = recipientEmails.map(async (email) => {
        try {
          const sender = getBrevoSender();
          const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': apiKey,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              sender,
              to: [
                {
                  email: email,
                  name: 'Q8 Fruit Admin',
                },
              ],
              subject: `🎉 طلب جديد #${orderInfo.orderNumber.substring(0, 8)} - ${orderInfo.customerName}`,
              htmlContent: htmlContent,
            }),
          });

          if (response.ok) {
            console.log(`✅ تم إرسال الإيميل بنجاح إلى: ${email}`);
            return { success: true, email };
          } else {
            const errorData = await readBrevoError(response);
            console.error(`❌ فشل إرسال الإيميل إلى ${email}:`, errorData);
            return { success: false, email, sender, error: errorData };
          }
        } catch (error) {
          console.error(`❌ خطأ في إرسال الإيميل إلى ${email}:`, error);
          return { success: false, email, error: error.message };
        }
      });

      const results = await Promise.all(sendPromises);
      const successCount = results.filter(r => r.success).length;

      console.log(`✅ تم إرسال ${successCount} من ${recipientEmails.length} إيميل بنجاح`);

      return { success: true, sentCount: successCount, totalCount: recipientEmails.length };
    } catch (error) {
      console.error('❌ خطأ في Cloud Function:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * Cloud Function ترسل Push Notification للأدمن عند إنشاء طلب جديد
 * - ترسل إلى topic: admin-orders
 * - تعمل حتى لو تطبيق الأدمن مغلق (OS يعرض الإشعار)
 * - تدعم ChannelId للاندرويد + Sound مخصص
 */
exports.sendAdminOrderPushNotification = onDocumentCreated('orders/{orderId}', async (event) => {
  try {
    const snap = event.data;
    if (!snap) {
      return null;
    }

    const orderData = snap.data() || {};
    const orderId = event.params.orderId;
    const orderNumber = orderData.orderNumber ? String(orderData.orderNumber) : '';
    const customerName = orderData.customerName || orderData?.customer?.name || 'عميل';
    const total = Number(orderData.total || orderData?.pricing?.total || 0) || 0;

    const title = '📦 طلب جديد';
    const body = `طلب جديد${orderNumber ? ` رقم ${orderNumber}` : ''} من ${customerName} - ${total.toFixed(3)} د.ك`;

    // Sound notes:
    // - Android: sound is determined by the notification channel (q8fruit-orders)
    // - iOS: custom sound file must be bundled in the app (e.g. order_sound.caf)
    const ANDROID_CHANNEL_ID = 'q8fruit-orders';
    const ANDROID_SOUND = 'order_sound';
    const IOS_SOUND = 'order_sound.caf';

    const message = {
      topic: 'admin-orders',
      notification: {
        title,
        body,
      },
      data: {
        type: 'new_order',
        screen: 'ManageOrders',
        orderId: orderId || '',
        orderNumber,
        channelId: ANDROID_CHANNEL_ID,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: ANDROID_CHANNEL_ID,
          sound: ANDROID_SOUND,
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: IOS_SOUND,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Admin order push sent:', response);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending admin order push:', error);
    return { success: false, error: error.message };
  }
});
