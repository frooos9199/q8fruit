import admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

function parseBadgeCount(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return Math.floor(parsedValue);
}

async function resolveBadgeCount(badgeSource?: string) {
  if (!badgeSource || !admin.apps.length) {
    return null;
  }

  if (badgeSource === 'adminNotifications') {
    const unreadNotificationsSnapshot = await admin.firestore()
      .collection('adminNotifications')
      .where('read', '==', false)
      .get();

    return unreadNotificationsSnapshot.size;
  }

  return null;
}

async function getAdminDeviceTokens() {
  if (!admin.apps.length) {
    return [] as string[];
  }

  const usersCollection = admin.firestore().collection('users');
  const [adminFlagSnapshot, adminRoleSnapshot] = await Promise.all([
    usersCollection.where('isAdmin', '==', true).get(),
    usersCollection.where('role', '==', 'admin').get(),
  ]);

  const tokens = new Set<string>();

  for (const snapshot of [adminFlagSnapshot, adminRoleSnapshot]) {
    for (const document of snapshot.docs) {
      const data = document.data() || {};

      if (typeof data.fcmToken === 'string' && data.fcmToken.trim()) {
        tokens.add(data.fcmToken.trim());
      }

      if (Array.isArray(data.fcmTokens)) {
        for (const token of data.fcmTokens) {
          if (typeof token === 'string' && token.trim()) {
            tokens.add(token.trim());
          }
        }
      }
    }
  }

  return Array.from(tokens);
}

// Initialize Firebase Admin (do this once in your app)
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      console.warn('Firebase Admin credentials not configured');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      return NextResponse.json(
        { error: 'Notification service not configured' },
        { status: 503 }
      );
    }

    const { userId, token, title, body, data, topic, badgeCount, badgeSource } = await request.json();
    const notificationData = Object.entries(data || {}).reduce<Record<string, string>>((accumulator, [key, value]) => {
      if (value === undefined || value === null) {
        return accumulator;
      }

      accumulator[key] = typeof value === 'string' ? value : JSON.stringify(value);
      return accumulator;
    }, {});
    const resolvedBadgeCount =
      parseBadgeCount(badgeCount) ??
      (await resolveBadgeCount(badgeSource)) ??
      parseBadgeCount(notificationData.badgeCount) ??
      1;
    notificationData.badgeCount = String(resolvedBadgeCount);

    let message: admin.messaging.Message;
    const shouldFanOutToAdminDevices = topic === 'admin-orders';

    if (topic) {
      // Send to topic
      message = {
        notification: {
          title,
          body,
        },
        data: notificationData,
        android: {
          priority: 'high',
          notification: {
            channelId: notificationData.channelId || 'q8fruit-orders',
            color: '#10b981',
            icon: 'ic_launcher',
            notificationCount: resolvedBadgeCount,
            sound: 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              sound: 'default',
              badge: resolvedBadgeCount,
              contentAvailable: true,
              mutableContent: true,
            },
          },
        },
        topic,
      };
    } else if (token) {
      // Send to specific device token
      message = {
        notification: {
          title,
          body,
        },
        data: notificationData,
        android: {
          priority: 'high',
          notification: {
            channelId: notificationData.channelId || 'q8fruit-orders',
            color: '#10b981',
            icon: 'ic_launcher',
            notificationCount: resolvedBadgeCount,
            sound: 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              sound: 'default',
              badge: resolvedBadgeCount,
              contentAvailable: true,
              mutableContent: true,
            },
          },
        },
        token,
      };
    } else {
      return NextResponse.json(
        { error: 'Either token or topic is required' },
        { status: 400 }
      );
    }

    let response: string;

    if (shouldFanOutToAdminDevices) {
      const adminTokens = await getAdminDeviceTokens();

      if (adminTokens.length > 0) {
        const multicastMessage: admin.messaging.MulticastMessage = {
          notification: message.notification,
          data: message.data,
          android: message.android,
          apns: message.apns,
          tokens: adminTokens,
        };

        const multicastResponse = await admin.messaging().sendEachForMulticast(multicastMessage);
        console.log('✅ Admin multicast notification result:', {
          successCount: multicastResponse.successCount,
          failureCount: multicastResponse.failureCount,
        });

        response = `admin-multicast:${multicastResponse.successCount}/${adminTokens.length}`;
      } else {
        response = await admin.messaging().send(message);
      }
    } else {
      response = await admin.messaging().send(message);
    }
    
    console.log('✅ Notification sent successfully:', response);
    
    return NextResponse.json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// Helper function to send promotional notifications
export async function sendPromotionalNotification(
  title: string,
  body: string,
  imageUrl?: string,
  actionUrl?: string
) {
  try {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
        imageUrl,
      },
      data: {
        type: 'promotion',
        url: actionUrl || 'https://q8fruit.com',
      },
      topic: 'promotions',
      android: {
        priority: 'high',
        notification: {
          channelId: 'q8fruit-promotions',
          color: '#10b981',
          icon: 'ic_notification',
          notificationCount: 1,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Promotional notification sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending promotional notification:', error);
    throw error;
  }
}

// Helper function to send order update notifications
export async function sendOrderUpdateNotification(
  userToken: string,
  orderId: string,
  status: string,
  message: string
) {
  try {
    const statusMessages: Record<string, { title: string; body: string }> = {
      confirmed: {
        title: '✅ تم تأكيد طلبك',
        body: `طلب رقم ${orderId} تم تأكيده وجاري التحضير`,
      },
      preparing: {
        title: '👨‍🍳 جاري تحضير طلبك',
        body: `طلب رقم ${orderId} قيد التحضير`,
      },
      out_for_delivery: {
        title: '🚚 طلبك في الطريق',
        body: `السائق في طريقه إليك - طلب رقم ${orderId}`,
      },
      delivered: {
        title: '🎉 تم توصيل طلبك',
        body: `نشكرك على طلبك من Q8 Fruit - طلب رقم ${orderId}`,
      },
    };

    const notificationContent =
      statusMessages[status] || { title: 'تحديث الطلب', body: message };

    const notificationMessage: admin.messaging.Message = {
      notification: notificationContent,
      data: {
        type: 'order_update',
        orderId,
        status,
      },
      token: userToken,
      android: {
        priority: 'high',
        notification: {
          channelId: 'q8fruit-orders',
          color: '#10b981',
          icon: 'ic_notification',
          notificationCount: 1,
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(notificationMessage);
    console.log('✅ Order notification sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending order notification:', error);
    throw error;
  }
}
