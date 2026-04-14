import admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type CreateOrderItemInput = {
  productId?: string;
  name?: string;
  productName?: string;
  productNameAr?: string;
  unit?: string;
  quantity?: number;
  price?: number;
  total?: number;
  image?: string;
};

type FirestoreProductUnit = {
  name?: string;
  price?: number;
};

type FirestoreProductData = {
  name?: string;
  nameAr?: string;
  active?: boolean;
  isHidden?: boolean;
  image?: string;
  images?: string[];
  units?: FirestoreProductUnit[];
};

let firestoreSettingsApplied = false;

function normalizePhoneNumber(input: unknown) {
  if (typeof input !== 'string') return '';
  return input.trim();
}

function normalizeText(input: unknown) {
  if (typeof input !== 'string') return '';
  return input.trim();
}

function normalizeNumber(input: unknown) {
  const num = typeof input === 'string' ? Number(input) : (typeof input === 'number' ? input : NaN);
  return Number.isFinite(num) ? num : null;
}

function normalizeItems(input: unknown) {
  if (!Array.isArray(input)) return [] as any[];

  return input
    .map((raw: CreateOrderItemInput) => {
      const quantity = normalizeNumber(raw.quantity) ?? 0;
      const price = normalizeNumber(raw.price) ?? 0;
      const total = normalizeNumber(raw.total) ?? quantity * price;

      const productName = normalizeText(raw.productName) || normalizeText(raw.name);
      if (!productName) {
        return null;
      }

      const productId = normalizeText(raw.productId);
      const productNameAr = normalizeText(raw.productNameAr);
      const unit = normalizeText(raw.unit);
      const image = normalizeText(raw.image);

      return {
        ...(productId ? { productId } : {}),
        productName,
        ...(productNameAr ? { productNameAr } : {}),
        ...(unit ? { unit } : {}),
        quantity,
        price,
        total,
        ...(image ? { image } : {}),
      };
    })
    .filter(Boolean);
}

async function resolveOrderItemsPricing(
  firestore: admin.firestore.Firestore,
  items: ReturnType<typeof normalizeItems>
) {
  const resolvedItems = [] as any[];

  for (const item of items) {
    const productId = normalizeText(item?.productId);
    const requestedUnit = normalizeText(item?.unit);

    if (!productId) {
      resolvedItems.push(item);
      continue;
    }

    const productSnapshot = await firestore.collection('products').doc(productId).get();
    if (!productSnapshot.exists) {
      throw new Error(`المنتج غير موجود أو تم حذفه: ${item.productName}`);
    }

    const product = productSnapshot.data() as FirestoreProductData;
    if (product.active === false || product.isHidden === true) {
      throw new Error(`المنتج غير متاح حالياً: ${product.name || item.productName}`);
    }

    const units = Array.isArray(product.units) ? product.units : [];
    const matchedUnit = units.find((unit) => normalizeText(unit.name) === requestedUnit) ?? units[0];
    if (!matchedUnit) {
      throw new Error(`لا توجد وحدة صالحة للمنتج: ${product.name || item.productName}`);
    }

    const quantity = normalizeNumber(item.quantity) ?? 0;
    const price = normalizeNumber(matchedUnit.price) ?? 0;
    const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : normalizeText(product.image);

    resolvedItems.push({
      ...item,
      productName: normalizeText(product.name) || item.productName,
      productNameAr: normalizeText(product.nameAr) || item.productNameAr,
      unit: normalizeText(matchedUnit.name) || requestedUnit,
      quantity,
      price,
      total: quantity * price,
      ...(image ? { image } : {}),
    });
  }

  return resolvedItems;
}

// Initialize Firebase Admin (once per server runtime)
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      console.warn('Firebase Admin credentials not configured');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!admin.apps.length) {
      const missing: string[] = [];
      if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
      if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
      if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');

      return NextResponse.json(
        {
          error: 'Order service not configured (Firebase Admin credentials missing)',
          missing,
        },
        { status: 503 }
      );
    }

    const payload = await request.json();

    const customerName = normalizeText(payload.customerName || payload.customer);
    const phoneNumber = normalizePhoneNumber(payload.phoneNumber || payload.phone);
    const addressText = normalizeText(payload.address || payload.deliveryAddress || payload.fullAddress);
    const userNote = normalizeText(payload.userNote || payload.deliveryNotes || payload.notes);

    if (!customerName || !phoneNumber || !addressText) {
      return NextResponse.json(
        { error: 'Missing required fields', required: ['customerName', 'phoneNumber', 'address'] },
        { status: 400 }
      );
    }

    const items = normalizeItems(payload.items);
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Missing order items' },
        { status: 400 }
      );
    }

    const paymentMethodRaw = normalizeText(payload.paymentMethod || payload.paymentType);
    const paymentMethod = paymentMethodRaw === 'knet' ? 'knet' : 'cash';

    const customerEmail = normalizeText(payload.customerEmail || payload.userEmail || payload.email);

    const firestore = admin.firestore();
    if (!firestoreSettingsApplied) {
      try {
        firestore.settings({ ignoreUndefinedProperties: true });
      } catch (error) {
        console.warn('Firestore settings warning:', error);
      }
      firestoreSettingsApplied = true;
    }

    const pricedItems = await resolveOrderItemsPricing(firestore, items);
    const subtotal = pricedItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

    const deliverySettingsSnapshot = await firestore.collection('settings').doc('delivery').get();
    const deliverySettings = deliverySettingsSnapshot.exists ? deliverySettingsSnapshot.data() || {} : {};
    const deliveryFeeValue = normalizeNumber(deliverySettings.fee ?? deliverySettings.deliveryPrice ?? deliverySettings.price) ?? 0;
    const freeAboveValue = normalizeNumber(deliverySettings.freeAbove) ?? 0;
    const deliveryFee = subtotal >= freeAboveValue ? 0 : deliveryFeeValue;
    const total = subtotal + deliveryFee;

    const counterRef = firestore.collection('settings').doc('orderCounter');

    const created = await firestore.runTransaction(async (transaction) => {
      const counterSnapshot = await transaction.get(counterRef);
      const lastOrderNumber = counterSnapshot.exists
        ? Number(counterSnapshot.data()?.lastOrderNumber) || 99
        : 99;
      const nextOrderNumber = Math.max(lastOrderNumber + 1, 100);

      transaction.set(
        counterRef,
        {
          lastOrderNumber: nextOrderNumber,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const orderId = `web-${nextOrderNumber}`;
      const orderRef = firestore.collection('orders').doc(orderId);

      transaction.set(orderRef, {
        source: 'web',
        orderNumber: nextOrderNumber,
        customerName,
        customer: customerName,
        customerEmail: customerEmail || '',
        phoneNumber,
        phone: phoneNumber,
        address: addressText,
        deliveryAddress: addressText,
        deliveryNotes: userNote || undefined,
        userNote: userNote || undefined,
        items: pricedItems,
        products: pricedItems,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        paymentType: paymentMethod,
        status: 'pending',
        timestamp: Date.now(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const notificationRef = firestore.collection('adminNotifications').doc();
      transaction.set(notificationRef, {
        title: '📦 طلب جديد',
        message: `طلب جديد رقم ${nextOrderNumber} من ${customerName} - ${Number(total).toFixed(3)} د.ك`,
        type: 'new_order',
        orderId,
        orderNumber: nextOrderNumber,
        customerName,
        phoneNumber,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { orderId, orderNumber: nextOrderNumber };
    });

    return NextResponse.json({ success: true, ...created });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
