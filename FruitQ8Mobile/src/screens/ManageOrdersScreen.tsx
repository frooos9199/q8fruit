import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { fetchOrders } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';

export const ManageOrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const getOrderNumber = (order: any) => String(order.orderNumber || order.id);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders(filter === 'all' ? undefined : filter);
      console.log('Orders data:', JSON.stringify(data[0], null, 2)); // Debug
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#2196F3';
      case 'preparing': return '#9C27B0';
      case 'delivering': return '#00BCD4';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#FF0000';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: any = {
      pending: isArabic ? 'قيد الانتظار' : 'Pending',
      confirmed: isArabic ? 'مؤكد' : 'Confirmed',
      preparing: isArabic ? 'قيد التحضير' : 'Preparing',
      delivering: isArabic ? 'قيد التوصيل' : 'Delivering',
      delivered: isArabic ? 'تم التوصيل' : 'Delivered',
      cancelled: isArabic ? 'ملغي' : 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const filters = [
    { id: 'all', label: isArabic ? 'الكل' : 'All' },
    { id: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending' },
    { id: 'confirmed', label: isArabic ? 'مؤكد' : 'Confirmed' },
    { id: 'delivered', label: isArabic ? 'مكتمل' : 'Delivered' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title={isArabic ? 'إدارة الطلبات' : 'Manage Orders'}
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
        title={isArabic ? 'إدارة الطلبات' : 'Manage Orders'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              {isArabic ? 'لا توجد طلبات' : 'No orders found'}
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => {
                console.log('Order data:', order); // Debug
                navigation.navigate('OrderDetails', { order });
              }}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{getOrderNumber(order)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.customerName}>
                {order.customerName || order.customer?.name || order.userName || order.name || (isArabic ? 'عميل' : 'Customer')}
              </Text>
              
              <Text style={styles.customerPhone}>
                📱 {order.phoneNumber || order.customer?.phone || order.customerPhone || order.userPhone || order.phone || (isArabic ? 'غير متوفر' : 'N/A')}
              </Text>
              
              <Text style={styles.customerAddress} numberOfLines={2}>
                📍 {(() => {
                  const addr = order.deliveryAddress || order.address;
                  if (!addr) return '';
                  if (typeof addr === 'string') return addr;
                  return `${addr.area || ''} - قطعة ${addr.block || ''} - شارع ${addr.street || ''} - بناية ${addr.building || ''}${addr.floor ? ` - دور ${addr.floor}` : ''}${addr.apartment ? ` - شقة ${addr.apartment}` : ''}`;
                })()}
              </Text>
              
              <View style={styles.orderDetails}>
                <Text style={styles.orderTotal}>
                  {(order.total || 0).toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
                </Text>
                <Text style={styles.orderDate}>
                  {order.createdAt?.toDate?.().toLocaleDateString('ar-EG') || 
                   new Date(order.createdAt).toLocaleDateString('ar-EG')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.lightGray,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
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
  },
  orderCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
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
  orderId: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  customerName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  customerPhone: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  customerAddress: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  orderDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
