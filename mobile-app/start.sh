#!/bin/bash

echo "🚀 بدء تشغيل تطبيق فكهاني الكويت..."
echo ""

# التحقق من وجود Expo CLI
if ! command -v expo &> /dev/null
then
    echo "⚠️  Expo CLI غير مثبت"
    echo "📦 جاري التثبيت..."
    npm install -g expo-cli
fi

# التحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 جاري تثبيت الاعتماديات..."
    npm install
fi

echo ""
echo "✅ جاهز للتشغيل!"
echo ""
echo "اختر طريقة التشغيل:"
echo "1. الكل (QR Code)"
echo "2. Android"
echo "3. iOS"
echo "4. Web"
echo ""
read -p "أدخل رقم الخيار (1-4): " choice

case $choice in
    1)
        echo "🎯 تشغيل Expo..."
        npm start
        ;;
    2)
        echo "🤖 تشغيل على Android..."
        npm run android
        ;;
    3)
        echo "🍎 تشغيل على iOS..."
        npm run ios
        ;;
    4)
        echo "🌐 تشغيل على المتصفح..."
        npm run web
        ;;
    *)
        echo "❌ خيار غير صحيح"
        ;;
esac
