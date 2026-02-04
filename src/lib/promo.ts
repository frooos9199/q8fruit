// Promo Codes & Referral System

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number; // percentage or fixed amount
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  description?: string;
  descriptionAr?: string;
}

export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  usedBy: string[]; // user IDs who used this code
  totalReferrals: number;
  totalRewards: number;
  createdAt: Date;
}

export const REFERRAL_REWARD = 2; // KWD reward for both referrer and referee
export const MIN_ORDER_FOR_REFERRAL = 10; // KWD minimum order to use referral

export function generateReferralCode(userId: string): string {
  // Generate a unique 8-character code
  const prefix = 'Q8F';
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${random}`;
}

export function validatePromoCode(
  promoCode: PromoCode,
  orderTotal: number
): { valid: boolean; message?: string; discount?: number } {
  if (!promoCode.active) {
    return { valid: false, message: 'هذا الكود غير نشط' };
  }

  const now = new Date();
  if (now < new Date(promoCode.validFrom)) {
    return { valid: false, message: 'هذا الكود ليس ساري المفعول بعد' };
  }

  if (now > new Date(promoCode.validUntil)) {
    return { valid: false, message: 'هذا الكود منتهي الصلاحية' };
  }

  if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
    return { valid: false, message: 'تم استخدام هذا الكود بالكامل' };
  }

  if (promoCode.minOrderAmount && orderTotal < promoCode.minOrderAmount) {
    return {
      valid: false,
      message: `الحد الأدنى للطلب ${promoCode.minOrderAmount} د.ك`,
    };
  }

  let discount = 0;
  
  if (promoCode.type === 'percentage') {
    discount = (orderTotal * promoCode.value) / 100;
    if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
      discount = promoCode.maxDiscount;
    }
  } else if (promoCode.type === 'fixed') {
    discount = promoCode.value;
  } else if (promoCode.type === 'free_delivery') {
    discount = 0; // Will be handled separately in delivery calculation
  }

  return { valid: true, discount };
}

export function calculateDiscount(
  orderTotal: number,
  promoCode?: PromoCode,
  referralDiscount?: number
): {
  subtotal: number;
  promoDiscount: number;
  referralDiscount: number;
  total: number;
} {
  let promoDiscount = 0;
  
  if (promoCode) {
    const validation = validatePromoCode(promoCode, orderTotal);
    if (validation.valid && validation.discount) {
      promoDiscount = validation.discount;
    }
  }

  const totalDiscount = promoDiscount + (referralDiscount || 0);
  const total = Math.max(0, orderTotal - totalDiscount);

  return {
    subtotal: orderTotal,
    promoDiscount,
    referralDiscount: referralDiscount || 0,
    total,
  };
}

// Predefined promo codes for marketing campaigns
export const WELCOME_PROMO: Partial<PromoCode> = {
  code: 'WELCOME20',
  type: 'percentage',
  value: 20,
  maxDiscount: 5,
  minOrderAmount: 10,
  description: 'Welcome offer - 20% off your first order',
  descriptionAr: 'عرض الترحيب - خصم 20٪ على أول طلب',
};

export const FLASH_SALE: Partial<PromoCode> = {
  code: 'FLASH15',
  type: 'percentage',
  value: 15,
  maxDiscount: 10,
  minOrderAmount: 15,
  description: 'Flash Sale - 15% off',
  descriptionAr: 'عرض فلاش - خصم 15٪',
};

export const FREE_DELIVERY: Partial<PromoCode> = {
  code: 'FREEDEL',
  type: 'free_delivery',
  value: 0,
  minOrderAmount: 5,
  description: 'Free delivery on orders above 5 KWD',
  descriptionAr: 'توصيل مجاني للطلبات فوق 5 د.ك',
};
