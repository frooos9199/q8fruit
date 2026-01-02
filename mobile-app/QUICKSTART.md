# دليل التشغيل السريع - تطبيق فكهاني الكويت 🍎

## ✅ الملفات المطلوبة تم إنشاؤها:
- ✅ `src/config/firebase.ts` - إعدادات Firebase
- ✅ `src/navigation/MainNavigator.tsx` - نظام التنقل
- ✅ `assets/` - مجلد الأيقونات والصور
- ✅ `start.sh` - سكريبت تشغيل سريع

## ⚠️ خطوات قبل التشغيل:

### 1. إضافة الأيقونات والصور
يجب إضافة الملفات التالية في مجلد `assets/`:
- `icon.png` (1024x1024)
- `splash.png` (2048x2048)
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (48x48)

**استخدم هذا الموقع لإنشائها تلقائياً:** https://appicon.co/

### 2. تثبيت Expo CLI (إذا لم يكن مثبتاً)
```bash
npm install -g expo-cli
```

### 3. تثبيت الاعتماديات
```bash
cd mobile-app
npm install
```

## 🚀 طرق التشغيل:

### الطريقة السهلة (باستخدام السكريبت):
```bash
./start.sh
```

### الطريقة اليدوية:

#### تشغيل عام (QR Code):
```bash
npm start
```
ثم امسح QR code بتطبيق **Expo Go** على هاتفك

#### Android:
```bash
npm run android
```

#### iOS (macOS فقط):
```bash
npm run ios
```

#### Web/متصفح:
```bash
npm run web
```

## 📱 تثبيت Expo Go على هاتفك:
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS**: https://apps.apple.com/app/expo-go/id982107779

## 🔧 حل المشاكل الشائعة:

### خطأ "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### خطأ في الأيقونات
أضف الأيقونات في مجلد `assets/` أو استخدم أيقونات مؤقتة

### خطأ في Firebase
تأكد من صحة إعدادات Firebase في `src/config/firebase.ts`

## 📊 الحالة الحالية:
- ✅ الهيكل الأساسي جاهز
- ✅ Firebase متصل
- ✅ نظام التنقل جاهز
- ⚠️ الأيقونات تحتاج إضافة
- ⚠️ الشاشات الرئيسية قيد التطوير

## 🎯 الخطوات التالية:
1. إضافة الأيقونات في مجلد `assets/`
2. تشغيل التطبيق بـ `npm start` أو `./start.sh`
3. اختبار على الهاتف أو المحاكي
4. تطوير الشاشات والميزات

## 📞 معلومات التطبيق:
- **الاسم**: فكهاني الكويت
- **Bundle ID (iOS)**: com.Fruitq8.summitkw
- **Package (Android)**: com.fruitq8.summitkw
- **Apple ID**: 1487406440

---
تم إنشاؤها في: 1 يناير 2026
