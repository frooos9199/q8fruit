import { initializeApp, getApps } from 'firebase/app';
import { collection, getDocs, getFirestore, doc, getDoc, query, where, updateDoc, deleteDoc, addDoc, setDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from './firebaseConfig';
import { API_CONFIG } from '../config/api';
import { getOrderDate } from '../utils/orderDate';
import AsyncStorage from '@react-native-async-storage/async-storage';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, auth };

interface FetchProductsOptions {
  includeInactive?: boolean;
  includeHidden?: boolean;
}

const ORDER_COUNTER_START = 99;

const normalizeText = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

const normalizeDate = (value: unknown) => {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsedDate = value ? new Date(value as string | number | Date) : null;
  return parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date();
};

const normalizeUserDocument = (raw: Record<string, any>, uidFallback = '') => {
  const uid = normalizeText(raw.uid ?? raw.id, uidFallback);
  const email = normalizeText(raw.email).trim().toLowerCase();
  const rawRole = normalizeText(raw.role).toLowerCase();
  const isAdmin = raw.isAdmin === true || rawRole === 'admin' || email === 'summit_kw@hotmail.com';
  const role = isAdmin ? 'admin' : rawRole === 'delivery' ? 'delivery' : 'user';
  const isBlocked = raw.isBlocked === true || raw.active === false;

  return {
    id: uid,
    uid,
    name: normalizeText(raw.name, 'User'),
    email,
    phone: normalizeText(raw.phone),
    address: raw.address ?? '',
    role,
    isAdmin,
    active: !isBlocked,
    isBlocked,
    createdAt: normalizeDate(raw.createdAt),
    updatedAt: new Date(),
  };
};

const toMobileUser = (raw: Record<string, any>, uidFallback = '') => {
  const normalized = normalizeUserDocument(raw, uidFallback);
  return {
    id: normalized.uid,
    uid: normalized.uid,
    name: normalized.name,
    email: normalized.email,
    phone: normalized.phone,
    address: normalized.address,
    role: normalized.role,
    isAdmin: normalized.isAdmin,
    active: normalized.active,
    isBlocked: normalized.isBlocked,
  };
};

export const getNextOrderNumber = async () => {
  const counterRef = doc(db, 'settings', 'orderCounter');

  return runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(counterRef);
    const lastOrderNumber = counterSnapshot.exists()
      ? Number(counterSnapshot.data().lastOrderNumber) || ORDER_COUNTER_START
      : ORDER_COUNTER_START;

    const nextOrderNumber = Math.max(lastOrderNumber + 1, 100);

    transaction.set(
      counterRef,
      {
        lastOrderNumber: nextOrderNumber,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return nextOrderNumber;
  });
};

export const saveUserFcmToken = async (userId: string, token: string) => {
  try {
    if (!userId || !token) {
      return { success: false, error: 'Missing userId or token' };
    }

    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        fcmToken: token,
        fcmTokens: arrayUnion(token),
        fcmTokenUpdatedAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    return { success: false, error: error.message || error };
  }
};

export const fetchProductsFromFirebase = async (options: FetchProductsOptions = {}) => {
  const { includeInactive = false, includeHidden = false } = options;
  const snapshot = await getDocs(collection(db, 'products'));
  const products = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, any>;
    const normalizedUnits = Array.isArray(data.units)
      ? data.units
          .map((unit: any) => ({
            ...unit,
            price: Number(unit?.price) || 0,
          }))
          .filter((unit: any) => unit.name)
      : [];

    return {
      id: data.id ?? doc.id,
      ...data,
      units: normalizedUnits,
      quantity: Number(data.quantity ?? 0) || 0,
      order: Number(data.order ?? 0) || 0,
      discount: Number(data.discount ?? 0) || 0,
      image: data.image || (Array.isArray(data.images) ? data.images[0] : '') || '',
      images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
    };
  });

  return products
    .filter((product: any) => {
      if (!includeInactive && product.active === false) {
        return false;
      }

      if (!includeHidden && product.isHidden === true) {
        return false;
      }

      return true;
    })
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
};

