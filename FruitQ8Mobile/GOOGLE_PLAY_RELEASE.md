# 🚀 دليل النشر في Google Play Store

## 📦 معلومات الإصدار

```
اسم التطبيق: FruitQ8 Mobile
Package Name: com.fruitq8mobile
Version: 2.0.9
Version Code: 16
```

---

## 🔨 بناء التطبيق للنشر

### الطريقة السريعة:
```bash
cd /Users/mac/Documents/GitHub/fruitq8/FruitQ8Mobile
./build-release.sh
```

### الطريقة اليدوية:
```bash
cd /Users/mac/Documents/GitHub/fruitq8/FruitQ8Mobile
cd android
./gradlew clean
./gradlew bundleRelease
```

---

## 📁 موقع الملف

بعد البناء، الملف موجود في:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## ✅ قائمة التحقق قبل الرفع

### 1️⃣ الإعدادات الأساسية:
- [x] Version Code: 16
- [x] Version Name: 2.0.9
- [x] دعم 16KB page size ✅
- [x] Signing Config جاهز ✅
- [x] Proguard مفعّل ✅

### 2️⃣ الصلاحيات:
- [x] INTERNET
- [x] CAMERA
- [x] READ_EXTERNAL_STORAGE
- [x] WRITE_EXTERNAL_STORAGE
- [x] READ_MEDIA_IMAGES

### 3️⃣ الأيقونات:
- [ ] تأكد من وجود أيقونة التطبيق
- [ ] تأكد من جودة الأيقونة

### 4️⃣ الاختبار:
- [ ] اختبر التطبيق على جهاز حقيقي
- [ ] تأكد من عمل جميع المميزات
- [ ] تأكد من عدم وجود crashes

---

## 🎯 خطوات الرفع في Google Play Console

### 1. افتح Google Play Console
```
https://play.google.com/console
```

### 2. اختر التطبيق
- اذهب لـ "All apps"
- اختر "FruitQ8 Mobile"

### 3. إنشاء إصدار جديد
- اذهب لـ "Production" أو "Testing"
- اضغط "Create new release"

### 4. رفع الملف
- اضغط "Upload"
- اختر ملف `app-release.aab`
- انتظر حتى يكتمل الرفع

### 5. معلومات الإصدار
```
Release name: 2.0.9
Release notes (Arabic):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 الإصدار 2.0.9 - تحديثات جديدة

✨ ميزات جديدة:
• إضافة وصف تفصيلي للمنتجات مع أيقونة معلومات احترافية
• حفظ تلقائي لعنوان التوصيل - لا حاجة لإدخاله في كل مرة

🔧 إصلاحات:
• إصلاح مشكلة الكراش عند تغيير صورة المنتج
• تحسين أداء رفع الصور
• دعم Android 15 مع 16KB page size

⚡ تحسينات:
• تحسين سرعة التطبيق
• تحسين استخدام الذاكرة
• واجهة أكثر سلاسة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Release notes (English):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Version 2.0.9 - New Updates

✨ New Features:
• Product descriptions with professional info icon
• Auto-save delivery address - no need to enter every time

🔧 Fixes:
• Fixed crash when changing product images
• Improved image upload performance
• Android 15 support with 16KB page size

⚡ Improvements:
• Faster app performance
• Better memory usage
• Smoother UI experience
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6. المراجعة والنشر
- راجع جميع المعلومات
- اضغط "Review release"
- اضغط "Start rollout to Production"

---

## 📊 معلومات إضافية

### حجم التطبيق المتوقع:
```
AAB: ~15-25 MB
APK (بعد التحويل): ~20-30 MB
```

### الأجهزة المدعومة:
```
Android 6.0+ (API 23+)
ARM, ARM64, x86, x86_64
```

### دعم 16KB Page Size:
```
✅ مدعوم بالكامل
✅ جاهز لمتطلبات Google Play 2025
```

---

## 🐛 استكشاف الأخطاء

### خطأ: "Keystore not found"
```bash
# تأكد من وجود ملف الـ keystore
ls android/app/fruitq8-release-key.keystore
```

### خطأ: "Build failed"
```bash
# نظف وأعد البناء
cd android
./gradlew clean
./gradlew bundleRelease
```

### خطأ: "16KB page size not supported"
```
✅ تم الإصلاح! الإعدادات موجودة في:
- gradle.properties
- AndroidManifest.xml
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
- واتساب: +965 98899426
- المطور: NexDev

---

## 🎉 بعد النشر

### تتبع الأداء:
- راقب التقييمات والمراجعات
- تابع التقارير في Play Console
- راقب Crashes & ANRs

### التحديثات القادمة:
- خطط للتحديثات المستقبلية
- استمع لملاحظات المستخدمين
- حسّن التطبيق باستمرار

---

**الإصدار:** 2.0.9  
**Version Code:** 16  
**التاريخ:** 2025  
**الحالة:** ✅ جاهز للنشر
