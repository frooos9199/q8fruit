import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // محاولة قراءة المنتجات من ملف JSON مؤقت
    const dataPath = path.join(process.cwd(), 'data', 'products.json');
    
    try {
      if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const products = JSON.parse(fileContent);
        return NextResponse.json(products);
      }
    } catch (fileError) {
      console.log('لا يوجد ملف منتجات محفوظ');
    }
    
    // إذا لم يوجد ملف، نرجع منتجات افتراضية للتجربة
    const defaultProducts = [
      {
        id: 1,
        name: "تفاح أحمر",
        nameAr: "تفاح أحمر",
        units: [
          { name: "كيلو", price: 2.500 },
          { name: "حبة", price: 0.250 }
        ],
        category: "فواكه",
        categories: ["فواكه"],
        active: true,
        image: null,
        hasOffer: false,
        discount: 0
      },
      {
        id: 2,
        name: "موز",
        nameAr: "موز",
        units: [
          { name: "كيلو", price: 1.750 }
        ],
        category: "فواكه", 
        categories: ["فواكه"],
        active: true,
        image: null,
        hasOffer: true,
        discount: 15
      }
    ];
    
    return NextResponse.json(defaultProducts);
    
  } catch (error) {
    console.error('خطأ في API المنتجات:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب المنتجات' },
      { status: 500 }
    );
  }
}

// API لحفظ المنتجات (من لوحة الإدارة)
export async function POST(request: Request) {
  try {
    const products = await request.json();
    
    // إنشاء مجلد data إذا لم يكن موجود
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // حفظ المنتجات في ملف JSON
    const dataPath = path.join(dataDir, 'products.json');
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
    
    return NextResponse.json({ success: true, count: products.length });
    
  } catch (error) {
    console.error('خطأ في حفظ المنتجات:', error);
    return NextResponse.json(
      { error: 'خطأ في حفظ المنتجات' },
      { status: 500 }
    );
  }
}