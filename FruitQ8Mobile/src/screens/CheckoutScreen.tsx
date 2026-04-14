import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { useCart } from '../context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_INFO_KEY = '@user_info';

export const CheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { items, subtotal, total, deliveryFee, clearCart } = useCart();
  const isArabic = i18n.language === 'ar';

  const isMountedRef = useRef(true);
  const isSubmittingRef = useRef(false);
  const orderIdRef = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'knet'>('cash');

  useEffect(() => {
    loadUserInfo();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const generateOrderId = () => {
    // Client-side idempotency key (avoids adding a uuid dependency).
    const nowPart = Date.now().toString(36);
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `m_${nowPart}_${randomPart}`;
  };

  const loadUserInfo = async () => {
    try {
      // جلب من AsyncStorage أولاً
      const saved = await AsyncStorage.getItem(USER_INFO_KEY);
      if (saved) {
        const userInfo = JSON.parse(saved);
        setName(userInfo.name || '');
        setPhone(userInfo.phone || '');
        setArea(userInfo.area || '');
        setBlock(userInfo.block || '');
        setStreet(userInfo.street || '');
        setBuilding(userInfo.building || '');
        setFloor(userInfo.floor || '');
        setApartment(userInfo.apartment || '');
      }
      
      // جلب من Firebase إذا موجود
      try {
        const { getUserData } = await import('../services/firebase');
        const userId = await AsyncStorage.getItem('@user_id');
        if (userId) {
          const userData = await getUserData(userId);
          if (userData) {
            if (userData.name) setName(userData.name);
            if (userData.phone) setPhone(userData.phone);
            if (userData.address) {
              if (userData.address.area) setArea(userData.address.area);
              if (userData.address.block) setBlock(userData.address.block);
              if (userData.address.street) setStreet(userData.address.street);
              if (userData.address.building) setBuilding(userData.address.building);
              if (userData.address.floor) setFloor(userData.address.floor);
              if (userData.address.apartment) setApartment(userData.address.apartment);
            }
          }
        }
      } catch (fbError) {
        console.log('Firebase load skipped:', fbError);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const saveUserInfo = async () => {
    try {
      const userInfo = { name, phone, area, block, street, building, floor, apartment };
      // حفظ في AsyncStorage
      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      
      // حفظ في Firebase
      try {
        const { updateUserAddress } = await import('../services/firebase');
        const userId = await AsyncStorage.getItem('@user_id');
        if (userId) {
          await updateUserAddress(userId, {
            name,
            phone,
            address: { area, block, street, building, floor, apartment }
          });
        }
      } catch (fbError) {
        console.log('Firebase save skipped:', fbError);
      }
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  };

  const handlePlaceOrder = async () => {
    if (isSubmittingRef.current) return;

    if (!name || !phone || !area || !block || !street || !building) {
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields'
      );
      return;
    }

    isSubmittingRef.current = true;
    if (isMountedRef.current) setIsSubmitting(true);

    const orderId = orderIdRef.current || generateOrderId();
    orderIdRef.current = orderId;

    await saveUserInfo();

    const orderData = {
      id: orderId,
      clientOrderId: orderId,
      customerName: name,
      phoneNumber: phone,
      deliveryAddress: {
        area,
        block,
        street,
        building,
        floor: floor || '',
        apartment: apartment || '',
      },
      deliveryNotes: notes || '',
      paymentMethod,
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productNameAr: item.product.nameAr,
        name: item.product.nameAr || item.product.name,
        unit: item.unit.name,
        unitPrice: item.unit.price,
        quantity: item.quantity,
        price: item.unit.price,
        total: item.unit.price * item.quantity,
        image: item.product.image || item.product.images?.[0] || '',
      })),
      subtotal,
      deliveryFee,
      total,
      status: 'pending',
      createdAt: new Date(),
    };

    try {
      const { createOrder } = await import('../services/firebase');
      const result = await createOrder(orderData);
      
      if (result.success) {
        clearCart();
        try {
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } catch (navError) {
          console.log('Navigation reset failed:', navError);
        }
        isSubmittingRef.current = false;
        orderIdRef.current = null;
        if (isMountedRef.current) setIsSubmitting(false);
      } else {
        const orderError = 'error' in result ? result.error : undefined;
        throw new Error(orderError || 'Order failed');
      }
    } catch (error) {
      console.error('Order error:', error);
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى' : 'Error placing order. Please try again'
      );
      isSubmittingRef.current = false;
      orderIdRef.current = null;
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isArabic ? 'إتمام الطلب' : 'Checkout'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 24}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'معلومات التوصيل' : 'Delivery Information'}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'الاسم *' : 'Name *'}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'رقم الهاتف *' : 'Phone Number *'}</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>+965</Text>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="98899426"
                keyboardType="phone-pad"
                maxLength={8}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'المنطقة *' : 'Area *'}</Text>
            <TextInput
              style={styles.input}
              value={area}
              onChangeText={setArea}
              placeholder={isArabic ? 'مثال: السالمية' : 'Example: Salmiya'}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>{isArabic ? 'القطعة *' : 'Block *'}</Text>
              <TextInput
                style={styles.input}
                value={block}
                onChangeText={setBlock}
                placeholder="1"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>{isArabic ? 'الشارع *' : 'Street *'}</Text>
              <TextInput
                style={styles.input}
                value={street}
                onChangeText={setStreet}
                placeholder="10"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'البناية *' : 'Building *'}</Text>
            <TextInput
              style={styles.input}
              value={building}
              onChangeText={setBuilding}
              placeholder="25"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>{isArabic ? 'الدور' : 'Floor'}</Text>
              <TextInput
                style={styles.input}
                value={floor}
                onChangeText={setFloor}
                placeholder="2"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>{isArabic ? 'الشقة' : 'Apartment'}</Text>
              <TextInput
                style={styles.input}
                value={apartment}
                onChangeText={setApartment}
                placeholder="5"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'ملاحظات إضافية' : 'Additional Notes'}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder={isArabic ? 'أي ملاحظات للطلب...' : 'Any notes for the order...'}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'طريقة الدفع' : 'Payment Method'}</Text>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('cash')}>
            <View style={styles.radioOuter}>
              {paymentMethod === 'cash' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.paymentText}>💵 {isArabic ? 'الدفع عند الاستلام (كاش)' : 'Cash on Delivery'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'knet' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('knet')}>
            <View style={styles.radioOuter}>
              {paymentMethod === 'knet' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.paymentText}>💳 {isArabic ? 'كي نت' : 'K-Net'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'ملخص الطلب' : 'Order Summary'}</Text>
          
          <View style={styles.summaryBox}>
            {items.map((item, index) => {
              const productName = isArabic ? item.product.nameAr : item.product.name;
              const unitName = isArabic ? item.unit.nameAr || item.unit.name : item.unit.name;
              const itemTotal = item.unit.price * item.quantity;
              return (
                <View key={index} style={styles.summaryItem}>
                  <Text style={styles.summaryItemName}>
                    {item.quantity} × {productName} ({unitName})
                  </Text>
                  <Text style={styles.summaryItemPrice}>{itemTotal.toFixed(3)} {isArabic ? 'د.ك' : 'KD'}</Text>
                </View>
              );
            })}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</Text>
              <Text style={styles.summaryValue}>{subtotal.toFixed(3)} {isArabic ? 'د.ك' : 'KD'}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isArabic ? 'التوصيل' : 'Delivery'}</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee === 0 ? (isArabic ? 'مجاناً' : 'Free') : `${deliveryFee.toFixed(3)} ${isArabic ? 'د.ك' : 'KD'}`}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>{isArabic ? 'الإجمالي' : 'Total'}</Text>
              <Text style={styles.summaryValueTotal}>{total.toFixed(3)} {isArabic ? 'د.ك' : 'KD'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, isSubmitting && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          <Text style={styles.placeOrderText}>
            {isSubmitting
              ? isArabic
                ? 'جاري إرسال الطلب...'
                : 'Placing order...'
              : isArabic
                ? 'إتمام الطلب'
                : 'Place Order'}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },
  section: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  inputGroup: { marginBottom: SPACING.md },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfWidth: {
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  paymentText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryItemName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  summaryItemPrice: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryRowTotal: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  summaryLabelTotal: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryValueTotal: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  placeOrderButton: {
    backgroundColor: '#25D366',
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: SPACING.xl,
  },
  placeOrderText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    backgroundColor: COLORS.lightGray,
  },
  phoneInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
});
