# 📱 FruitQ8 Mobile - تطبيق فكهاني الكويت

تطبيق جوال متكامل لبيع الفواكه والخضار الطازجة في الكويت

---

## 🚀 البدء السريع

### المتطلبات:
- Node.js 18+
- React Native CLI
- Android Studio (للأندرويد)
- Xcode (للـ iOS)

### التثبيت والتشغيل:
```bash
# تثبيت المكتبات
npm install

# تشغيل على أندرويد
npm run android

# تشغيل على iOS
npm run ios
```

---

## ✅ آخر التحديثات (v2.0.8)

### 🔧 إصلاح مشكلة الكراش عند تغيير صورة المنتج
تم إصلاح المشكلة بالكامل! راجع الملفات التالية للتفاصيل:
- 📄 `FIX_SUMMARY.md` - ملخص الإصلاحات
- 📄 `QUICK_FIX_GUIDE.md` - دليل التطبيق السريع
- 📄 `TESTING_CHECKLIST.md` - قائمة الاختبار

### التحسينات الرئيسية:
- ✅ معالجة أفضل للأخطاء
- ✅ تحسين إدارة الذاكرة
- ✅ ضغط تلقائي للصور
- ✅ حماية البيانات من الفقدان

---

## 🎯 المميزات

### للمستخدمين:
- 🛒 تصفح المنتجات حسب الفئات
- 🛍️ سلة مشتريات ذكية
- 💳 طرق دفع متعددة (كاش، كي نت)
- 🚚 تتبع الطلبات
- 🎫 أكواد الخصم
- 🌐 دعم اللغتين (عربي/إنجليزي)
- 🌙 الوضع الليلي

### للمسؤولين:
- 📊 لوحة تحكم شاملة
- 📦 إدارة المنتجات
- 🛍️ إدارة الطلبات
- 👥 إدارة المستخدمين
- ⚙️ إعدادات التوصيل
- 🔔 الإشعارات

---

## 🏗️ البنية التقنية

### التقنيات المستخدمة:
- **React Native** 0.73.6
- **TypeScript** 5.0.4
- **Firebase** 12.6.0
  - Firestore (قاعدة البيانات)
  - Storage (تخزين الصور)
  - Auth (المصادقة)
- **React Navigation** 6.x
- **i18next** (الترجمة)
- **React Native Image Picker** 8.2.1

### هيكل المشروع:
```
FruitQ8Mobile/
├── src/
│   ├── components/      # المكونات المشتركة
│   ├── screens/         # شاشات التطبيق
│   ├── services/        # خدمات Firebase
│   ├── navigation/      # التنقل
│   ├── constants/       # الثوابت
│   ├── locales/         # ملفات الترجمة
│   └── types/           # أنواع TypeScript
├── android/             # مشروع أندرويد
├── ios/                 # مشروع iOS
└── docs/                # التوثيق
```

---

## 🔧 الأوامر المتاحة

### التطوير:
```bash
npm start              # تشغيل Metro bundler
npm run android        # تشغيل على أندرويد
npm run ios            # تشغيل على iOS
npm run lint           # فحص الكود
```

### الصيانة:
```bash
npm run clean          # تنظيف شامل
npm run clean:metro    # تنظيف Metro cache
npm run kill-metro     # إيقاف Metro
npm run reset          # إعادة تعيين كاملة
./rebuild.sh           # إعادة بناء التطبيق
```

---

## 🐛 استكشاف الأخطاء

### مشكلة الكراش عند تغيير الصور:
✅ **تم الإصلاح!** راجع `QUICK_FIX_GUIDE.md`

### مشاكل شائعة أخرى:

#### 1. Metro bundler لا يعمل:
```bash
npm run kill-metro
npm run clean:metro
npm start
```

#### 2. مشاكل في البناء:
```bash
./rebuild.sh
```

#### 3. مشاكل في الصلاحيات:
- إعدادات → التطبيقات → FruitQ8
- منح جميع الصلاحيات المطلوبة

#### 4. عرض Logs:
```bash
npx react-native log-android  # أندرويد
npx react-native log-ios       # iOS
```

---

## 📱 متطلبات النظام

### للتطوير:
- **macOS** (للـ iOS)
- **Windows/Linux/macOS** (للأندرويد)
- **Node.js** 18+
- **npm** أو **yarn**
- **Android Studio** 2023+
- **Xcode** 14+ (للـ iOS)

### للتشغيل:
- **Android** 6.0+ (API 23+)
- **iOS** 13.0+

---

## 🔐 الأمان

### الصلاحيات المطلوبة:
- ✅ INTERNET - للاتصال بالإنترنت
- ✅ CAMERA - لالتقاط الصور
- ✅ READ_EXTERNAL_STORAGE - لقراءة الصور
- ✅ WRITE_EXTERNAL_STORAGE - لحفظ الصور
- ✅ READ_MEDIA_IMAGES - لقراءة الصور (Android 13+)

### Firebase Security Rules:
راجع Firebase Console للقواعد الأمنية

---

## 📚 التوثيق

### ملفات التوثيق:
- 📄 `FIX_SUMMARY.md` - ملخص الإصلاحات
- 📄 `QUICK_FIX_GUIDE.md` - دليل الإصلاحات السريع
- 📄 `FIXES.md` - تفاصيل الإصلاحات
- 📄 `TESTING_CHECKLIST.md` - قائمة الاختبار

### روابط مفيدة:
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)

---

## 🧪 الاختبار

### اختبار يدوي:
راجع `TESTING_CHECKLIST.md` للاختبارات الشاملة

### اختبار تلقائي:
```bash
npm test
```

---

## 🚀 النشر

### بناء للإنتاج:

#### Android:
```bash
cd android
./gradlew assembleRelease
```

#### iOS:
```bash
cd ios
xcodebuild -workspace FruitQ8Mobile.xcworkspace \
  -scheme FruitQ8Mobile \
  -configuration Release
```

---

## 📞 الدعم والتواصل

### للدعم الفني:
- 📱 واتساب: [+965 98899426](https://wa.me/96598899426)
- 📧 البريد: [قريباً]

### المطور:
- 👨💻 **NexDev**
- 🌐 الموقع: [nexdev-portfolio-one.vercel.app](https://nexdev-portfolio-one.vercel.app)

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2025 فكهاني الكويت

---

## 🙏 شكر وتقدير

شكراً لاستخدام تطبيق فكهاني الكويت!

نحن نعمل باستمرار على تحسين التطبيق وإضافة مميزات جديدة.

---

**الإصدار الحالي:** 2.0.8  
**آخر تحديث:** 2025  
**الحالة:** ✅ مستقر وجاهز للاستخدام