export const uploadImage = async (uri: string, path: string) => {
  try {
    if (!uri) {
      throw new Error('Invalid image URI');
    }
    
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Invalid image blob');
    }
    
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const fetchDeliverySettings = async () => {
  const CACHE_KEY = 'deliverySettings_cache';
  try {
    const docRef = doc(db, 'settings', 'delivery');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // حفظ في AsyncStorage كـ cache للاستخدام عند انقطاع الاتصال
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return data;
    }
    return { fee: 2, freeAbove: 100 };
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    // استخدام القيمة المحفوظة مسبقاً عند فشل الاتصال
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        console.log('Using cached delivery settings');
        return JSON.parse(cached);
      }
    } catch {}
    return { fee: 2, freeAbove: 100 };
  }
};

export const fetchAdminStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const getNormalizedOrderTotal = (order: any) => {
      const pricingTotal = Number(order?.pricing?.total);
      if (Number.isFinite(pricingTotal)) return pricingTotal;

      const directTotal = Number(order?.total);
      if (Number.isFinite(directTotal)) return directTotal;

      const items = Array.isArray(order?.items) ? order.items : Array.isArray(order?.products) ? order.products : [];
      const subtotal = items.reduce((sum: number, item: any) => {
        const price = Number(item?.total ?? ((Number(item?.price ?? item?.unitPrice) || 0) * (Number(item?.quantity) || 1)));
        return sum + (Number.isFinite(price) ? price : 0);
      }, 0);

      const deliveryFee = Number(order?.pricing?.deliveryPrice ?? order?.deliveryFee ?? order?.deliveryPrice) || 0;
      return subtotal + deliveryFee;
    };
    
    const todayOrders = orders.filter((order: any) => {
      const orderDate = getOrderDate(order);
      if (!orderDate) {
        return false;
      }

      return orderDate >= today;
    });
    
    const pendingOrders = orders.filter((order: any) => order.status === 'pending');
    const completedOrders = orders.filter((order: any) => order.status === 'completed' || order.status === 'delivered');
    
    const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + getNormalizedOrderTotal(order), 0);
    
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const totalProducts = productsSnapshot.docs.filter((productDoc) => {
      const data = productDoc.data() as Record<string, any>;
      return data.active !== false && data.isHidden !== true;
    }).length;
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const totalCustomers = usersSnapshot.size;
    
    return {
      todayOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      totalProducts,
      totalCustomers,
      completedOrders: completedOrders.length,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      todayOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalCustomers: 0,
      completedOrders: 0,
    };
  }
};

export const fetchOrders = async (status?: string) => {
  try {
    let ordersQuery = collection(db, 'orders');
    const snapshot = await getDocs(ordersQuery);
    let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (status) {
      orders = orders.filter((order: any) => order.status === status);
    }

    orders.sort((firstOrder: any, secondOrder: any) => {
      const firstDate = getOrderDate(firstOrder) || new Date(0);
      const secondDate = getOrderDate(secondOrder) || new Date(0);
      return secondDate.getTime() - firstDate.getTime();
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    let resolvedOrderId = orderId;

    if (!resolvedOrderId) {
      return { success: false, error: 'Missing order id' };
    }

    const directOrderRef = doc(db, 'orders', resolvedOrderId);
    const directOrderSnapshot = await getDoc(directOrderRef);

    if (!directOrderSnapshot.exists()) {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const matchingOrder = ordersSnapshot.docs.find((orderDocument) => {
        const raw = orderDocument.data() as Record<string, any>;
        return raw.id === orderId || String(raw.orderNumber || '') === String(orderId);
      });

      if (!matchingOrder) {
        return { success: false, error: 'Order not found' };
      }

      resolvedOrderId = matchingOrder.id;
    }

    const orderRef = doc(db, 'orders', resolvedOrderId);
    await updateDoc(orderRef, { status, updatedAt: new Date() });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating order:', error);
    return { success: false, error: error?.message || 'Failed to update order' };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false };
  }
};

export const updateProduct = async (productId: string, data: any) => {
  try {
    // Upload new images if any
    const uploadedImages = [];
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const uri = data.images[i];
        try {
          if (uri && (uri.startsWith('file://') || uri.startsWith('content://'))) {
            const timestamp = Date.now();
            const imagePath = `products/${timestamp}_${i}.jpg`;
            const downloadURL = await uploadImage(uri, imagePath);
            uploadedImages.push(downloadURL);
          } else if (uri && (uri.startsWith('http://') || uri.startsWith('https://'))) {
            // Keep existing Firebase URLs
            uploadedImages.push(uri);
          }
        } catch (imageError) {
          console.error(`Error uploading image ${i}:`, imageError);
          // If it's an existing URL, keep it
          if (uri && (uri.startsWith('http://') || uri.startsWith('https://'))) {
            uploadedImages.push(uri);
          }
        }
      }
    }
    
    const updateData: any = {
      ...data,
      updatedAt: new Date()
    };
    
    // Only update images if we have new ones
    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages;
      updateData.image = uploadedImages[0];
    } else if (data.images) {
      // Keep existing images
      updateData.images = data.images;
      updateData.image = data.images[0] || data.image;
    }
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, updateData);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, error: error?.message || 'Failed to update product' };
  }
};

