import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // في بيئة الإنتاج، نعتمد على Firebase فقط
    // هذا API للتطبيق الموبايل فقط
    return NextResponse.json({
      message: 'استخدم Firebase للحصول على المنتجات',
      products: []
    });
    
  } catch (error) {
    console.error('خطأ في API المنتجات:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب المنتجات' },
      { status: 500 }
    );
  }
}

// API لحفظ المنتجات (تأكيد فقط - البيانات في Firebase)
export async function POST(request: Request) {
  try {
    const products = await request.json();
    
    // في بيئة الإنتاج، لا نحفظ في نظام الملفات
    // البيانات محفوظة في Firebase
    console.log(`تم استلام ${products.length} منتج للحفظ`);
    
    return NextResponse.json({ 
      success: true, 
      count: products.length,
      message: 'البيانات محفوظة في Firebase'
    });
    
  } catch (error) {
    console.error('خطأ في معالجة المنتجات:', error);
    return NextResponse.json(
      { error: 'خطأ في معالجة المنتجات' },
      { status: 500 }
    );
  }
}