#!/bin/bash

echo "🚀 بناء التطبيق للنشر في Google Play Store"
echo "================================================"
echo ""

# الانتقال لمجلد المشروع
cd "$(dirname "$0")"

VERSION_NAME=$(node -p "require('./package.json').version" 2>/dev/null || echo "")
VERSION_CODE=$(grep -E "^[[:space:]]*versionCode[[:space:]]+[0-9]+" -m 1 android/app/build.gradle 2>/dev/null | awk '{print $2}')

echo "📦 الإصدار: ${VERSION_NAME:-unknown}"
echo "🔢 Version Code: ${VERSION_CODE:-unknown}"
echo ""

# تنظيف البناء السابق
echo "🧹 تنظيف البناء السابق..."
cd android
./gradlew clean
cd ..

echo ""
echo "🔨 بناء Android App Bundle (AAB)..."
cd android
./gradlew bundleRelease

echo ""
echo "✅ تم البناء بنجاح!"
echo ""
echo "📁 ملف AAB موجود في:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📋 معلومات الملف:"
ls -lh app/build/outputs/bundle/release/app-release.aab 2>/dev/null || echo "   (سيظهر بعد اكتمال البناء)"
echo ""
echo "🎯 الخطوات التالية:"
echo "   1. افتح Google Play Console"
echo "   2. اذهب لـ Production > Create new release"
echo "   3. ارفع ملف app-release.aab"
echo "   4. أكمل معلومات الإصدار"
echo ""
echo "✨ جاهز للنشر!"
