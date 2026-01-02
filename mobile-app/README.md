# تطبيق فكهاني الكويت - الموبايل

هذا هو تطبيق الموبايل لمتجر فكهاني الكويت، مبني باستخدام React Native و Expo.

## متطلبات التشغيل

1. تثبيت Node.js (الإصدار 18 أو أحدث)
2. تثبيت Expo CLI:
```bash
npm install -g expo-cli
```

## التثبيت

```bash
cd mobile-app
npm install
```

## التشغيل

### على المحاكي/الهاتف
```bash
npm start
```

ثم اختر:
- اضغط `a` للتشغيل على Android
- اضغط `i` للتشغيل على iOS (macOS فقط)
- امسح QR code بتطبيق Expo Go على هاتفك

### تشغيل مباشر
```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # المتصفح
```

## البناء والنشر

### البناء
```bash
npm run build:android  # بناء Android
npm run build:ios      # بناء iOS
```

### الرفع للمتاجر
```bash
npm run submit:android  # رفع لـ Google Play
npm run submit:ios      # رفع لـ App Store
```

## الأيقونات والصور

يجب إضافة الملفات التالية في مجلد `assets/`:
- `icon.png` - أيقونة التطبيق (1024x1024)
- `splash.png` - شاشة البداية (2048x2048)
- `adaptive-icon.png` - أيقونة Android (1024x1024)
- `favicon.png` - أيقونة الويب (48x48)

### إنشاء الأيقونات
استخدم أحد المواقع التالية لإنشاء جميع الأيقونات تلقائياً:
- https://appicon.co/
- https://easyappicon.com/
- https://favicon.io/

## الهيكل

```
mobile-app/
├── App.tsx              # نقطة الدخول الرئيسية
├── app.json             # إعدادات Expo
├── package.json         # الاعتماديات
├── assets/              # الصور والأيقونات
└── src/
    ├── screens/         # شاشات التطبيق
    ├── navigation/      # إعدادات التنقل
    └── config/          # إعدادات Firebase وغيرها
```

## ملاحظات

- تأكد من تحديث معلومات Firebase في `src/config/firebase.ts`
- Bundle ID للـ iOS: `com.Fruitq8.summitkw`
- Package للـ Android: `com.fruitq8.summitkw`
- Apple ID: `1487406440`
