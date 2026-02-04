// Google Tag Manager Integration
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
    });
  }
};

export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track e-commerce events
export const trackPurchase = (orderDetails: {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', orderDetails);
  }
};

export const trackAddToCart = (item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'KWD',
      value: item.price * item.quantity,
      items: [item],
    });
  }
};

export const trackViewItem = (item: {
  item_id: string;
  item_name: string;
  price: number;
  category?: string;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'KWD',
      value: item.price,
      items: [item],
    });
  }
};

export const trackSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }
};

// Facebook Pixel Integration
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';

export const trackFBEvent = (event: string, data?: any) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, data);
  }
};

export const trackFBPurchase = (value: number, currency: string = 'KWD') => {
  trackFBEvent('Purchase', { value, currency });
};

export const trackFBAddToCart = (value: number, currency: string = 'KWD') => {
  trackFBEvent('AddToCart', { value, currency });
};

declare global {
  interface Window {
    gtag: any;
    fbq: any;
  }
}
