# 🔗 دليل ربط المنتجات مع الموقع المنشور

## الخطوات المطلوبة:

### 1. إضافة المنتجات محلياً
- افتح: `http://localhost:3000/add-fruit-products.html`
- اضغط "إضافة جميع منتجات الفواكه"
- تأكد من ظهور المنتجات

### 2. ربط مع Firebase
- افتح: `http://localhost:3000/sync-to-firebase.html`
- أدخل إعدادات Firebase الخاصة بالموقع المنشور:
  ```
  API Key: من Firebase Console
  Auth Domain: your-project.firebaseapp.com
  Project ID: your-project-id
  Storage Bucket: your-project.appspot.com
  Messaging Sender ID: من Firebase Console
  App ID: من Firebase Console
  ```

### 3. رفع المنتجات
- اضغط "حفظ الإعدادات"
- اضغط "رفع المنتجات إلى Firebase"
- انتظر رسالة النجاح

### 4. التحقق من الموقع المنشور
- اذهب إلى موقعك المنشور
- تحقق من ظهور المنتجات في الصفحة الرئيسية
- تحقق من لوحة الإدارة

## ملاحظات مهمة:

✅ **المنتجات المضافة:**
- 10 منتجات فواكه مع صور حقيقية
- أسعار واقعية بالدينار الكويتي
- وحدات متعددة (كيلو، حبة، علبة، إلخ)
- كميات متنوعة

✅ **الصور:**
- جميع الصور من Unsplash عالية الجودة
- مقاس 400x400 بكسل
- تحميل سريع ومحسن

✅ **البيانات:**
- متوافقة مع هيكل قاعدة البيانات
- معرفات فريدة لكل منتج
- حقول كاملة (اسم، فئة، أسعار، كمية، حالة)

## استكشاف الأخطاء:

❌ **إذا لم تظهر المنتجات:**
1. تحقق من إعدادات Firebase
2. تحقق من قواعد Firestore Security Rules
3. تحقق من Console للأخطاء

❌ **إذا فشل الرفع:**
1. تأكد من صحة إعدادات Firebase
2. تحقق من أذونات قاعدة البيانات
3. تحقق من اتصال الإنترنت

## قواعد Firestore المطلوبة:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document} {
      allow read, write: if true;
    }
    match /categories/{document} {
      allow read, write: if true;
    }
  }
}
```

## الملفات المطلوبة:

1. `add-fruit-products.html` - إضافة المنتجات محلياً
2. `sync-to-firebase.html` - ربط مع Firebase
3. هذا الملف للتعليمات

## بعد الانتهاء:

- احذف هذه الملفات من المجلد العام للأمان
- أو انقلها إلى مجلد منفصل
- تأكد من عدم تعرض إعدادات Firebase