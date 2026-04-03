/**
 * سياسة البيانات الحالية:
 * - Firebase هو المصدر المعتمد للقراءة عند تحميل بيانات المتجر.
 * - localStorage يستخدم ككاش محلي لتحسين الاستجابة فقط.
 * - يمنع استخدام المزامنة الشاملة لتمرير المنتجات والطلبات من localStorage تلقائياً.
 * - أي كتابة حساسة يجب أن تكون بدوال مخصصة لكل نطاق بيانات.
 */

export const FIREBASE_POLICY = {
  READ_FROM_FIREBASE: true,
  WRITE_TO_FIREBASE: true,
  EMERGENCY_LOAD_ONLY: false,
  LOCAL_STORAGE_IS_CACHE: true,
  ALLOW_BULK_PRODUCT_SYNC: false,
  ALLOW_BULK_ORDER_SYNC: false,
} as const;

console.log('🔒 Firebase Policy: Firebase source with local cache and scoped writes only');