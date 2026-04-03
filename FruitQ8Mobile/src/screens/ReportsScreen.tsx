import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { fetchAdminStats, fetchOrders } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';

const { width } = Dimensions.get('window');

export const ReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>({
    todayOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const getOrderNumber = (order: any) => String(order.orderNumber || order.id);

  const loadData = async () => {
    try {
      const statsData = await fetchAdminStats();
      setStats(statsData);
      
      const ordersData = await fetchOrders();
      const sorted = ordersData.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      setRecentOrders(sorted.slice(0, 5));
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title={isArabic ? 'التقارير' : 'Reports'}
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
        title={isArabic ? 'التقارير والإحصائيات' : 'Reports & Analytics'}
        showBack
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{stats.todayOrders}</Text>
            <Text style={styles.statLabel}>{isArabic ? 'طلبات اليوم' : 'Today Orders'}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>{isArabic ? 'قيد الانتظار' : 'Pending'}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{stats.completedOrders}</Text>
            <Text style={styles.statLabel}>{isArabic ? 'مكتملة' : 'Completed'}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={[styles.statValue, { fontSize: FONT_SIZE.lg }]}>{stats.totalRevenue.toFixed(3)}</Text>
            <Text style={styles.statLabel}>{isArabic ? 'الإيرادات (د.ك)' : 'Revenue (KD)'}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
            <Text style={styles.statIcon}>🛍️</Text>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>{isArabic ? 'المنتجات' : 'Products'}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#E0F2F1' }]}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{stats.totalCustomers}</Text>
            <Text style={styles.statLabel}>{isArabic ? 'العملاء' : 'Customers'}</Text>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'آخر الطلبات' : 'Recent Orders'}</Text>
          {recentOrders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Text style={styles.emptyText}>{isArabic ? 'لا توجد طلبات' : 'No orders yet'}</Text>
            </View>
          ) : (
            recentOrders.map((order) => {
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

              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>#{getOrderNumber(order)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderCustomer}>
                      👤 {order.customerName || order.userName || 'N/A'}
                    </Text>
                    <Text style={styles.orderTotal}>
                      💰 {(order.total || 0).toFixed(3)} {isArabic ? 'د.ك' : 'KD'}
                    </Text>
                  </View>
                  <Text style={styles.orderDate}>
                    {order.createdAt?.toDate?.().toLocaleString('ar-EG') || 
                     new Date(order.createdAt).toLocaleString('ar-EG')}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Performance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'ملخص الأداء' : 'Performance Summary'}</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isArabic ? 'متوسط قيمة الطلب' : 'Avg Order Value'}</Text>
              <Text style={styles.summaryValue}>
                {stats.completedOrders > 0 
                  ? (stats.totalRevenue / stats.completedOrders).toFixed(3)
                  : '0.000'} {isArabic ? 'د.ك' : 'KD'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isArabic ? 'معدل الإكمال' : 'Completion Rate'}</Text>
              <Text style={styles.summaryValue}>
                {stats.todayOrders > 0
                  ? ((stats.completedOrders / (stats.todayOrders + stats.completedOrders)) * 100).toFixed(1)
                  : '0'}%
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isArabic ? 'الطلبات المعلقة' : 'Pending Rate'}</Text>
              <Text style={styles.summaryValue}>
                {stats.todayOrders > 0
                  ? ((stats.pendingOrders / stats.todayOrders) * 100).toFixed(1)
                  : '0'}%
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
  },
  statCard: {
    width: (width - SPACING.md * 3) / 2,
    margin: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { fontSize: 40, marginBottom: SPACING.sm },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
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
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyOrders: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  orderCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderId: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  orderCustomer: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  orderTotal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  orderDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  summaryCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
