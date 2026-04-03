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
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

const USER_INFO_KEY = '@user_info';

export const MyOrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPhone, setUserPhone] = useState('');

  const getOrderNumber = (order: any) => String(order.orderNumber || order.id);

  useEffect(() => {
    loadUserPhone();
  }, []);

  const loadUserPhone = async () => {
    try {
      const saved = await AsyncStorage.getItem(USER_INFO_KEY);
      if (saved) {
        const userInfo = JSON.parse(saved);
        setUserPhone(userInfo.phone || '');
        loadOrders(userInfo.phone);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      setLoading(false);
    }
  };

  const loadOrders = async (phone: string) => {
    if (!phone) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('phoneNumber', '==', phone),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders(userPhone);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title={isArabic ? 'طلباتي' : 'My Orders'}
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
        title={isArabic ? 'طلباتي' : 'My Orders'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              {isArabic ? 'لا توجد طلبات' : 'No orders yet'}
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
            >
              <Text style={styles.shopButtonText}>
                {isArabic ? 'ابدأ التسوق' : 'Start Shopping'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetails', { order })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{getOrderNumber(order)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.orderDate}>
                {order.createdAt?.toDate?.().toLocaleDateString('ar-EG') || 
                 new Date(order.createdAt).toLocaleDateString('ar-EG')}
              </Text>

              <View style={styles.orderItems}>
                {order.items?.slice(0, 2).map((item: any, index: number) => (
                  <Text key={index} style={styles.itemText}>
                    • {isArabic ? item.productNameAr || item.productName : item.productName}
                  </Text>
                ))}
                {order.items?.length > 2 && (
                  <Text style={styles.moreItems}>
                    {isArabic ? `+${order.items.length - 2} منتجات أخرى` : `+${order.items.length - 2} more items`}
                  </Text>
                )}
              </View>
              
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>
                  {(order.total || 0).toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
                </Text>
                <Text style={styles.viewDetails}>
                  {isArabic ? 'عرض التفاصيل ›' : 'View Details ›'}
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
    marginBottom: SPACING.xl,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
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
    marginBottom: SPACING.xs,
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
  orderDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  orderItems: {
    marginBottom: SPACING.sm,
  },
  itemText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  moreItems: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  orderTotal: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  viewDetails: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
