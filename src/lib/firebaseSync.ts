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

// مزامنة المنتجات مع Firebase (تحديث فوري وموثوق)
export const syncProductsToFirebase = async (products: any[]) => {
  if (!db) {
    console.error('❌ Firebase db غير متاح');
    return false;
  }

  try {
    console.log('🔄 بدء مزامنة المنتجات مع Firebase:', products.length);
    const productsRef = collection(db!, 'products');
    
    // تحديث/إضافة المنتجات مع ضمان الحفظ
    const updatePromises = products.map(async (product) => {
      const productData = {
        ...product,
        updatedAt: new Date().toISOString(),
        // ضمان وجود البيانات الأساسية
        name: product.name || '',
        units: Array.isArray(product.units) ? product.units : [],
        category: product.category || '',
        active: product.active !== false,
        images: Array.isArray(product.images) ? product.images : [],
        hasOffer: product.hasOffer || false,
        discount: product.discount || 0
      };
      
      console.log(`💾 حفظ المنتج ${product.id}:`, productData.name, productData.units);
      
      return setDoc(doc(productsRef, product.id.toString()), productData, { merge: false });
    });
    
    await Promise.all(updatePromises);
    
    console.log('✅ تم مزامنة جميع المنتجات مع Firebase');
    return true;
  } catch (error) {
    console.error('❌ خطأ في مزامنة المنتجات:', error);
    return false;
  }
};

// جلب المنتجات من Firebase (فقط عند الحاجة للاستعادة)
export const getProductsFromFirebase = async () => {
  try {
    const productsRef = collection(db!, 'products');
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

// إزالة مراقب التغييرات التلقائية - الموقع هو المصدر
// export const watchProducts = (callback: (products: any[]) => void) => { ... }

// مزامنة التصنيفات مع Firebase
export const syncCategoriesToFirebase = async (categories: any[]) => {
  try {
    await setDoc(doc(db!, 'settings', 'categories'), {
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

// مزامنة فئات الكيترنج مع Firebase (كمجموعة منفصلة)
export const syncCateringToFirebase = async (cateringCategories: any[]) => {
  try {
    // حذف جميع الفئات القديمة
    const cateringRef = collection(db!, 'cateringCategories');
    const existingDocs = await getDocs(cateringRef);
    const deletePromises = existingDocs.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // إضافة الفئات الجديدة
    const addPromises = cateringCategories.map(category => 
      setDoc(doc(db!, 'cateringCategories', category.id.toString()), {
        ...category,
        updatedAt: new Date().toISOString()
      })
    );
    await Promise.all(addPromises);
    
    console.log(`✅ تم مزامنة ${cateringCategories.length} فئة كيترنج مع Firebase`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في مزامنة فئات الكيترنج:', error);
    return false;
  }
};

// جلب التصنيفات من Firebase
export const getCategoriesFromFirebase = async () => {
  try {
    const docRef = doc(db!, 'settings', 'categories');
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
    await setDoc(doc(db!, 'settings', 'banners'), {
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
    const docRef = doc(db!, 'settings', 'banners');
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
    await setDoc(doc(db!, 'settings', 'logo'), {
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
    const docRef = doc(db!, 'settings', 'logo');
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

// مزامنة المستخدمين مع Firebase
export const syncUsersToFirebase = async (users: any[]) => {
  try {
    const usersRef = collection(db!, 'users');
    
    for (const user of users) {
      await setDoc(doc(usersRef, user.id.toString()), {
        ...user,
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('تم مزامنة المستخدمين مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة المستخدمين:', error);
    return false;
  }
};

// جلب المستخدمين من Firebase
export const getUsersFromFirebase = async () => {
  try {
    const usersRef = collection(db!, 'users');
    const q = query(usersRef, orderBy('id'));
    const snapshot = await getDocs(q);
    
    const users = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    }));
    
    return users;
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return [];
  }
};

// مزامنة الطلبات مع Firebase
export const syncOrdersToFirebase = async (orders: any[]) => {
  try {
    const ordersRef = collection(db!, 'orders');
    
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
    const ordersRef = collection(db!, 'orders');
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

// مزامنة إعدادات التوصيل مع Firebase
export const syncDeliverySettingsToFirebase = async (settings: any) => {
  try {
    await setDoc(doc(db!, 'settings', 'delivery'), {
      ...settings,
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم مزامنة إعدادات التوصيل مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في مزامنة إعدادات التوصيل:', error);
    return false;
  }
};

// جلب إعدادات التوصيل من Firebase
export const getDeliverySettingsFromFirebase = async () => {
  try {
    const docRef = doc(db!, 'settings', 'delivery');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب إعدادات التوصيل:', error);
    return null;
  }
};

// مزامنة شاملة لجميع البيانات
export const syncAllDataToFirebase = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // مزامنة المنتجات بدون حماية مفرطة
    const products = localStorage.getItem('products');
    if (products) {
      const parsedProducts = JSON.parse(products);
      if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
        await syncProductsToFirebase(parsedProducts);
      } else {
        console.warn('لا توجد منتجات في localStorage');
      }
    }
    
    // مزامنة فئات الكيترنج
    const cateringCategories = localStorage.getItem('cateringCategories');
    if (cateringCategories) {
      const parsedCateringCategories = JSON.parse(cateringCategories);
      if (Array.isArray(parsedCateringCategories) && parsedCateringCategories.length > 0) {
        await syncCateringToFirebase(parsedCateringCategories);
        console.log(`✅ تم مزامنة ${parsedCateringCategories.length} فئة كيترنج`);
      }
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
    
    // مزامنة المستخدمين
    const users = localStorage.getItem('users');
    if (users) {
      const parsedUsers = JSON.parse(users);
      await syncUsersToFirebase(parsedUsers);
    }
    
    // مزامنة الطلبات
    const orders = localStorage.getItem('orders');
    if (orders) {
      const parsedOrders = JSON.parse(orders);
      await syncOrdersToFirebase(parsedOrders);
    }
    
    // مزامنة إعدادات التوصيل
    const deliveryPrice = localStorage.getItem('deliveryPrice');
    const deliveryTime = localStorage.getItem('deliveryTime');
    if (deliveryPrice || deliveryTime) {
      await syncDeliverySettingsToFirebase({
        deliveryPrice: deliveryPrice ? Number(deliveryPrice) : 2.5,
        deliveryTime: deliveryTime || 'خلال ساعتين'
      });
    }
    
    console.log('تم مزامنة جميع البيانات مع Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة الشاملة:', error);
    return false;
  }
};

// جلب البيانات من Firebase للموبايل
export const loadAllDataFromFirebase = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('📱 جلب البيانات للموبايل من Firebase...');
    
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
    
    console.log('✅ تم جلب البيانات للموبايل من Firebase');
    return true;
  } catch (error) {
    console.error('❌ خطأ في جلب البيانات للموبايل:', error);
    return false;
  }
};

// جلب يدوي فقط للطوارئ (من لوحة الإدارة)
export const emergencyLoadFromFirebase = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('🆘 جلب طوارئ من Firebase...');
    
    const products = await getProductsFromFirebase();
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
    
    const categories = await getCategoriesFromFirebase();
    if (categories.length > 0) {
      localStorage.setItem('cateringCategories', JSON.stringify(categories));
    }
    
    const users = await getUsersFromFirebase();
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    const orders = await getOrdersFromFirebase();
    if (orders.length > 0) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    console.log('✅ تم الجلب الطارئ من Firebase');
    return true;
  } catch (error) {
    console.error('❌ خطأ في الجلب الطارئ:', error);
    return false;
  }
};