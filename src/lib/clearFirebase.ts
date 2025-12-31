import { db, storage } from './firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc,
  doc
} from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';

// حذف جميع المنتجات من Firestore
export const deleteAllProducts = async () => {
  if (!db) {
    console.error('❌ Firebase db غير متاح');
    return false;
  }
  
  try {
    const productsRef = collection(db!, 'products');
    const snapshot = await getDocs(productsRef);
    
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ تم حذف جميع المنتجات من Firestore');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف المنتجات:', error);
    return false;
  }
};

// حذف جميع الطلبات من Firestore
export const deleteAllOrders = async () => {
  if (!db) {
    console.error('❌ Firebase db غير متاح');
    return false;
  }
  
  try {
    const ordersRef = collection(db!, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ تم حذف جميع الطلبات من Firestore');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف الطلبات:', error);
    return false;
  }
};

// حذف جميع المستخدمين من Firestore
export const deleteAllUsers = async () => {
  if (!db) {
    console.error('❌ Firebase db غير متاح');
    return false;
  }
  
  try {
    const usersRef = collection(db!, 'users');
    const snapshot = await getDocs(usersRef);
    
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ تم حذف جميع المستخدمين من Firestore');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف المستخدمين:', error);
    return false;
  }
};

// حذف جميع الصور من Firebase Storage
export const deleteAllImages = async () => {
  if (!storage) {
    console.error('❌ Firebase storage غير متاح');
    return false;
  }
  
  try {
    const storageRef = ref(storage!, 'products');
    const imagesList = await listAll(storageRef);
    
    const deletePromises = imagesList.items.map(imageRef => deleteObject(imageRef));
    await Promise.all(deletePromises);
    
    console.log('✅ تم حذف جميع الصور من Firebase Storage');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف الصور:', error);
    return false;
  }
};

// حذف جميع الإعدادات من Firestore
export const deleteAllSettings = async () => {
  if (!db) {
    console.error('❌ Firebase db غير متاح');
    return false;
  }

  try {
    const settingsToDelete = ['categories', 'banners', 'logo', 'delivery'];

    const deletePromises = settingsToDelete.map(setting =>
      deleteDoc(doc(db!, 'settings', setting))
    );
    await Promise.all(deletePromises);

    console.log('✅ تم حذف جميع الإعدادات من Firestore');
    return true;
  } catch (error) {
    console.error('❌ خطأ في حذف الإعدادات:', error);
    return false;
  }
};

// حذف شامل لجميع البيانات من Firebase
export const clearAllFirebaseData = async () => {
  console.log('🔥 بدء حذف جميع البيانات من Firebase...');
  
  try {
    // حذف المنتجات
    await deleteAllProducts();
    
    // حذف الطلبات
    await deleteAllOrders();
    
    // حذف المستخدمين
    await deleteAllUsers();
    
    // حذف الإعدادات
    await deleteAllSettings();
    
    // حذف الصور
    await deleteAllImages();
    
    console.log('🎉 تم حذف جميع البيانات من Firebase بنجاح!');
    return true;
  } catch (error) {
    console.error('💥 خطأ في حذف البيانات:', error);
    return false;
  }
};