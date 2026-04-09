import React, { useDeferredValue, useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProductCard, Header } from '../components';
import { Product } from '../types';
import { fetchProductsFromFirebase } from '../services/firebase';
import { useCart } from '../context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';

const { width } = Dimensions.get('window');

const FeaturedCarousel: React.FC<{
  title: string;
  viewAllLabel: string;
  swipeHint: string;
  featuredProducts: Product[];
  cardWidth: number;
  snapInterval: number;
  onAddToCart: (product: any, unit?: any) => void;
}> = ({
  title,
  viewAllLabel,
  swipeHint,
  featuredProducts,
  cardWidth,
  snapInterval,
  onAddToCart,
}) => {
  const [featuredIndex, setFeaturedIndex] = useState(0);

  if (!featuredProducts.length) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>{viewAllLabel}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={featuredProducts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredContainer}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={(event) => {
          const rawX = event.nativeEvent.contentOffset.x;
          const x = Math.abs(rawX);
          const nextIndex = Math.max(
            0,
            Math.min(featuredProducts.length - 1, Math.round(x / snapInterval))
          );
          setFeaturedIndex(nextIndex);
        }}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, marginRight: SPACING.md }}>
            <ProductCard product={item} onAddToCart={onAddToCart} />
          </View>
        )}
      />

      <View style={styles.featuredFooter}>
        <Text style={styles.featuredHint}>{swipeHint}</Text>
        <View style={styles.dotsRow}>
          {featuredProducts.map((_, idx) => (
            <View
              key={`featured-dot-${idx}`}
              style={[styles.dot, idx === featuredIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  const isArabic = i18n.language === 'ar';
  const availableCategories = ['فواكه', 'خضار', 'ورقيات', 'سلات الفواكه'];

  const loadProducts = useCallback(async () => {
    try {
      const rawProducts = await fetchProductsFromFirebase();
      const mappedProducts: Product[] = rawProducts
        .filter((item: any) => item && item.name && !item.isHidden)
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    return availableCategories.map((cat) => ({
      id: cat,
      name: cat,
      nameAr: cat,
      icon: '🧺',
    }));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchableName = isArabic
        ? (product.nameAr || product.name || '').toLowerCase()
        : (product.name || product.nameAr || '').toLowerCase();
      const matchesSearch = !deferredSearchQuery || searchableName.includes(deferredSearchQuery);
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, isArabic, deferredSearchQuery, selectedCategory]);

  const featuredProducts = useMemo(() => products.filter((p) => p.discount), [products]);

  // Keep featured cards same size as the original grid cards
  const featuredCardWidth = useMemo(() => (width - SPACING.md * 3) / 2, [width]);
  const featuredSnapInterval = useMemo(() => featuredCardWidth + SPACING.md, [featuredCardWidth]);

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      key={item.id}
      product={item}
      onAddToCart={addToCart}
    />
  ), [addToCart]);

  const ListHeaderComponent = useCallback(() => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('categories')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[
              styles.categoryCard,
              selectedCategory === 'all' && styles.categoryCardActive,
            ]}
            onPress={() => setSelectedCategory('all')}>
            <Text style={styles.categoryIcon}>🛒</Text>
            <Text style={styles.categoryName}>
              {isArabic ? 'الكل' : 'All'}
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.name &&
                  styles.categoryCardActive,
              ]}
              onPress={() => setSelectedCategory(category.name)}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FeaturedCarousel
        title={t('featuredProducts')}
        viewAllLabel={t('viewAll')}
        swipeHint={t('swipeForMore')}
        featuredProducts={featuredProducts}
        cardWidth={featuredCardWidth}
        snapInterval={featuredSnapInterval}
        onAddToCart={addToCart}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('products')}</Text>
        {loading ? (
          <Text style={styles.loadingText}>{isArabic ? 'جاري التحميل...' : 'Loading...'}</Text>
        ) : products.length === 0 ? (
          <Text style={styles.loadingText}>{isArabic ? 'لا توجد منتجات حالياً' : 'No products found'}</Text>
        ) : null}
      </View>
    </>
  ), [t, selectedCategory, categories, isArabic, featuredProducts, addToCart, loading, products.length, featuredCardWidth, featuredSnapInterval]);

  return (
    <View style={styles.container}>
      <Header
        title={t('appName')}
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              const newLang = i18n.language === 'ar' ? 'en' : 'ar';
              i18n.changeLanguage(newLang);
            }}>
            <Text style={styles.langButton}>{isArabic ? 'EN' : 'ع'}</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary} 
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={false}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flatListContent: {
    paddingBottom: SPACING.xl,
  },
  columnWrapper: {
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  langButton: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  searchIcon: {
    fontSize: FONT_SIZE.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoriesContainer: {
    paddingLeft: SPACING.md,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  categoryName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  featuredContainer: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.md,
  },
  featuredFooter: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featuredHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    backgroundColor: COLORS.lightGray,
  },
});
