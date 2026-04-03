import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Header } from '../components';
import { useCart } from '../context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { items, subtotal, total, deliveryFee, updateQuantity, removeFromCart } = useCart();
  const isArabic = i18n.language === 'ar';

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title={isArabic ? 'السلة' : 'Cart'} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>{isArabic ? 'سلتك فارغة' : 'Your cart is empty'}</Text>
          <Button
            title={isArabic ? 'تسوق الآن' : 'Start Shopping'}
            onPress={() => navigation.navigate('Home')}
            variant="outline"
            style={styles.continueButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={isArabic ? 'السلة' : 'Cart'} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {items.map((item) => {
            const productName = isArabic ? item.product.nameAr : item.product.name;
            const unitName = isArabic ? item.unit.nameAr || item.unit.name : item.unit.name;
            const itemTotal = item.unit.price * item.quantity;
            return (
              <View key={`${item.product.id}-${item.unit.name}`} style={styles.cartItem}>
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{productName}</Text>
                  <Text style={styles.itemUnit}>{unitName}</Text>
                  <Text style={styles.itemPrice}>
                    {itemTotal.toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
                  </Text>
                  <Text style={styles.itemPricePerUnit}>
                    {item.unit.price.toFixed(3)} {isArabic ? 'د.ك' : 'KD'} / {unitName}
                  </Text>
                </View>
                <View style={styles.rightSection}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.product.id)}>
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</Text>
              <Text style={styles.totalValue}>{subtotal.toFixed(3)} {isArabic ? 'د.ك' : 'KD'}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{isArabic ? 'التوصيل' : 'Delivery'}</Text>
              <Text style={styles.totalValue}>
                {deliveryFee === 0 ? (isArabic ? 'مجاناً' : 'Free') : `${deliveryFee.toFixed(3)} ${isArabic ? 'د.ك' : 'KD'}`}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalLabelLarge}>{isArabic ? 'الإجمالي' : 'Total'}</Text>
              <Text style={styles.totalValueLarge}>{total.toFixed(3)} {isArabic ? 'د.ك' : 'KD'}</Text>
            </View>
          </View>
          <Button
            title={isArabic ? 'إتمام الطلب' : 'Checkout'}
            onPress={() => navigation.navigate('Checkout')}
          />
        </View>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  continueButton: {
    marginTop: SPACING.md,
  },
  listContainer: {
    padding: SPACING.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.lightGray,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  itemUnit: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  itemPricePerUnit: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  removeButton: {
    marginBottom: SPACING.sm,
  },
  removeText: {
    fontSize: 28,
    color: COLORS.error,
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  quantity: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.md,
  },
  totalContainer: {
    marginBottom: SPACING.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  totalRowFinal: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalLabelLarge: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValueLarge: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
