import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import { saveUserFcmToken } from './firebase';

let notificationsInitialized = false;
let foregroundUnsubscribe: (() => void) | null = null;
let tokenRefreshUnsubscribe: (() => void) | null = null;
let notificationOpenedUnsubscribe: (() => void) | null = null;
let currentNotificationUserId: string | undefined;

function getNavigationPayload(data?: any) {
  if (!data) {
    return null;
  }

  if (data.orderId) {
    return { screen: 'OrderDetails', params: { orderId: data.orderId } };
  }

  if (data.productId) {
    return { screen: 'ProductDetails', params: { productId: data.productId } };
  }

  if (data.screen) {
    return { screen: data.screen, params: data.params ? JSON.parse(data.params) : undefined };
  }

  return null;
}

async function queuePendingNavigation(data?: any) {
  if (!data) {
    return;
  }

  await AsyncStorage.setItem('pendingNavigation', JSON.stringify(data));
}

async function handleNotificationNavigation(navigation: any, data?: any) {
  const target = getNavigationPayload(data);

  if (!target || !navigation?.isReady?.()) {
    await queuePendingNavigation(data);
    return;
  }

  navigation.navigate(target.screen, target.params);
}

export async function consumePendingNotificationNavigation(navigation: any) {
  const pendingNavigation = await AsyncStorage.getItem('pendingNavigation');

  if (!pendingNavigation) {
    return;
  }

  await AsyncStorage.removeItem('pendingNavigation');

  try {
    const data = JSON.parse(pendingNavigation);
    await handleNotificationNavigation(navigation, data);
  } catch (error) {
    console.error('Error processing pending notification navigation:', error);
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export function registerBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    console.log('📩 Background message received:', remoteMessage);

    if (remoteMessage?.data) {
      await queuePendingNavigation(remoteMessage.data);
    }

    // When the app is backgrounded or closed, the OS displays notification payloads.
    // Only render a local notification for data-only messages.
    if (!remoteMessage?.notification && remoteMessage?.data?.title && remoteMessage?.data?.body) {
      await displayNotification(
        remoteMessage.data.title,
        remoteMessage.data.body,
        remoteMessage.data,
        remoteMessage.data.channelId || 'q8fruit-orders'
      );
    }
  });
}

// Get FCM token
export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('📱 FCM Token:', token);
    await AsyncStorage.setItem('fcmToken', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

async function syncUserFcmToken(userId: string | undefined, token: string | null) {
  if (!userId || !token) {
    return;
  }

  const result = await saveUserFcmToken(userId, token);
  if (!result.success) {
    console.error('Error syncing FCM token:', result.error);
  }
}

// Setup notification channel (Android)
export async function createNotificationChannel() {
  try {
    await notifee.createChannel({
      id: 'q8fruit-orders',
      name: 'Order Updates',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.createChannel({
      id: 'q8fruit-promotions',
      name: 'Promotions & Offers',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });

    console.log('✅ Notification channels created');
  } catch (error) {
    console.error('Error creating notification channels:', error);
  }
}

// Display local notification
export async function displayNotification(
  title: string,
  body: string,
  data?: any,
  channelId: string = 'q8fruit-orders'
) {
  try {
    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        largeIcon: require('../assets/images/logo.png'),
        smallIcon: 'ic_launcher',
        color: '#10b981',
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
      },
    });
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
}

// Handle foreground messages
export function setupForegroundMessageHandler() {
  return messaging().onMessage(async (remoteMessage: any) => {
    console.log('📩 Foreground message received:', remoteMessage);

    const { title, body } = remoteMessage.notification || {};
    const data = remoteMessage.data;

    if (title && body) {
      await displayNotification(title, body, data);
    }
  });
}

// Handle notification press
export function setupNotificationPressHandler(navigation: any) {
  notifee.onForegroundEvent(({ type, detail }: any) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data;

      handleNotificationNavigation(navigation, data);
    }
  });

  notifee.onBackgroundEvent(async ({ type, detail }: any) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data;
      await queuePendingNavigation(data);
    }
  });
}

// Subscribe to topics
export async function subscribeToTopic(topic: string) {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`✅ Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
}

// Unsubscribe from topics
export async function unsubscribeFromTopic(topic: string) {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`✅ Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`Error unsubscribing from topic ${topic}:`, error);
  }
}

// Subscribe to default topics
export async function subscribeToDefaultTopics(userId?: string) {
  await subscribeToTopic('all-users');
  await subscribeToTopic('promotions');
  
  if (userId) {
    await subscribeToTopic(`user-${userId}`);
  }
}

// Initialize push notifications
export async function initializePushNotifications(navigation: any, userId?: string) {
  try {
    if (currentNotificationUserId && currentNotificationUserId !== userId) {
      await unsubscribeFromTopic(`user-${currentNotificationUserId}`);
    }

    currentNotificationUserId = userId;

    // Request permission
    const hasPermission = await requestNotificationPermission();
    
    if (!hasPermission) {
      console.log('❌ Notifications not enabled');
      return null;
    }

    // Create channels (Android)
    await createNotificationChannel();

    // Get FCM token
    const fcmToken = await getFCMToken();
    await syncUserFcmToken(userId, fcmToken);

    if (!notificationsInitialized) {
      foregroundUnsubscribe = setupForegroundMessageHandler();
      setupNotificationPressHandler(navigation);
      notificationOpenedUnsubscribe = messaging().onNotificationOpenedApp(async (remoteMessage: any) => {
        await handleNotificationNavigation(navigation, remoteMessage?.data);
      });

      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification?.data) {
        await queuePendingNavigation(initialNotification.data);
      }

      tokenRefreshUnsubscribe = messaging().onTokenRefresh(async (newToken: string) => {
        console.log('🔄 FCM token refreshed:', newToken);
        await AsyncStorage.setItem('fcmToken', newToken);
        await syncUserFcmToken(currentNotificationUserId, newToken);
      });

      notificationsInitialized = true;
    }

    // Subscribe to topics
    await subscribeToDefaultTopics(userId);
  await consumePendingNotificationNavigation(navigation);

    console.log('✅ Push notifications initialized');
    return fcmToken;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return null;
  }
}

// Send notification to server for processing
export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        data,
        topic: `user-${userId}`,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}
