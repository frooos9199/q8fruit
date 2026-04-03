import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Button, Header } from '../components';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';

const { width, height } = Dimensions.get('window');

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductDetails'
>;

export const ProductDetailsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<ProductDetailsNavigationProp>();
  const route = useRoute<ProductDetailsRouteProp>();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const isArabic = i18n.language === 'ar';

  const productName = isArabic ? product.nameAr : product.name;
  const productDescription = isArabic
    ? product.descriptionAr
    : product.description;
  const productUnit = isArabic ? product.unitAr : product.unit;
  const productCategory = isArabic ? product.categoryAr : product.category;

  const totalPrice = (product.price * quantity).toFixed(2);

  const handleAddToCart = () => {
    // TODO: Add to cart functionality
    console.log('Added to cart:', { product, quantity });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('productDetails')}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          {/* Category */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{productCategory}</Text>
          </View>

          {/* Name */}
          <Text style={styles.name}>{productName}</Text>

          {/* Description */}
          <Text style={styles.description}>{productDescription}</Text>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <Text
              style={[
                styles.stockText,
                product.stock > 0 ? styles.inStock : styles.outOfStock,
              ]}>
              {product.stock > 0
                ? `${t('inStock')} (${product.stock})`
                : t('outOfStock')}
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <View>
              <Text style={styles.priceLabel}>{t('price')}</Text>
              <Text style={styles.price}>
                {product.price.toFixed(2)} KD
                <Text style={styles.unit}> / {productUnit}</Text>
              </Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>{t('quantity')}</Text>
            <View style={styles.quantitySelector}>
              <Button
                title="-"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                variant="outline"
                size="small"
                style={styles.quantityButton}
                disabled={quantity <= 1}
              />
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Button
                title="+"
                onPress={() => setQuantity(quantity + 1)}
                variant="outline"
                size="small"
                style={styles.quantityButton}
                disabled={quantity >= product.stock}
              />
            </View>
          </View>

          {/* Total Price */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalPrice}>{totalPrice} KD</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <Button
          title={t('addToCart')}
          onPress={handleAddToCart}
          style={styles.addToCartButton}
          disabled={product.stock === 0}
        />
      </View>
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
  imageContainer: {
    width: width,
    height: height * 0.4,
    backgroundColor: COLORS.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  name: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  stockContainer: {
    marginBottom: SPACING.lg,
  },
  stockText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  inStock: {
    color: COLORS.success,
  },
  outOfStock: {
    color: COLORS.error,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  priceLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  unit: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  quantityContainer: {
    marginBottom: SPACING.xl,
  },
  quantityLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  quantityButton: {
    width: 48,
    height: 48,
  },
  quantityValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalPrice: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addToCartButton: {
    width: '100%',
  },
});