export const addProduct = async (data: any) => {
  try {
    // Upload images to Firebase Storage
    const uploadedImages = [];
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const uri = data.images[i];
        try {
          if (uri && (uri.startsWith('file://') || uri.startsWith('content://'))) {
            const timestamp = Date.now();
            const imagePath = `products/${timestamp}_${i}.jpg`;
            const downloadURL = await uploadImage(uri, imagePath);
            uploadedImages.push(downloadURL);
          } else if (uri && (uri.startsWith('http://') || uri.startsWith('https://'))) {
            uploadedImages.push(uri);
          }
        } catch (imageError) {
          console.error(`Error uploading image ${i}:`, imageError);
          // Continue with other images
        }
      }
    }
    
    if (uploadedImages.length === 0) {
      throw new Error('No valid images uploaded');
    }
    
    const productData = {
      ...data,
      images: uploadedImages,
      image: uploadedImages[0] || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, productData);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error adding product:', error);
    return { success: false, error: error?.message || 'Failed to add product' };
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const ordersRef = collection(db, 'orders');
    const currentUser = auth.currentUser;

    const requestedOrderId =
      typeof orderData?.id === 'string' && orderData.id.trim()
        ? orderData.id.trim()
        : typeof orderData?.orderId === 'string' && orderData.orderId.trim()
          ? orderData.orderId.trim()
          : typeof orderData?.clientOrderId === 'string' && orderData.clientOrderId.trim()
            ? orderData.clientOrderId.trim()
            : '';

    const orderRef = requestedOrderId ? doc(ordersRef, requestedOrderId) : doc(ordersRef);
    const deliveryAddress = {
      ...(orderData.deliveryAddress || {}),
      fullAddress:
        orderData.deliveryAddress?.fullAddress ||
        [
          orderData.deliveryAddress?.area,
          orderData.deliveryAddress?.block ? `قطعة ${orderData.deliveryAddress.block}` : '',
          orderData.deliveryAddress?.street ? `شارع ${orderData.deliveryAddress.street}` : '',
          orderData.deliveryAddress?.building ? `بناية ${orderData.deliveryAddress.building}` : '',
          orderData.deliveryAddress?.floor ? `دور ${orderData.deliveryAddress.floor}` : '',
          orderData.deliveryAddress?.apartment ? `شقة ${orderData.deliveryAddress.apartment}` : '',
        ].filter(Boolean).join('، '),
      notes: orderData.deliveryNotes || '',
    };

    const normalizedItems = (orderData.items || []).map((item: any) => ({
      productId: item.productId || '',
      name: item.name || item.productName || item.productNameAr || 'منتج',
      productName: item.productName || item.name || '',
      productNameAr: item.productNameAr || item.productName || item.name || '',
      unit: item.unit || '',
      unitName: item.unit || '',
      price: item.price ?? item.unitPrice ?? 0,
      unitPrice: item.unitPrice ?? item.price ?? 0,
      quantity: item.quantity || 0,
      total: item.total ?? ((item.price ?? item.unitPrice ?? 0) * (item.quantity || 0)),
      image: item.image || '',
    }));

    const newOrderBase = {
      ...orderData,
      id: orderRef.id,
      source: 'mobile',
      userId: currentUser?.uid || orderData.userId || '',
      customer: {
        name: orderData.customerName || '',
        phone: orderData.phoneNumber || '',
        email: currentUser?.email || orderData.email || '',
      },
      customerName: orderData.customerName || '',
      customerEmail: currentUser?.email || orderData.email || '',
      phone: orderData.phoneNumber || '',
      phoneNumber: orderData.phoneNumber || '',
      address: deliveryAddress.fullAddress || '',
      deliveryAddress,
      delivery: deliveryAddress,
      products: normalizedItems,
      items: normalizedItems,
      pricing: {
        subtotal: orderData.subtotal || 0,
        deliveryPrice: orderData.deliveryFee || 0,
        total: orderData.total || 0,
      },
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      paymentType: orderData.paymentMethod || 'cash',
      paymentMethod: orderData.paymentMethod || 'cash',
      timestamp: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
    };

    const counterRef = doc(db, 'settings', 'orderCounter');

    const transactionResult = await runTransaction(db, async (transaction) => {
      const existingOrderSnapshot = await transaction.get(orderRef);
      if (existingOrderSnapshot.exists()) {
        const existingData = existingOrderSnapshot.data() as any;
        return {
          created: false,
          orderId: orderRef.id,
          orderNumber: existingData?.orderNumber,
        };
      }

      const counterSnapshot = await transaction.get(counterRef);
      const lastOrderNumber = counterSnapshot.exists()
        ? Number(counterSnapshot.data().lastOrderNumber) || ORDER_COUNTER_START
        : ORDER_COUNTER_START;

      const nextOrderNumber = Math.max(lastOrderNumber + 1, 100);

      transaction.set(
        counterRef,
        {
          lastOrderNumber: nextOrderNumber,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      transaction.set(orderRef, { ...newOrderBase, orderNumber: nextOrderNumber });

      return {
        created: true,
        orderId: orderRef.id,
        orderNumber: nextOrderNumber,
      };
    });

    const orderNumber = transactionResult.orderNumber;
    const newOrder = { ...newOrderBase, orderNumber };
    const shouldSendSideEffects = transactionResult.created === true;
    
    if (shouldSendSideEffects) {
      // Send notification to admin
      await sendAdminNotification({
        title: '📦 طلب جديد',
        message: `طلب جديد رقم ${orderNumber} من ${orderData.customerName} - ${(orderData.total || 0).toFixed(3)} د.ك`,
        orderId: orderRef.id,
        orderNumber,
        type: 'new_order',
      });
    }

    // Email notifications are handled server-side via Firebase Cloud Functions.
    
    return {
      success: true,
      orderId: orderRef.id,
      orderNumber,
      created: transactionResult.created === true,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false };
  }
};

