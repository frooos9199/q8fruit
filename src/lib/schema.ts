// Schema.org structured data for SEO

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Q8 Fruit - فكهاني الكويت',
  alternateName: 'فكهاني الكويت',
  url: 'https://www.q8fruit.com',
  logo: 'https://www.q8fruit.com/logo.png',
  sameAs: [
    'https://www.facebook.com/q8fruit',
    'https://www.instagram.com/q8fruit',
    'https://twitter.com/q8fruit',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+965-XXXX-XXXX',
    contactType: 'Customer Service',
    areaServed: 'KW',
    availableLanguage: ['Arabic', 'English'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KW',
    addressRegion: 'Kuwait',
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Q8 Fruit',
  url: 'https://www.q8fruit.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.q8fruit.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.q8fruit.com',
  name: 'Q8 Fruit - فكهاني الكويت',
  image: 'https://www.q8fruit.com/logo.png',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KW',
    addressRegion: 'Kuwait',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 29.3759,
    longitude: 47.9774,
  },
  url: 'https://www.q8fruit.com',
  telephone: '+965-XXXX-XXXX',
  servesCuisine: 'Fresh Fruits and Vegetables',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '22:00',
    },
  ],
};

export function generateProductSchema(product: {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  inStock?: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.name} - ${product.nameAr}`,
    image: product.image || 'https://www.q8fruit.com/default-product.jpg',
    description: product.description || `${product.nameAr} - Fresh from Q8 Fruit`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Q8 Fruit',
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.q8fruit.com/product/${product.id}`,
      priceCurrency: 'KWD',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Q8 Fruit',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://www.q8fruit.com${item.url}`,
    })),
  };
}
