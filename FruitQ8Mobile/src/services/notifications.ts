import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        largeIcon: require('../assets/icon.png'),
        smallIcon: 'ic_notification',
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
  return messaging().onMessage(async (remoteMessage) => {
    console.log('📩 Foreground message received:', remoteMessage);

    const { title, body } = remoteMessage.notification || {};
    const data = remoteMessage.data;

    if (title && body) {
      await displayNotification(title, body, data);
    }
  });
}

// Handle background messages
export async function setupBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📩 Background message received:', remoteMessage);
    
    const { title, body } = remoteMessage.notification || {};
    const data = remoteMessage.data;

    if (title && body) {
      await displayNotification(title, body, data);
    }
  });
}

// Handle notification press
export function setupNotificationPressHandler(navigation: any) {
  notifee.onForegroundEvent(({ type, detail }) => {
    if (type === 1) { // Press event
      const data = detail.notification?.data;
      
      if (data?.orderId) {
        navigation.navigate('OrderDetails', { orderId: data.orderId });
      } else if (data?.productId) {
        navigation.navigate('ProductDetails', { productId: data.productId });
      } else if (data?.screen) {
        navigation.navigate(data.screen);
      }
    }
  });

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === 1) {
      const data = detail.notification?.data;
      await AsyncStorage.setItem('pendingNavigation', JSON.stringify(data));
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

    // Setup message handlers
    setupForegroundMessageHandler();
    await setupBackgroundMessageHandler();
    setupNotificationPressHandler(navigation);

    // Subscribe to topics
    await subscribeToDefaultTopics(userId);

    // Handle token refresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log('🔄 FCM token refreshed:', newToken);
      await AsyncStorage.setItem('fcmToken', newToken);
      // TODO: Update token on server
    });

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
    const response = await fetch('https://your-api.com/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        data,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}
