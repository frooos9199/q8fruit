const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

export const parseOrderDate = (value: any): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value?.toDate === 'function') {
    const parsedDate = value.toDate();
    return parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
  }

  if (typeof value === 'number') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (typeof value === 'string') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (typeof value === 'object' && typeof value.seconds === 'number') {
    const milliseconds = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000);
    const parsedDate = new Date(milliseconds);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return null;
};

export const getOrderDate = (order: any): Date | null => {
  return (
    parseOrderDate(order?.createdAt) ||
    parseOrderDate(order?.timestamp) ||
    parseOrderDate(order?.date) ||
    null
  );
};

export const formatOrderDateTime = (order: any, locale = 'ar-EG') => {
  const orderDate = getOrderDate(order);

  if (!orderDate) {
    return locale.startsWith('ar') ? 'تاريخ غير متوفر' : 'Date unavailable';
  }

  return orderDate.toLocaleString(locale, DATE_FORMAT_OPTIONS);
};