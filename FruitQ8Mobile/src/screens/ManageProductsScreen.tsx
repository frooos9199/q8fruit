import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { fetchProductsFromFirebase, deleteProduct, updateProduct, reorderProduct } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';

export const ManageProductsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = async () => {
    try {
      const data = await fetchProductsFromFirebase({ includeInactive: true, includeHidden: true });
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter((p: any) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameAr?.includes(searchQuery)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleReorder = async (product: any, direction: 'up' | 'down') => {
    const result = await reorderProduct(product.id, direction, products);
    if (result.success) {
      loadProducts();
    } else {
      Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'فشل إعادة الترتيب' : 'Failed to reorder');
    }
  };

  const handleDelete = (product: any) => {
    Alert.alert(
      isArabic ? 'حذف المنتج' : 'Delete Product',
      isArabic ? `هل تريد حذف "${product.nameAr || product.name}"؟` : `Delete "${product.name}"?`,
      [
        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isArabic ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteProduct(product.id);
            if (result.success) {
              Alert.alert(isArabic ? 'نجح' : 'Success', isArabic ? 'تم الحذف بنجاح' : 'Deleted successfully');
              loadProducts();
            } else {
              Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'فشل الحذف' : 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleToggleStock = async (product: any) => {
    const newVisibility = !product.isHidden;
    const result = await updateProduct(product.id, { isHidden: newVisibility });
    if (result.success) {
      loadProducts();
    } else {
      Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'فشل التحديث' : 'Failed to update');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title={isArabic ? 'إدارة المنتجات' : 'Manage Products'}
          showBack
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={isArabic ? 'إدارة المنتجات' : 'Manage Products'}
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('AddEditProduct', {})}>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={isArabic ? 'بحث عن منتج...' : 'Search products...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>{isArabic ? 'إجمالي' : 'Total'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{products.filter((p: any) => p.quantity > 0).length}</Text>
          <Text style={styles.statLabel}>{isArabic ? 'متوفر' : 'In Stock'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{products.filter((p: any) => p.discount > 0).length}</Text>
          <Text style={styles.statLabel}>{isArabic ? 'عروض' : 'Offers'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              {isArabic ? 'لا توجد منتجات' : 'No products found'}
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const imageUri = product.images?.[0] || product.image || '';
            return (
            <View key={product.id} style={styles.productCard}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.productImage}
                />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>📦</Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {isArabic ? product.nameAr || product.name : product.name}
                </Text>
                <Text style={styles.productCategory}>
                  {isArabic ? product.categoryAr || product.category : product.category}
                </Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>
                    {product.price?.toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
                  </Text>
                  <View style={[styles.stockBadge, product.isHidden ? styles.outOfStock : styles.inStock]}>
                    <Text style={styles.stockText}>
                      {product.isHidden ? (isArabic ? 'مخفي' : 'Hidden') : (isArabic ? 'ظاهر' : 'Visible')}
                    </Text>
                  </View>
                </View>
                {product.discount > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{product.discount}%</Text>
                  </View>
                )}
              </View>
              <View style={styles.reorderButtons}>
                <TouchableOpacity
                  style={[styles.reorderButton, filteredProducts.indexOf(product) === 0 && styles.disabledButton]}
                  onPress={() => handleReorder(product, 'up')}
                  disabled={filteredProducts.indexOf(product) === 0}
                >
                  <Text style={styles.reorderIcon}>⬆️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reorderButton, filteredProducts.indexOf(product) === filteredProducts.length - 1 && styles.disabledButton]}
                  onPress={() => handleReorder(product, 'down')}
                  disabled={filteredProducts.indexOf(product) === filteredProducts.length - 1}
                >
                  <Text style={styles.reorderIcon}>⬇️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('AddEditProduct', { product })}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.toggleButton]}
                  onPress={() => handleToggleStock(product)}
                >
                  <Text style={styles.actionIcon}>{product.isHidden ? '🚫' : '👁️'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(product)}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addButton: { fontSize: 32, color: COLORS.white, fontWeight: '700' },
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
  searchIcon: { fontSize: FONT_SIZE.xl },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xl * 3 },
  emptyIcon: { fontSize: 80, marginBottom: SPACING.lg },
  emptyText: { fontSize: FONT_SIZE.lg, color: COLORS.textSecondary },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    fontSize: 32,
  },
  productInfo: { flex: 1, marginLeft: SPACING.md, justifyContent: 'space-between' },
  productName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  productCategory: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  productDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  productPrice: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.primary, marginRight: SPACING.sm },
  stockBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  inStock: { backgroundColor: '#E8F5E9' },
  outOfStock: { backgroundColor: '#FFEBEE' },
  stockText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  discountText: { color: COLORS.white, fontSize: FONT_SIZE.xs, fontWeight: '700' },
  reorderButtons: { justifyContent: 'center', marginLeft: SPACING.sm },
  reorderButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EAF6',
    marginBottom: 4,
  },
  disabledButton: { opacity: 0.3 },
  reorderIcon: { fontSize: 16 },
  actions: { justifyContent: 'space-around', marginLeft: SPACING.sm },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  editButton: { backgroundColor: '#E3F2FD' },
  toggleButton: { backgroundColor: '#FFF3E0' },
  deleteButton: { backgroundColor: '#FFEBEE' },
  actionIcon: { fontSize: 18 },
});
