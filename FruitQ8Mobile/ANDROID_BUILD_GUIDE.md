# تشغيل تطبيق الأندرويد - FruitQ8Mobile

## حالة المشروع

تم تحديث إعدادات البناء بنجاح:
- **versionCode**: 10
- **versionName**: "2.0.9"
- **compileSdk**: 34
- **targetSdk**: 34
- **NDK**: 25.1.8937393

## المشكلة المواجهة

واجهنا مشكلة مع مكتبة `react-native-gesture-handler` في بناء CMake. المشكلة:
```
CMake Error: Target "gesturehandler" links to target "ReactAndroid::reactnative" but the target was not found.
```

## الحلول الممكنة

### الحل 1: استخدام Expo أو EAS Build
نوصي باستخدام EAS Build لبناء التطبيق للنشر:

```bash
# تثبيت EAS CLI
npm install -g eas-cli

# تسجيل الدخول
eas login

# بناء للأندرويد
eas build --platform android
```

### الحل 2: تحديث React Native
يمكن تحديث React Native إلى إصدار أحدث (0.74 أو 0.75) لحل المشكلة:

```bash
npx react-native upgrade
```

### الحل 3: البناء باستخدام Android Studio
1. افتح المشروع في Android Studio
2. افتح مجلد `/android`
3. انتظر Gradle sync
4. اختر Build > Generate Signed Bundle / APK
5. اختبر APK أو AAB
6. اتبع التعليمات لإنشاء keystore (إذا لم يكن موجوداً)

### الحل 4: استخدام keystore موقع
إذا كان لديك keystore للتوقيع:

1. أنشئ ملف `android/gradle.properties` وأضف:
```properties
MYAPP_UPLOAD_STORE_FILE=your-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=your-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your-store-password
MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
```

2. عدل `android/app/build.gradle`:
```groovy
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}
```

## ملفات مهمة تم تحديثها

1. `/android/build.gradle` - إعدادات SDK و NDK
2. `/android/app/build.gradle` - versionCode و versionName
3. `/android/settings.gradle` - إعدادات Gradle
4. `/android/gradle/wrapper/gradle-wrapper.properties` - إصدار Gradle

## الخطوات التالية

1. **اختبار التطبيق محلياً** (للتطوير فقط):
```bash
cd FruitQ8Mobile
npm run android
```

2. **إنشاء keystore للإنتاج**:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore fruitq8-release-key.keystore -alias fruitq8-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

3. **رفع التطبيق إلى Google Play**:
   - قم ببناء AAB (Android App Bundle)
   - ارفعه إلى Google Play Console
   - املأ معلومات التطبيق
   - انشره

## الأوامر المفيدة

```bash
# تنظيف المشروع
cd android && ./gradlew clean

# بناء APK debug
cd android && ./gradlew assembleDebug

# بناء APK release
cd android && ./gradlew assembleRelease

# بناء AAB للنشر
cd android && ./gradlew bundleRelease

# تشغيل على جهاز متصل
npx react-native run-android
```

## ملاحظات مهمة

- ⚠️ لا تستخدم debug keystore للإنتاج
- ⚠️ احفظ keystore في مكان آمن (ستحتاجه للتحديثات)
- ⚠️ لا ترفع keystore إلى Git
- ✅ تم تحديث إصدار التطبيق إلى 2.0.9

## التحديثات المستقبلية

عند الحاجة لتحديث إصدار التطبيق:
1. زد `versionCode` بمقدار 1
2. حدث `versionName` حسب semantic versioning
3. أعد بناء التطبيق
4. ارفعه إلى Google Play

---
تاريخ آخر تحديث: 5 فبراير 2026
