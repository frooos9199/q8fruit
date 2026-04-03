# 🚀 دليل رفع التطبيق على Google Play

## ✅ تم الإنجاز

التطبيق جاهز للرفع على Google Play Console!

---

## 📦 الملفات المهمة

### 1️⃣ ملف AAB للرفع
```
📍 المسار: android/app/build/outputs/bundle/release/app-release.aab
📊 الحجم: 23 MB
✅ موقّع ومجهز للنشر
```

### 2️⃣ ملف Keystore (احفظه بأمان!)
```
📍 المسار: android/app/fruitq8-release-key.keystore
🔐 Store Password: fruitq8store2024
🔑 Key Alias: fruitq8-key-alias
```

**⚠️ هام جداً:** 
- احفظ ملف keystore في مكان آمن
- لا ترفعه على Git أبداً
- ستحتاجه لكل تحديث مستقبلي
- فقدانه = لن تستطيع تحديث التطبيق!

---

## 📱 معلومات التطبيق

- **اسم الحزمة:** com.fruitq8mobile
- **رقم الإصدار:** 2.0.9
- **كود الإصدار:** 10
- **الحد الأدنى لـ SDK:** 24 (Android 7.0)
- **الحد الأقصى لـ SDK:** 34 (Android 14)

---

## 🔧 خطوات الرفع على Google Play

### الخطوة 1: إنشاء حساب المطور
1. اذهب إلى [Google Play Console](https://play.google.com/console)
2. ادفع رسوم التسجيل لمرة واحدة ($25)
3. أكمل ملف المطور

### الخطوة 2: إنشاء تطبيق جديد
1. اضغط "Create app"
2. اختر اسم التطبيق: **FruitQ8**
3. اللغة الافتراضية: **English**
4. نوع التطبيق: **App**
5. مجاني أم مدفوع: **Free**

### الخطوة 3: إكمال بطاقة التطبيق
املأ المعلومات المطلوبة:

#### 📝 App details
- **App name:** FruitQ8
- **Short description:** Fresh fruits and vegetables delivery in Kuwait
- **Full description:**
```
FruitQ8 is your premier online destination for fresh fruits and vegetables in Kuwait. 
Browse our wide selection of farm-fresh produce, place orders easily, and enjoy fast 
home delivery. We bring the freshest fruits and vegetables right to your doorstep!

Features:
✓ Wide variety of fresh fruits and vegetables
✓ Easy browsing and ordering
✓ Secure payment options
✓ Fast home delivery
✓ Real-time order tracking
✓ Special offers and discounts

Order now and enjoy the freshest produce in Kuwait!
```

#### 📸 Graphics
يجب توفير:
- **App icon:** 512 x 512 px (PNG)
- **Feature graphic:** 1024 x 500 px
- **Screenshots:** على الأقل 2 (هاتف)
  - 16:9 أو 9:16
  - JPEG أو PNG
  - الحد الأدنى: 320px
  - الحد الأقصى: 3840px

#### 🏷️ Categorization
- **App category:** Shopping
- **Tags:** fruits, vegetables, grocery, delivery, kuwait, fresh, organic

#### 📧 Contact details
- **Email:** support@fruitq8.com (أو بريدك)
- **Phone:** +965XXXXXXXX
- **Website:** https://www.fruitq8.com (إذا كان متوفر)

### الخطوة 4: إعدادات المحتوى
1. **Privacy Policy:** مطلوب! رابط سياسة الخصوصية
2. **Target audience:** Everyone
3. **Content rating:** املأ الاستبيان
4. **Ads:** حدد إذا كان يحتوي على إعلانات

### الخطوة 5: رفع AAB
1. اذهب إلى **Production** → **Create new release**
2. اضغط **Upload** واختر الملف:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```
3. أضف ملاحظات الإصدار:
```
Initial release of FruitQ8 app

Features:
- Browse fresh fruits and vegetables
- Easy ordering system
- Multiple payment options
- Order tracking
- Arabic and English support
```

### الخطوة 6: المراجعة والنشر
1. راجع جميع المعلومات
2. اضغط **Start rollout to Production**
3. انتظر المراجعة (عادة 1-3 أيام)

---

## 🔄 التحديثات المستقبلية

عند إصدار تحديث جديد:

### 1. حدّث الإصدار في build.gradle:
```gradle
versionCode 11  // زد بمقدار 1
versionName "2.1.0"  // حدث حسب التغييرات
```

### 2. ابنِ AAB جديد:
```bash
cd android
./gradlew bundleRelease
```

### 3. ارفع على Google Play:
- اذهب لـ Production → Create new release
- ارفع AAB الجديد
- أضف ملاحظات التحديث
- Submit

---

## 🛠️ أوامر مفيدة

### بناء AAB للنشر:
```bash
cd android
./gradlew bundleRelease
```

### بناء APK للاختبار:
```bash
cd android
./gradlew assembleRelease
```

### التحقق من التوقيع:
```bash
keytool -list -v -keystore android/app/fruitq8-release-key.keystore
```

### فحص AAB:
```bash
bundletool build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab --output=app.apks --mode=universal
```

---

## ✅ قائمة التحقق النهائية

قبل الرفع، تأكد من:

- [ ] اختبرت التطبيق بالكامل
- [ ] جميع الميزات تعمل بشكل صحيح
- [ ] لا توجد أخطاء أو crashes
- [ ] التطبيق يعمل على أجهزة مختلفة
- [ ] الترجمة العربية والإنجليزية صحيحة
- [ ] الصور والأيقونات بجودة عالية
- [ ] معلومات الاتصال صحيحة
- [ ] سياسة الخصوصية جاهزة
- [ ] لقطات الشاشة محدثة
- [ ] الوصف واضح وجذاب
- [ ] تم حفظ keystore في مكان آمن

---

## 🆘 حل المشاكل الشائعة

### مشكلة: رفض Google Play التطبيق
**الحل:** راجع البريد الإلكتروني لمعرفة السبب، عادة:
- سياسة الخصوصية مفقودة
- معلومات غير كاملة
- محتوى مخالف للسياسات

### مشكلة: خطأ في التوقيع
**الحل:** تأكد من:
- استخدام keystore الصحيح
- كلمات المرور صحيحة
- صلاحيات ملف keystore

### مشكلة: AAB كبير جداً
**الحل:**
- فعّل code shrinking
- فعّل resource shrinking
- استخدم ProGuard/R8

---

## 📞 الدعم

للمساعدة:
- راجع [Android Developers](https://developer.android.com/distribute/console)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## 🎉 تهانينا!

تطبيقك جاهز للنشر! 
بالتوفيق في رحلتك على Google Play Store! 🚀

---

**آخر تحديث:** 5 فبراير 2026
**الإصدار:** 2.0.9 (10)
**الحالة:** ✅ جاهز للنشر
