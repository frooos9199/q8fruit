#!/bin/bash

echo "🔧 بدء إعادة بناء التطبيق بعد الإصلاحات..."
echo ""

# إيقاف Metro bundler إذا كان يعمل
echo "⏹️  إيقاف Metro bundler..."
npm run kill-metro 2>/dev/null || true

# تنظيف Metro cache
echo "🧹 تنظيف Metro cache..."
npm run clean:metro

# تنظيف build folders
echo "🧹 تنظيف build folders..."
cd android
./gradlew clean
cd ..

# إعادة بناء التطبيق
echo "🔨 إعادة بناء التطبيق..."
cd android
./gradlew assembleDebug
cd ..

echo ""
echo "✅ تم إعادة البناء بنجاح!"
echo ""
echo "📱 لتشغيل التطبيق:"
echo "   npm run android"
echo ""
echo "📋 لعرض logs:"
echo "   npx react-native log-android"
echo ""
