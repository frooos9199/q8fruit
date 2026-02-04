import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { validatePromoCode, type PromoCode } from '@/lib/promo';

export async function POST(request: NextRequest) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code || !orderTotal) {
      return NextResponse.json(
        { valid: false, message: 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }

    // Fetch promo code from Firestore
    const promoCodesRef = collection(db, 'promoCodes');
    const q = query(promoCodesRef, where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { valid: false, message: 'كود خصم غير صحيح' },
        { status: 404 }
      );
    }

    const promoDoc = snapshot.docs[0];
    const promoCode = {
      id: promoDoc.id,
      ...promoDoc.data(),
    } as PromoCode;

    // Validate promo code
    const validation = validatePromoCode(promoCode, orderTotal);

    if (validation.valid) {
      return NextResponse.json({
        valid: true,
        discount: validation.discount,
        code: promoCode.code,
        type: promoCode.type,
        description: promoCode.descriptionAr || promoCode.description,
      });
    } else {
      return NextResponse.json({
        valid: false,
        message: validation.message,
      });
    }
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { valid: false, message: 'حدث خطأ، حاول مرة أخرى' },
      { status: 500 }
    );
  }
}
