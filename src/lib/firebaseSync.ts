import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';

// مزامنة المنتجات مع Firebase
export const syncProductsToFirebase = async (products: any[]) => {
  try {
    const productsRef = collection(db, 'products');
    
    // حذف المنتجات القديمة وإضافة الجديدة
    for (const product of products) {
      await setDoc(doc(productsRef, product.id.toString()), {
        ...product,
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('تم مزامنة المنتجات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة المنتجات:', error);
    return false;
  }
};

// جلب المنتجات من Firebase
export const getProductsFromFirebase = async () => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('id'));
    const snapshot = await getDocs(q);
    
    const products = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    }));
    
    return products;
  } catch (error) {
    console.error('خطأ في جلب المنتجات:', error);
    return [];
  }
};

// مراقبة تغييرات المنتجات في الوقت الفعلي
export const watchProducts = (callback: (products: any[]) => void) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('id'));
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: parseInt(doc.id)
      }));
      callback(products);
    });
  } catch (error) {
    console.error('خطأ في مراقبة المنتجات:', error);
    return () => {};
  }
};

// مزامنة التصنيفات مع Firebase
export const syncCategoriesToFirebase = async (categories: any[]) => {
  try {
    await setDoc(doc(db, 'settings', 'categories'), {
      categories,
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم مزامنة التصنيفات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة التصنيفات:', error);
    return false;
  }
};

// جلب التصنيفات من Firebase
export const getCategoriesFromFirebase = async () => {
  try {
    const docRef = doc(db, 'settings', 'categories');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().categories || [];
    }
    return [];
  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
    return [];
  }
};

// مزامنة البانرات مع Firebase
export const syncBannersToFirebase = async (banners: string[]) => {
  try {
    await setDoc(doc(db, 'settings', 'banners'), {
      banners,
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم مزامنة البانرات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة البانرات:', error);
    return false;
  }
};

// جلب البانرات من Firebase
export const getBannersFromFirebase = async () => {
  try {
    const docRef = doc(db, 'settings', 'banners');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().banners || [];
    }
    return [];
  } catch (error) {
    console.error('خطأ في جلب البانرات:', error);
    return [];
  }
};

// مزامنة الشعار مع Firebase
export const syncLogoToFirebase = async (logo: string) => {
  try {
    await setDoc(doc(db, 'settings', 'logo'), {
      logo,
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم مزامنة الشعار مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة الشعار:', error);
    return false;
  }
};

// جلب الشعار من Firebase
export const getLogoFromFirebase = async () => {
  try {
    const docRef = doc(db, 'settings', 'logo');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().logo || null;
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب الشعار:', error);
    return null;
  }
};

// مزامنة الطلبات مع Firebase
export const syncOrdersToFirebase = async (orders: any[]) => {
  try {
    const ordersRef = collection(db, 'orders');
    
    for (const order of orders) {
      await setDoc(doc(ordersRef, order.id.toString()), {
        ...order,
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('تم مزامنة الطلبات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة الطلبات:', error);
    return false;
  }
};

// جلب الطلبات من Firebase
export const getOrdersFromFirebase = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('id'));
    const snapshot = await getDocs(q);
    
    const orders = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    }));
    
    return orders;
  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error);
    return [];
  }
};

// مزامنة شاملة لجميع البيانات
export const syncAllDataToFirebase = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // مزامنة المنتجات
    const products = localStorage.getItem('products');
    if (products) {
      const parsedProducts = JSON.parse(products);
      await syncProductsToFirebase(parsedProducts);
    }
    
    // مزامنة التصنيفات
    const categories = localStorage.getItem('cateringCategories');
    if (categories) {
      const parsedCategories = JSON.parse(categories);
      await syncCategoriesToFirebase(parsedCategories);
    }
    
    // مزامنة البانرات
    const banners = localStorage.getItem('banners');
    if (banners) {
      const parsedBanners = JSON.parse(banners);
      await syncBannersToFirebase(parsedBanners);
    }
    
    // مزامنة الشعار
    const logo = localStorage.getItem('siteLogo');
    if (logo) {
      await syncLogoToFirebase(logo);
    }
    
    // مزامنة الطلبات
    const orders = localStorage.getItem('orders');
    if (orders) {
      const parsedOrders = JSON.parse(orders);
      await syncOrdersToFirebase(parsedOrders);
    }
    
    console.log('تم مزامنة جميع البيانات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة الشاملة:', error);
    return false;
  }
};

// جلب جميع البيانات من Firebase وحفظها في localStorage
export const loadAllDataFromFirebase = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // جلب المنتجات
    const products = await getProductsFromFirebase();
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
    
    // جلب التصنيفات
    const categories = await getCategoriesFromFirebase();
    if (categories.length > 0) {
      localStorage.setItem('cateringCategories', JSON.stringify(categories));
    }
    
    // جلب البانرات
    const banners = await getBannersFromFirebase();
    if (banners.length > 0) {
      localStorage.setItem('banners', JSON.stringify(banners));
    }
    
    // جلب الشعار
    const logo = await getLogoFromFirebase();
    if (logo) {
      localStorage.setItem('siteLogo', logo);
    }
    
    // جلب الطلبات
    const orders = await getOrdersFromFirebase();
    if (orders.length > 0) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    // إرسال إشعارات التحديث
    window.dispatchEvent(new Event('storage'));
    
    console.log('تم تحميل جميع البيانات من Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في تحميل البيانات:', error);
    return false;
  }
};