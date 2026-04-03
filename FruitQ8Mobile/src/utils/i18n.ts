import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: {
    translation: {
      // Common
      appName: 'Fruit Q8',
      welcome: 'Welcome to Fruit Q8',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      
      // Auth
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      phone: 'Phone',
      forgotPassword: 'Forgot Password?',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      
      // Home
      home: 'Home',
      categories: 'Categories',
      featuredProducts: 'Featured Products',
      viewAll: 'View All',
      newArrivals: 'New Arrivals',
      bestSellers: 'Best Sellers',
      
      // Products
      products: 'Products',
      productDetails: 'Product Details',
      price: 'Price',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      quantity: 'Quantity',
      
      // Cart
      cart: 'Cart',
      cartEmpty: 'Your cart is empty',
      subtotal: 'Subtotal',
      total: 'Total',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      
      // Profile
      profile: 'Profile',
      myOrders: 'My Orders',
      settings: 'Settings',
      language: 'Language',
      notifications: 'Notifications',
      address: 'Address',
      paymentMethods: 'Payment Methods',
      
      // Units
      kg: 'KG',
      piece: 'Piece',
      box: 'Box',
      
      // Messages
      addedToCart: 'Added to cart successfully',
      removedFromCart: 'Removed from cart',
      orderPlaced: 'Order placed successfully',
      loginRequired: 'Please login to continue',
      invalidCredentials: 'Invalid email or password',
      loginError: 'Login failed. Please try again',
      registerError: 'Registration failed. Please try again',
      emailAlreadyExists: 'Email already exists',
      weakPassword: 'Password should be at least 6 characters',
      fillAllFields: 'Please fill all fields',
      passwordMismatch: 'Passwords do not match',
    },
  },
  ar: {
    translation: {
      // Common
      appName: 'فكهاني الكويت',
      welcome: 'مرحباً بك في فكهاني الكويت',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      search: 'بحث',
      
      // Auth
      login: 'تسجيل الدخول',
      register: 'تسجيل جديد',
      logout: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      name: 'الاسم',
      phone: 'رقم الهاتف',
      forgotPassword: 'نسيت كلمة المرور؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      
      // Home
      home: 'الرئيسية',
      categories: 'الفئات',
      featuredProducts: 'المنتجات المميزة',
      viewAll: 'عرض الكل',
      newArrivals: 'وصل حديثاً',
      bestSellers: 'الأكثر مبيعاً',
      
      // Products
      products: 'المنتجات',
      productDetails: 'تفاصيل المنتج',
      price: 'السعر',
      addToCart: 'أضف للسلة',
      buyNow: 'اشتر الآن',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      quantity: 'الكمية',
      
      // Cart
      cart: 'السلة',
      cartEmpty: 'سلة المشتريات فارغة',
      subtotal: 'المجموع الفرعي',
      total: 'المجموع الكلي',
      checkout: 'إتمام الطلب',
      continueShopping: 'متابعة التسوق',
      
      // Profile
      profile: 'الملف الشخصي',
      myOrders: 'طلباتي',
      settings: 'الإعدادات',
      language: 'اللغة',
      notifications: 'الإشعارات',
      address: 'العنوان',
      paymentMethods: 'طرق الدفع',
      
      // Units
      kg: 'كجم',
      piece: 'حبة',
      box: 'صندوق',
      
      // Messages
      addedToCart: 'تمت الإضافة للسلة بنجاح',
      removedFromCart: 'تم الحذف من السلة',
      orderPlaced: 'تم تقديم الطلب بنجاح',
      loginRequired: 'يرجى تسجيل الدخول للمتابعة',
      invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      loginError: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى',
      registerError: 'فشل التسجيل. يرجى المحاولة مرة أخرى',
      emailAlreadyExists: 'البريد الإلكتروني مستخدم بالفعل',
      weakPassword: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
      fillAllFields: 'يرجى ملء جميع الحقول',
      passwordMismatch: 'كلمات المرور غير متطابقة',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language
AsyncStorage.getItem(LANGUAGE_KEY).then((savedLang: string | null) => {
  if (savedLang) {
    i18n.changeLanguage(savedLang);
  }
});

export const changeLanguage = async (lang: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export default i18n;
