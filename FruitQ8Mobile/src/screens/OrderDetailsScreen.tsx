import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { useAuth } from '../context';
import { updateOrderStatus } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { formatOrderDateTime } from '../utils/orderDate';

export const OrderDetailsScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { canAccessAdmin } = useAuth();
  const baseLanguage = (i18n.language || 'en').split('-')[0];
  const isArabic = baseLanguage === 'ar';
  const { order } = route.params;
  const orderNumber = String(order.orderNumber || order.id);

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#FFA500',
      confirmed: '#2196F3',
      preparing: '#9C27B0',
      delivering: '#00BCD4',
      delivered: '#4CAF50',
      cancelled: '#FF0000',
    };
    return colors[status] || COLORS.textSecondary;
  };

  const getStatusText = (status: string) => {
    return t(`orderStatus.${status}`, { defaultValue: status });
  };

  const handleUpdateStatus = async (newStatus: string) => {
    Alert.alert(
      t('admin.orderDetails.updateStatus'),
      t('admin.orderDetails.updateStatusConfirm', { status: getStatusText(newStatus) }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('admin.orderDetails.update'),
          onPress: async () => {
            const result = await updateOrderStatus(order.id, newStatus);
            if (result.success) {
              Alert.alert(t('success'), t('admin.orderDetails.updated'));
              navigation.goBack();
            } else {
              Alert.alert(
                t('error'),
                result.error || t('admin.orderDetails.updateFailed')
              );
            }
          },
        },
      ]
    );
  };

  const sendWhatsAppToAdmin = () => {
    const items = order.items?.map((item: any) => 
      `${isArabic ? item.productNameAr || item.productName : item.productName} - ${item.quantity} × ${(item.price || 0).toFixed(3)}`
    ).join('\n');
    
    const address = order.deliveryAddress || order.address || {};
    const addressText = typeof address === 'string' ? address : 
      `${address.area || ''} - قطعة ${address.block || ''} - شارع ${address.street || ''} - بناية ${address.building || ''}${address.floor ? ` - دور ${address.floor}` : ''}${address.apartment ? ` - شقة ${address.apartment}` : ''}`;
    
    const message = `🛒 *طلب جديد #${orderNumber}*\n\n` +
      `👤 *العميل:* ${order.customerName || order.customer?.name || order.userName || order.name || ''}\n` +
      `📱 *الهاتف:* ${order.phoneNumber || order.customer?.phone || order.customerPhone || order.userPhone || order.phone || ''}\n` +
      `📍 *العنوان:* ${addressText}\n\n` +
      `📦 *المنتجات:*\n${items}\n\n` +
      `💰 *المجموع:* ${(order.total || 0).toFixed(3)} د.ك\n` +
      `💳 *الدفع:* ${order.paymentMethod === 'cash' ? 'كاش' : 'كي نت'}`;
    
    Linking.openURL(`https://wa.me/96598899426?text=${encodeURIComponent(message)}`);
  };

  const sendWhatsAppToCustomer = () => {
    const phone = (order.phoneNumber || order.customerPhone || order.userPhone || order.phone || '').replace(/[^0-9]/g, '');
    if (!phone) {
      Alert.alert(t('error'), isArabic ? 'رقم الهاتف غير متوفر' : 'Phone number not available');
      return;
    }
    
    const message = `مرحباً ${order.customerName || order.userName || order.name || ''},\n\n` +
      `طلبك #${orderNumber} ${getStatusText(order.status)}\n\n` +
      `شكراً لك - فكهاني الكويت 🍎`;
    
    Linking.openURL(`https://wa.me/${phone.startsWith('965') ? phone : '965' + phone}?text=${encodeURIComponent(message)}`);
  };

  return (
    <View style={styles.container}>
      <Header 
        title={t('admin.orderDetails.title')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>#{orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            {formatOrderDateTime(
              order,
              baseLanguage === 'ar' ? 'ar-EG' : baseLanguage === 'bn' ? 'bn-BD' : 'en-US'
            )}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.orderDetails.customerInfo')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('admin.orderDetails.nameLabel')}</Text>
            <Text style={styles.infoValue}>{order.customerName || order.customer?.name || order.userName || order.name || ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('admin.orderDetails.phoneLabel')}</Text>
            <Text style={styles.infoValue}>{order.phoneNumber || order.customer?.phone || order.customerPhone || order.userPhone || order.phone || ''}</Text>
          </View>
          {(order.customer?.email || order.customerEmail || order.email) && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('admin.orderDetails.emailLabel')}</Text>
              <Text style={styles.infoValue}>{order.customer?.email || order.customerEmail || order.email}</Text>
            </View>
          )}
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.orderDetails.deliveryInfo')}</Text>
          {(() => {
            const addr = order.deliveryAddress || order.address;
            if (!addr) return null;
            
            if (typeof addr === 'string') {
              return (
                <Text style={styles.addressText}>{addr}</Text>
              );
            }
            
            return (
              <>
                {addr.area && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('admin.orderDetails.areaLabel')}</Text>
                    <Text style={styles.infoValue}>{addr.area}</Text>
                  </View>
                )}
                {addr.block && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('admin.orderDetails.blockLabel')}</Text>
                    <Text style={styles.infoValue}>{addr.block}</Text>
                  </View>
                )}
                {addr.street && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('admin.orderDetails.streetLabel')}</Text>
                    <Text style={styles.infoValue}>{addr.street}</Text>
                  </View>
                )}
                {addr.building && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('admin.orderDetails.buildingLabel')}</Text>
                    <Text style={styles.infoValue}>{addr.building}</Text>
                  </View>
                )}
                {addr.floor && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('admin.orderDetails.floorLabel')}</Text>
                    <Text style={styles.infoValue}>{addr.floor}</Text>
                  </View>
                )}
                {addr.apartment && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('admin.orderDetails.apartmentLabel')}</Text>
                    <Text style={styles.infoValue}>{addr.apartment}</Text>
                  </View>
                )}
              </>
            );
          })()}
          {order.deliveryNotes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>{t('admin.orderDetails.notesLabel')}</Text>
              <Text style={styles.notesText}>{order.deliveryNotes}</Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.orderDetails.items')}</Text>
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {isArabic ? item.productNameAr || item.productName : item.productName}
                </Text>
                <Text style={styles.itemUnit}>
                  {item.quantity} × {(item.price || 0).toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {(item.quantity * (item.price || 0)).toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.orderDetails.payment')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
            <Text style={styles.summaryValue}>
              {(order.subtotal || 0).toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('admin.orderDetails.deliveryLabel')}</Text>
            <Text style={styles.summaryValue}>
              {order.deliveryFee === 0 
                ? t('admin.orderDetails.free')
                : `${(order.deliveryFee || 0).toFixed(3)} ${isArabic ? 'د.ك' : 'KD'}`}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelTotal}>{t('total')}</Text>
            <Text style={styles.summaryValueTotal}>
              {(order.total || 0).toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
            </Text>
          </View>
          <View style={styles.paymentMethodContainer}>
            <Text style={styles.paymentMethodLabel}>{t('admin.orderDetails.paymentMethod')}</Text>
            <Text style={styles.paymentMethodValue}>
              {order.paymentMethod === 'cash' 
                ? t('admin.orderDetails.cashOnDelivery')
                : t('admin.orderDetails.kNet')}
            </Text>
          </View>
        </View>

        {/* WhatsApp Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.orderDetails.whatsapp')}</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#25D366' }]} onPress={sendWhatsAppToAdmin}>
              <Text style={styles.actionButtonText}>{t('admin.orderDetails.sendToAdmin')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#128C7E' }]} onPress={sendWhatsAppToCustomer}>
              <Text style={styles.actionButtonText}>{t('admin.orderDetails.sendToCustomer')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Actions */}
        {canAccessAdmin && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('admin.orderDetails.updateStatus')}</Text>
            <View style={styles.actionsGrid}>
              {order.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => handleUpdateStatus('confirmed')}
                  >
                    <Text style={styles.actionButtonText}>
                      {t('confirm')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FF0000' }]}
                    onPress={() => handleUpdateStatus('cancelled')}
                  >
                    <Text style={styles.actionButtonText}>
                      {t('cancel')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {order.status === 'confirmed' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                  onPress={() => handleUpdateStatus('preparing')}
                >
                  <Text style={styles.actionButtonText}>
                    {t('orderStatus.preparing')}
                  </Text>
                </TouchableOpacity>
              )}
              {order.status === 'preparing' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#00BCD4' }]}
                  onPress={() => handleUpdateStatus('delivering')}
                >
                  <Text style={styles.actionButtonText}>
                    {t('orderStatus.delivering')}
                  </Text>
                </TouchableOpacity>
              )}
              {order.status === 'delivering' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => handleUpdateStatus('delivered')}
                >
                  <Text style={styles.actionButtonText}>
                    {t('orderStatus.delivered')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  section: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderId: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.textPrimary },
  statusBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full },
  statusText: { color: COLORS.white, fontSize: FONT_SIZE.xs, fontWeight: '700' },
  orderDate: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoLabel: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, flex: 1, textAlign: 'right' },
  addressText: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, lineHeight: 22 },
  notesContainer: { marginTop: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md },
  notesLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
  notesText: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  itemUnit: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  itemTotal: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.primary },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryRowTotal: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryLabel: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.textPrimary },
  summaryLabelTotal: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary },
  summaryValueTotal: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.primary },
  paymentMethodContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodLabel: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.textSecondary },
  paymentMethodValue: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
