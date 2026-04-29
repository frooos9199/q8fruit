import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.md * 3) / 2;

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToCart?: (payload: {
    product: Product;
    unit: { name: string; nameAr?: string; price: number };
    quantity: number;
  }) => void;
  variant?: 'grid' | 'featured';
  cardWidth?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  variant = 'grid',
  cardWidth,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const effectiveCardWidth = cardWidth ?? (variant === 'featured' ? Math.round(width * 0.82) : CARD_WIDTH);
  const effectiveImageHeight = Math.round(effectiveCardWidth * 0.75);

  const productName = isArabic ? (product.nameAr || product.name || '') : (product.name || product.nameAr || '');
  const fallbackUnits = useMemo(() => {
    if (product.unit && product.price) {
      return [{ name: product.unit, nameAr: product.unitAr, price: product.price }];
    }
    return [];
  }, [product.price, product.unit, product.unitAr]);

  const units = product.units && product.units.length > 0 ? product.units : fallbackUnits;
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const selectedUnit = units[selectedUnitIdx] || units[0];
  const unitLabel = isArabic ? selectedUnit?.nameAr || selectedUnit?.name : selectedUnit?.name;
  const price = selectedUnit?.price ?? product.price;
  const imageSource = (product.images && product.images.length > 0) ? product.images[0] : product.image;

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[styles.card, { width: effectiveCardWidth }]}
      {...(onPress ? { onPress, activeOpacity: 0.9 } : {})}
    >
      <View style={[styles.imageContainer, { height: effectiveImageHeight }]}>
        {imageSource ? (
          <FastImage 
            source={{ 
              uri: imageSource,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable
            }} 
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>🍎</Text>
          </View>
        )}
        {product.discount && product.discount > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        ) : null}
        {product.description && (
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={(e) => {
              e.stopPropagation();
              setShowDescriptionModal(true);
            }}
          >
            <Text style={styles.infoIcon}>ℹ️</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {productName || 'Product'}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {(price || 0).toFixed(3)} {t('currency', 'KD')}
          </Text>
          {unitLabel ? <Text style={styles.unit}>/ {unitLabel}</Text> : null}
        </View>

        {units.length > 1 && (
          <View style={styles.unitsContainer}>
            {units.map((unit, idx) => {
              const label = isArabic ? unit.nameAr || unit.name : unit.name;
              const isActive = idx === selectedUnitIdx;
              return (
                <TouchableOpacity
                  key={`${product.id}-${unit.name}-${idx}`}
                  style={[styles.unitChip, isActive && styles.unitChipActive]}
                  onPress={() => setSelectedUnitIdx(idx)}>
                  <Text style={[styles.unitChipText, isActive && styles.unitChipTextActive]}>
                    {label || 'Unit'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity((prev) => Math.min(product.stock || 99, prev + 1))}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {(product.stock ?? 0) > 0 ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              if (selectedUnit) {
                onAddToCart?.({ product, unit: selectedUnit, quantity });
              }
            }}>
            <Text style={styles.addButtonText}>{isArabic ? 'أضف' : 'Add'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>{t('outOfStock')}</Text>
          </View>
        )}
      </View>

      {/* Modal للوصف */}
      <Modal
        visible={showDescriptionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDescriptionModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDescriptionModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{productName}</Text>
              <TouchableOpacity onPress={() => setShowDescriptionModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 60,
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: '#FF3B30',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  discountText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    minHeight: 40,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  unit: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  unitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  unitChip: {
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F8F9FA',
  },
  unitChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  unitChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  unitChipTextActive: {
    color: COLORS.white,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  qtyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
  },
  qtyValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  outOfStock: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  outOfStockText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  infoButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  infoIcon: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxHeight: '70%',
    ...SHADOW.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalClose: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textSecondary,
    fontWeight: '700',
    paddingHorizontal: SPACING.sm,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  descriptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
});