export const fetchUserOrders = async (userId: string) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((firstOrder: any, secondOrder: any) => {
        const firstDate = getOrderDate(firstOrder) || new Date(0);
        const secondDate = getOrderDate(secondOrder) || new Date(0);
        return secondDate.getTime() - firstDate.getTime();
      });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);
    const normalizedUser = normalizeUserDocument(
      userSnapshot.exists()
        ? {
            ...userSnapshot.data(),
            id: user.uid,
            uid: user.uid,
            email: userSnapshot.data().email || user.email || email,
            name: userSnapshot.data().name || user.displayName || 'User',
          }
        : {
            id: user.uid,
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email || email,
            phone: '',
            role: user.email?.trim().toLowerCase() === 'summit_kw@hotmail.com' ? 'admin' : 'user',
            active: true,
            createdAt: new Date(),
          },
      user.uid
    );

    await setDoc(userRef, normalizedUser, { merge: true });

    return { success: true, user: toMobileUser(normalizedUser, user.uid) };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.code || 'auth/unknown' };
  }
};

export const registerWithEmail = async (name: string, email: string, phone: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const normalizedUser = normalizeUserDocument({
      id: user.uid,
      uid: user.uid,
      name,
      email,
      phone,
      role: email.trim().toLowerCase() === 'summit_kw@hotmail.com' ? 'admin' : 'user',
      active: true,
      createdAt: new Date(),
    }, user.uid);

    await setDoc(doc(db, 'users', user.uid), normalizedUser, { merge: true });

    return { success: true, user: toMobileUser(normalizedUser, user.uid) };
  } catch (error: any) {
    console.error('Register error:', error);
    return { success: false, error: error.code || 'auth/unknown' };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
};

