import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProductCard, Header } from '../components';
import { Product } from '../types';
import { fetchProductsFromFirebase } from '../services/firebase';
import { useCart } from '../context';
import { COLORS, SPACING, FONT_SIZE } from '../constants';

export const OffersScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    const load = async () => {
      try {
        const rawProducts = await fetchProductsFromFirebase();
        const mappedProducts: Product[] = rawProducts
          .filter((item: any) => item && item.name && item.discount > 0)
          .map((item: any) => {
            const units = Array.isArray(item.units) ? item.units : [];
            const firstUnit = units[0];
            const image = Array.isArray(item.images) && item.images.length > 0
              ? item.images[0]
              : item.image || '';
            return {
              id: String(item.id ?? item.docId ?? item.name),
              name: item.name || '',
              nameAr: item.nameAr || item.name || '',
              description: item.description || '',
              descriptionAr: item.descriptionAr || item.description || '',
              price: firstUnit?.price ?? item.price ?? 0,
              image,
              images: item.images,
              category: item.category || 'General',
              categoryAr: item.categoryAr || item.category || 'عام',
              unit: firstUnit?.name || item.unit || '',
              unitAr: firstUnit?.nameAr || item.unitAr || firstUnit?.name || '',
              units: units.map((u: any) => ({
                name: u.name,
                nameAr: u.nameAr || u.name,
                price: u.price || 0,
              })),
              stock: item.quantity ?? item.stock ?? 0,
              discount: item.discount || 0,
            };
          });

        setProducts(mappedProducts);
      } catch (error) {
        console.error('❌ Firebase error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <View style={styles.container}>
      <Header title={isArabic ? 'العروض الخاصة' : 'Special Offers'} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎁</Text>
            <Text style={styles.emptyText}>
              {isArabic ? 'لا توجد عروض حالياً' : 'No offers available'}
            </Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 3,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    justifyContent: 'space-between',
  },
});
