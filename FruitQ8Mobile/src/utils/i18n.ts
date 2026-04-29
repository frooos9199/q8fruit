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
      ok: 'OK',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      guest: 'Guest',
      notLoggedIn: 'Not logged in',

      languageNames: {
        ar: 'العربية',
        en: 'English',
        bn: 'বাংলা',
      },
      
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
      swipeForMore: 'Swipe for more',
      
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

      orderStatus: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        delivering: 'Delivering',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      },

      admin: {
        dashboard: {
          title: 'Admin Dashboard',
          statistics: 'Statistics',
          management: 'Management',
        },
        options: {
          products: 'Manage Products',
          orders: 'Manage Orders',
          users: 'Manage Users',
          categories: 'Manage Categories',
          offers: 'Manage Offers',
          delivery: 'Delivery Settings',
          reports: 'Reports',
        },
        stats: {
          todayOrders: "Today's Orders",
          pendingOrders: 'Pending Orders',
          totalRevenue: 'Total Revenue',
          totalProducts: 'Total Products',
          totalCustomers: 'Total Customers',
          completedOrders: 'Completed Orders',
        },
        manageProducts: {
          title: 'Manage Products',
          searchPlaceholder: 'Search products...',
          total: 'Total',
          inStock: 'In Stock',
          offers: 'Offers',
          noProducts: 'No products found',
          hidden: 'Hidden',
          visible: 'Visible',
          reorderFailed: 'Failed to reorder',
          deleteTitle: 'Delete Product',
          deleteConfirm: 'Delete "{{name}}"?',
          deleted: 'Deleted successfully',
          deleteFailed: 'Failed to delete',
          updateFailed: 'Failed to update',
        },
        manageOrders: {
          title: 'Manage Orders',
          filters: {
            all: 'All',
            pending: 'Pending',
            confirmed: 'Confirmed',
            delivered: 'Delivered',
          },
          noOrders: 'No orders found',
          customer: 'Customer',
          na: 'N/A',
        },
        manageOffers: {
          title: 'Manage Offers',
          comingSoon: 'Coming Soon - Manage Offers',
        },
        deliverySettings: {
          title: 'Delivery Settings',
          cardTitle: '⚙️ Delivery Fee Settings',
          feeLabel: 'Delivery Fee (KD)',
          feeHint: 'Default delivery fee per order',
          freeAboveLabel: 'Free Delivery Above (KD)',
          freeAboveHint: 'Orders above this amount get free delivery',
          exampleTitle: '📝 Example:',
          exampleText:
            '• Delivery Fee: {{fee}} KD\n• Free Above: {{freeAbove}} KD\n\nIf order is {{freeAbove}} KD or more, delivery is free\nIf less, {{fee}} KD will be added',
          saveButton: '💾 Save Settings',
          valuesPositive: 'Values must be positive',
          saved: 'Settings saved successfully',
          saveFailed: 'Failed to save settings: {{error}}',
        },
        orderDetails: {
          title: 'Order Details',
          customerInfo: 'Customer Info',
          deliveryInfo: 'Delivery Info',
          items: 'Items',
          payment: 'Payment',
          deliveryLabel: 'Delivery',
          whatsapp: 'WhatsApp',
          sendToAdmin: '📱 Send to Admin',
          sendToCustomer: '📱 Send to Customer',
          updateStatus: 'Update Status',
          updateStatusConfirm: 'Update status to "{{status}}"?',
          update: 'Update',
          updated: 'Updated successfully',
          updateFailed: 'Failed to update order status',
          paymentMethod: 'Payment Method:',
          cashOnDelivery: 'Cash on Delivery',
          kNet: 'K-Net',
          free: 'Free',
          nameLabel: 'Name:',
          phoneLabel: 'Phone:',
          emailLabel: 'Email:',
          notesLabel: 'Notes:',
          areaLabel: 'Area:',
          blockLabel: 'Block:',
          streetLabel: 'Street:',
          buildingLabel: 'Building:',
          floorLabel: 'Floor:',
          apartmentLabel: 'Apartment:',
        },
      },
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
      ok: 'حسناً',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      search: 'بحث',
      guest: 'ضيف',
      notLoggedIn: 'غير مسجل',

      languageNames: {
        ar: 'العربية',
        en: 'English',
        bn: 'বাংলা',
      },
      
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
      swipeForMore: 'اسحب للمزيد',
      
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

      orderStatus: {
        pending: 'قيد الانتظار',
        confirmed: 'مؤكد',
        preparing: 'قيد التحضير',
        delivering: 'قيد التوصيل',
        delivered: 'تم التوصيل',
        cancelled: 'ملغي',
      },

      admin: {
        dashboard: {
          title: 'لوحة الإدارة',
          statistics: 'الإحصائيات',
          management: 'الإدارة',
        },
        options: {
          products: 'إدارة المنتجات',
          orders: 'إدارة الطلبات',
          users: 'إدارة المستخدمين',
          categories: 'إدارة الفئات',
          offers: 'إدارة العروض',
          delivery: 'إعدادات التوصيل',
          reports: 'التقارير',
        },
        stats: {
          todayOrders: 'طلبات اليوم',
          pendingOrders: 'طلبات قيد المعالجة',
          totalRevenue: 'إجمالي الإيرادات',
          totalProducts: 'إجمالي المنتجات',
          totalCustomers: 'إجمالي العملاء',
          completedOrders: 'الطلبات المكتملة',
        },
        manageProducts: {
          title: 'إدارة المنتجات',
          searchPlaceholder: 'بحث عن منتج...',
          total: 'إجمالي',
          inStock: 'متوفر',
          offers: 'عروض',
          noProducts: 'لا توجد منتجات',
          hidden: 'مخفي',
          visible: 'ظاهر',
          reorderFailed: 'فشل إعادة الترتيب',
          deleteTitle: 'حذف المنتج',
          deleteConfirm: 'هل تريد حذف "{{name}}"؟',
          deleted: 'تم الحذف بنجاح',
          deleteFailed: 'فشل الحذف',
          updateFailed: 'فشل التحديث',
        },
        manageOrders: {
          title: 'إدارة الطلبات',
          filters: {
            all: 'الكل',
            pending: 'قيد الانتظار',
            confirmed: 'مؤكد',
            delivered: 'مكتمل',
          },
          noOrders: 'لا توجد طلبات',
          customer: 'عميل',
          na: 'غير متوفر',
        },
        manageOffers: {
          title: 'إدارة العروض',
          comingSoon: 'قريباً - إدارة العروض',
        },
        deliverySettings: {
          title: 'إعدادات التوصيل',
          cardTitle: '⚙️ إعدادات رسوم التوصيل',
          feeLabel: 'رسوم التوصيل (د.ك)',
          feeHint: 'رسوم التوصيل الافتراضية لكل طلب',
          freeAboveLabel: 'توصيل مجاني فوق (د.ك)',
          freeAboveHint: 'الطلبات فوق هذا المبلغ تحصل على توصيل مجاني',
          exampleTitle: '📝 مثال:',
          exampleText:
            '• رسوم التوصيل: {{fee}} د.ك\n• توصيل مجاني فوق: {{freeAbove}} د.ك\n\nإذا كان الطلب {{freeAbove}} د.ك أو أكثر، التوصيل مجاني\nإذا كان أقل، يتم إضافة {{fee}} د.ك',
          saveButton: '💾 حفظ الإعدادات',
          valuesPositive: 'القيم يجب أن تكون موجبة',
          saved: 'تم حفظ الإعدادات بنجاح',
          saveFailed: 'فشل حفظ الإعدادات: {{error}}',
        },
        orderDetails: {
          title: 'تفاصيل الطلب',
          customerInfo: 'معلومات العميل',
          deliveryInfo: 'معلومات التوصيل',
          items: 'المنتجات',
          payment: 'الدفع',
          deliveryLabel: 'التوصيل',
          whatsapp: 'واتساب',
          sendToAdmin: '📱 إرسال للإدارة',
          sendToCustomer: '📱 إرسال للعميل',
          updateStatus: 'تحديث الحالة',
          updateStatusConfirm: 'تحديث الحالة إلى "{{status}}"؟',
          update: 'تحديث',
          updated: 'تم التحديث',
          updateFailed: 'فشل تحديث حالة الطلب',
          paymentMethod: 'طريقة الدفع:',
          cashOnDelivery: 'الدفع عند الاستلام',
          kNet: 'كي نت',
          free: 'مجاناً',
          nameLabel: 'الاسم:',
          phoneLabel: 'الهاتف:',
          emailLabel: 'البريد:',
          notesLabel: 'ملاحظات:',
          areaLabel: 'المنطقة:',
          blockLabel: 'القطعة:',
          streetLabel: 'الشارع:',
          buildingLabel: 'البناية:',
          floorLabel: 'الدور:',
          apartmentLabel: 'الشقة:',
        },
      },
    },
  },
  bn: {
    translation: {
      // Common
      appName: 'FruitQ8',
      welcome: 'FruitQ8-এ স্বাগতম',
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি',
      success: 'সফল',
      cancel: 'বাতিল',
      confirm: 'নিশ্চিত',
      ok: 'ঠিক আছে',
      save: 'সংরক্ষণ',
      delete: 'মুছে ফেলুন',
      edit: 'সম্পাদনা',
      search: 'অনুসন্ধান',
      guest: 'অতিথি',
      notLoggedIn: 'লগইন করা নেই',

      languageNames: {
        ar: 'العربية',
        en: 'English',
        bn: 'বাংলা',
      },

      // Auth
      login: 'লগইন',
      register: 'রেজিস্টার',
      logout: 'লগআউট',
      email: 'ইমেইল',
      password: 'পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      name: 'নাম',
      phone: 'ফোন',
      forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
      dontHaveAccount: 'অ্যাকাউন্ট নেই?',
      alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',

      // Home
      home: 'হোম',
      categories: 'বিভাগসমূহ',
      featuredProducts: 'ফিচারড পণ্য',
      viewAll: 'সব দেখুন',
      newArrivals: 'নতুন এসেছে',
      bestSellers: 'সবচেয়ে বিক্রি',
      swipeForMore: 'আরও দেখতে সোয়াইপ করুন',

      // Products
      products: 'পণ্য',
      productDetails: 'পণ্যের বিস্তারিত',
      price: 'দাম',
      addToCart: 'কার্টে যোগ করুন',
      buyNow: 'এখনই কিনুন',
      inStock: 'স্টকে আছে',
      outOfStock: 'স্টকে নেই',
      quantity: 'পরিমাণ',

      // Cart
      cart: 'কার্ট',
      cartEmpty: 'আপনার কার্ট খালি',
      subtotal: 'উপ-মোট',
      total: 'মোট',
      checkout: 'চেকআউট',
      continueShopping: 'কেনাকাটা চালিয়ে যান',

      // Profile
      profile: 'প্রোফাইল',
      myOrders: 'আমার অর্ডার',
      settings: 'সেটিংস',
      language: 'ভাষা',
      notifications: 'নোটিফিকেশন',
      address: 'ঠিকানা',
      paymentMethods: 'পেমেন্ট পদ্ধতি',

      // Units
      kg: 'কেজি',
      piece: 'পিস',
      box: 'বক্স',

      // Messages
      addedToCart: 'কার্টে যোগ করা হয়েছে',
      removedFromCart: 'কার্ট থেকে সরানো হয়েছে',
      orderPlaced: 'অর্ডার সফলভাবে দেওয়া হয়েছে',
      loginRequired: 'চালিয়ে যেতে লগইন করুন',
      invalidCredentials: 'ইমেইল বা পাসওয়ার্ড ভুল',
      loginError: 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন',
      registerError: 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন',
      emailAlreadyExists: 'ইমেইল ইতিমধ্যে আছে',
      weakPassword: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হওয়া উচিত',
      fillAllFields: 'সব ক্ষেত্র পূরণ করুন',
      passwordMismatch: 'পাসওয়ার্ড মিলছে না',

      orderStatus: {
        pending: 'অপেক্ষমাণ',
        confirmed: 'নিশ্চিত',
        preparing: 'প্রস্তুত হচ্ছে',
        delivering: 'ডেলিভারির পথে',
        delivered: 'ডেলিভারি সম্পন্ন',
        cancelled: 'বাতিল',
      },

      admin: {
        dashboard: {
          title: 'অ্যাডমিন ড্যাশবোর্ড',
          statistics: 'পরিসংখ্যান',
          management: 'ব্যবস্থাপনা',
        },
        options: {
          products: 'পণ্য ব্যবস্থাপনা',
          orders: 'অর্ডার ব্যবস্থাপনা',
          users: 'ব্যবহারকারী ব্যবস্থাপনা',
          categories: 'বিভাগ ব্যবস্থাপনা',
          offers: 'অফার ব্যবস্থাপনা',
          delivery: 'ডেলিভারি সেটিংস',
          reports: 'রিপোর্ট',
        },
        stats: {
          todayOrders: 'আজকের অর্ডার',
          pendingOrders: 'অপেক্ষমাণ অর্ডার',
          totalRevenue: 'মোট আয়',
          totalProducts: 'মোট পণ্য',
          totalCustomers: 'মোট গ্রাহক',
          completedOrders: 'সম্পন্ন অর্ডার',
        },
        manageProducts: {
          title: 'পণ্য ব্যবস্থাপনা',
          searchPlaceholder: 'পণ্য খুঁজুন...',
          total: 'মোট',
          inStock: 'স্টকে',
          offers: 'অফার',
          noProducts: 'কোনো পণ্য পাওয়া যায়নি',
          hidden: 'লুকানো',
          visible: 'দৃশ্যমান',
          reorderFailed: 'ক্রম বদলাতে ব্যর্থ',
          deleteTitle: 'পণ্য মুছুন',
          deleteConfirm: 'আপনি কি "{{name}}" মুছে ফেলতে চান?',
          deleted: 'সফলভাবে মুছে ফেলা হয়েছে',
          deleteFailed: 'মুছে ফেলতে ব্যর্থ',
          updateFailed: 'আপডেট ব্যর্থ',
        },
        manageOrders: {
          title: 'অর্ডার ব্যবস্থাপনা',
          filters: {
            all: 'সব',
            pending: 'অপেক্ষমাণ',
            confirmed: 'নিশ্চিত',
            delivered: 'সম্পন্ন',
          },
          noOrders: 'কোনো অর্ডার পাওয়া যায়নি',
          customer: 'গ্রাহক',
          na: 'নেই',
        },
        manageOffers: {
          title: 'অফার ব্যবস্থাপনা',
          comingSoon: 'শীঘ্রই - অফার ব্যবস্থাপনা',
        },
        deliverySettings: {
          title: 'ডেলিভারি সেটিংস',
          cardTitle: '⚙️ ডেলিভারি ফি সেটিংস',
          feeLabel: 'ডেলিভারি ফি (KD)',
          feeHint: 'প্রতি অর্ডারের ডিফল্ট ডেলিভারি ফি',
          freeAboveLabel: 'ফ্রি ডেলিভারি (KD-এর উপরে)',
          freeAboveHint: 'এই অঙ্কের উপরের অর্ডারে ফ্রি ডেলিভারি',
          exampleTitle: '📝 উদাহরণ:',
          exampleText:
            '• ডেলিভারি ফি: {{fee}} KD\n• ফ্রি উপরে: {{freeAbove}} KD\n\nঅর্ডার {{freeAbove}} KD বা তার বেশি হলে ডেলিভারি ফ্রি\nকম হলে {{fee}} KD যোগ হবে',
          saveButton: '💾 সেটিংস সংরক্ষণ',
          valuesPositive: 'মান অবশ্যই ধনাত্মক হতে হবে',
          saved: 'সেটিংস সফলভাবে সংরক্ষণ হয়েছে',
          saveFailed: 'সেটিংস সংরক্ষণ ব্যর্থ: {{error}}',
        },
        orderDetails: {
          title: 'অর্ডার বিস্তারিত',
          customerInfo: 'গ্রাহকের তথ্য',
          deliveryInfo: 'ডেলিভারি তথ্য',
          items: 'পণ্যসমূহ',
          payment: 'পেমেন্ট',
          deliveryLabel: 'ডেলিভারি',
          whatsapp: 'হোয়াটসঅ্যাপ',
          sendToAdmin: '📱 অ্যাডমিনকে পাঠান',
          sendToCustomer: '📱 গ্রাহককে পাঠান',
          updateStatus: 'স্ট্যাটাস আপডেট',
          updateStatusConfirm: 'স্ট্যাটাস "{{status}}" এ আপডেট করবেন?',
          update: 'আপডেট',
          updated: 'সফলভাবে আপডেট হয়েছে',
          updateFailed: 'অর্ডারের স্ট্যাটাস আপডেট ব্যর্থ',
          paymentMethod: 'পেমেন্ট পদ্ধতি:',
          cashOnDelivery: 'ডেলিভারিতে নগদ',
          kNet: 'K-Net',
          free: 'ফ্রি',
          nameLabel: 'নাম:',
          phoneLabel: 'ফোন:',
          emailLabel: 'ইমেইল:',
          notesLabel: 'নোট:',
          areaLabel: 'এলাকা:',
          blockLabel: 'ব্লক:',
          streetLabel: 'রাস্তা:',
          buildingLabel: 'বিল্ডিং:',
          floorLabel: 'তলা:',
          apartmentLabel: 'অ্যাপার্টমেন্ট:',
        },
      },
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
