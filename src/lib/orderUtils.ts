export interface NormalizedOrderProduct {
  productId?: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const formatOrderAddress = (address: any) => {
  if (!address) {
    return '';
  }

  if (typeof address === 'string') {
    return address;
  }

  if (typeof address.fullAddress === 'string' && address.fullAddress.trim()) {
    return address.fullAddress.trim();
  }

  const parts = [
    address.area,
    address.block ? `قطعة ${address.block}` : '',
    address.street ? `شارع ${address.street}` : '',
    address.building ? `بناية ${address.building}` : '',
    address.floor ? `دور ${address.floor}` : '',
    address.apartment ? `شقة ${address.apartment}` : '',
  ].filter(Boolean);

  const base = parts.join('، ');
  return address.notes ? `${base} - ${address.notes}` : base;
};

export const getOrderCustomerName = (order: any) =>
  order.customer?.name || order.customerName || order.customer || order.userInfo?.name || order.name || 'عميل';

export const getOrderPhone = (order: any) =>
  order.customer?.phone || order.phoneNumber || order.phone || order.userInfo?.phone || order.userPhone || '';

export const getOrderEmail = (order: any) =>
  order.customer?.email || order.customerEmail || order.email || order.userInfo?.email || '';

export const getOrderDeliveryAddressObject = (order: any) =>
  order.deliveryAddress || order.delivery || order.address || order.userInfo?.address || '';

export const getOrderAddress = (order: any) =>
  formatOrderAddress(getOrderDeliveryAddressObject(order)) || 'غير محدد';

export const normalizeOrderProduct = (item: any): NormalizedOrderProduct => {
  const price = toNumber(item.price ?? item.unitPrice);
  const quantity = toNumber(item.quantity, 1);

  return {
    productId: item.productId || item.id || '',
    name: item.name || item.productNameAr || item.productName || 'منتج',
    unit: item.unit || item.unitName || item.unitAr || '',
    price,
    quantity,
    total: toNumber(item.total, price * quantity),
    image: item.image || item.productImage || item.images?.[0] || '',
  };
};

export const getOrderProducts = (order: any): NormalizedOrderProduct[] => {
  const rawItems = order.products || order.items || [];
  if (!Array.isArray(rawItems)) {
    return [];
  }
  return rawItems.map(normalizeOrderProduct);
};

export const getOrderPricing = (order: any) => {
  const products = getOrderProducts(order);
  const subtotal = toNumber(
    order.pricing?.subtotal ?? order.subtotal,
    products.reduce((sum, item) => sum + item.total, 0)
  );
  const deliveryFee = toNumber(
    order.pricing?.deliveryPrice ?? order.deliveryFee ?? order.deliveryPrice,
    0
  );
  const total = toNumber(order.pricing?.total ?? order.total, subtotal + deliveryFee);

  return {
    subtotal,
    deliveryFee,
    total,
  };
};

export const getOrderPaymentMethod = (order: any) =>
  order.paymentMethod || order.paymentType || 'cash';

export const getOrderDisplayNumber = (order: any) => {
  if (order.orderNumber !== undefined && order.orderNumber !== null && String(order.orderNumber).trim()) {
    return String(order.orderNumber).trim();
  }

  if (typeof order.id === 'number' && Number.isFinite(order.id)) {
    return String(order.id);
  }

  if (typeof order.id === 'string') {
    const trimmedId = order.id.trim();

    if (trimmedId.startsWith('local_')) {
      const normalizedLocalId = trimmedId.replace('local_', '');
      const localNumber = Number(normalizedLocalId);
      return Number.isFinite(localNumber) ? String(localNumber) : 'جديد';
    }

    if (/^\d+$/.test(trimmedId)) {
      return trimmedId;
    }
  }

  return 'جديد';
};

export const getOrderDateLabel = (order: any) => {
  if (order.date) {
    return order.date;
  }

  if (order.createdAt?.toDate) {
    return order.createdAt.toDate().toLocaleString('ar-EG');
  }

  if (order.createdAt) {
    return new Date(order.createdAt).toLocaleString('ar-EG');
  }

  return new Date().toLocaleString('ar-EG');
};

export const normalizeOrderForDisplay = (order: any) => {
  const products = getOrderProducts(order);
  const pricing = getOrderPricing(order);

  return {
    id: String(order.id || ''),
    orderNumber: getOrderDisplayNumber(order),
    customer: getOrderCustomerName(order),
    phone: getOrderPhone(order),
    email: getOrderEmail(order),
    address: getOrderAddress(order),
    products,
    items: products,
    subtotal: pricing.subtotal,
    deliveryFee: pricing.deliveryFee,
    total: pricing.total,
    paymentMethod: getOrderPaymentMethod(order),
    date: getOrderDateLabel(order),
    deliveryAddress: getOrderDeliveryAddressObject(order),
    deliveryNotes: order.deliveryNotes || order.delivery?.notes || order.userNote || '',
    status: order.status || 'pending',
    createdAt: order.createdAt,
    timestamp: order.timestamp,
  };
};