import React, { useEffect, useMemo, useState, useCallback } from 'react';
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

export const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isArabic = i18n.language === 'ar';
  const availableCategories = ['فواكه', 'خضار', 'ورقيات', 'سلات الفواكه'];

  const loadProducts = useCallback(async () => {
    try {
      console.log('🔄 Fetching products from Firebase...');
      const rawProducts = await fetchProductsFromFirebase();
      console.log('✅ Raw products:', rawProducts.length, rawProducts);
      const mappedProducts: Product[] = rawProducts
        .filter((item: any) => item && item.name && !item.isHidden)
        .map((item: any) => {
          const units = Array.isArray(item.units) ? item.units : [];
          const firstUnit = units[0];
          const image = Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : item.image || '';
          
          console.log('📦 Product:', item.name, '| Images:', item.images, '| Image:', item.image, '| Final:', image);
          
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
      console.log('✅ Mapped products:', mappedProducts.length);
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = isArabic
      ? product.nameAr.toLowerCase().includes(searchQuery.toLowerCase())
      : product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = products.filter((p) => p.discount);

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      key={item.id}
      product={item}
      onAddToCart={addToCart}
    />
  ), [addToCart]);

  const ListHeaderComponent = useCallback(() => (
    <>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

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

      {featuredProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('featuredProducts')}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('products')}</Text>
        {loading ? (
          <Text style={styles.loadingText}>{isArabic ? 'جاري التحميل...' : 'Loading...'}</Text>
        ) : products.length === 0 ? (
          <Text style={styles.loadingText}>{isArabic ? 'لا توجد منتجات حالياً' : 'No products found'}</Text>
        ) : null}
      </View>
    </>
  ), [searchQuery, t, setSearchQuery, selectedCategory, categories, isArabic, featuredProducts, addToCart, loading, products.length]);

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

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
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
    gap: SPACING.md,
  },
});
