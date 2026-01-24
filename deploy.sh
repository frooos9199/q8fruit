#!/bin/bash

# 🚀 سكريبت رفع التحديثات إلى الموقع المنشور

echo "🔍 التحقق من التغييرات..."
git status

echo ""
echo "📦 التحديثات المحلية:"
echo "  ✅ زر واتساب في الفوتر"
echo "  ✅ إصلاحات جدول المنتجات"
echo "  ✅ تحسينات الفواتير"
echo "  ✅ تحديث README"
echo ""

read -p "هل تريد رفع جميع التحديثات؟ (y/n): " answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo ""
    echo "📤 جاري رفع التحديثات..."
    
    # إضافة الملفات المهمة فقط
    git add src/app/page.tsx
    git add src/app/admin/products/ProductTable.tsx
    git add src/app/invoices/page.tsx
    git add README.md
    git add package.json
    git add package-lock.json
    
    # عمل commit
    git commit -m "feat: إضافة زر واتساب وإصلاحات متنوعة

- إضافة زر واتساب مباشر في الفوتر
- إصلاح أخطاء JSX في جدول المنتجات
- تحسينات في صفحة الفواتير
- تحديث README بمعلومات شاملة"
    
    # رفع للـ repository
    git push origin main
    
    echo ""
    echo "✅ تم رفع التحديثات بنجاح!"
    echo ""
    echo "⏳ جاري النشر التلقائي على Vercel..."
    echo "🌐 الموقع: https://www.q8fruit.com"
    echo ""
    echo "⏱️  الوقت المتوقع: 2-3 دقائق"
    echo ""
    echo "🔗 تابع حالة النشر على:"
    echo "   https://vercel.com/dashboard"
    
else
    echo ""
    echo "❌ تم الإلغاء"
    echo ""
    echo "💡 لرفع ملفات محددة:"
    echo "   git add <file>"
    echo "   git commit -m 'message'"
    echo "   git push origin main"
fi