export const reorderProduct = async (productId: string, direction: 'up' | 'down', allProducts: any[]) => {
  try {
    const currentIndex = allProducts.findIndex((p: any) => p.id === productId);
    if (currentIndex === -1) return { success: false };
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= allProducts.length) return { success: false };
    
    const currentProduct = allProducts[currentIndex];
    const swapProduct = allProducts[newIndex];
    
    await updateDoc(doc(db, 'products', currentProduct.id), { order: newIndex });
    await updateDoc(doc(db, 'products', swapProduct.id), { order: currentIndex });
    
    return { success: true };
  } catch (error) {
    console.error('Error reordering product:', error);
    return { success: false };
  }
};

export const fetchUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((document) => toMobileUser({ id: document.id, ...document.data() }, document.id));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const updateUser = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    const existingUser = await getDoc(userRef);
    const normalizedUser = normalizeUserDocument({
      ...(existingUser.exists() ? existingUser.data() : {}),
      ...data,
      id: userId,
      uid: userId,
    }, userId);

    await setDoc(userRef, normalizedUser, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false };
  }
};

export const updateDeliverySettings = async (fee: number, freeAbove: number) => {
  try {
    console.log('Updating delivery settings:', { fee, freeAbove });
    const settingsRef = doc(db, 'settings', 'delivery');
    
    // Try to get the document first
    const docSnap = await getDoc(settingsRef);
    
    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(settingsRef, { fee, freeAbove, updatedAt: new Date() });
    } else {
      // Create new document
      await setDoc(settingsRef, { fee, freeAbove, createdAt: new Date(), updatedAt: new Date() });
    }
    
    console.log('Delivery settings updated successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating delivery settings:', error);
    return { success: false, error: error.message || error };
  }
};

export const sendAdminNotification = async (notification: any) => {
  try {
    const notificationsRef = collection(db, 'adminNotifications');
    const createdNotification = {
      ...notification,
      read: false,
      createdAt: new Date(),
    };

    await addDoc(notificationsRef, createdNotification);

    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false };
  }
};

export const fetchAdminNotifications = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'adminNotifications'));
    const notifications = snapshot.docs.map((document) => {
      const raw = document.data() as Record<string, any>;
      return {
        id: document.id,
        title: raw.title || '',
        message: raw.message || '',
        type: raw.type || 'order',
        orderId: raw.orderId,
        createdAt: raw.createdAt || new Date(),
        read: Boolean(raw.read),
      };
    });
    return notifications.sort((a: any, b: any) => {
      const dateA = getOrderDate(a) || new Date(0);
      const dateB = getOrderDate(b) || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'adminNotifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
};

export const updateUserAddress = async (userId: string, data: { name?: string; phone?: string; address?: any }) => {
  try {
    const userRef = doc(db, 'users', userId);
    const existingUser = await getDoc(userRef);
    const normalizedUser = normalizeUserDocument({
      ...(existingUser.exists() ? existingUser.data() : {}),
      ...data,
      id: userId,
      uid: userId,
    }, userId);

    await setDoc(userRef, normalizedUser, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating user address:', error);
    return { success: false };
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return normalizeUserDocument({ id: userId, ...userSnap.data() }, userId);
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};
