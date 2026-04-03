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
import { useNotifications } from '../context';
import { fetchAdminStats } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';

export const AdminScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { unreadCount } = useNotifications();
  const isArabic = i18n.language === 'ar';

  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Refresh notifications when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const statsCards = [
    {
      id: 'today',
      icon: '📅',
      title: isArabic ? 'طلبات اليوم' : "Today's Orders",
      value: stats.todayOrders,
      color: '#FF6B6B',
    },
    {
      id: 'pending',
      icon: '⏳',
      title: isArabic ? 'طلبات قيد المعالجة' : 'Pending Orders',
      value: stats.pendingOrders,
      color: '#FFA500',
      badge: stats.pendingOrders,
    },
    {
      id: 'revenue',
      icon: '💰',
      title: isArabic ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `${stats.totalRevenue.toFixed(3)} ${isArabic ? 'د.ك' : 'KD'}`,
      color: '#4CAF50',
    },
    {
      id: 'products',
      icon: '📦',
      title: isArabic ? 'إجمالي المنتجات' : 'Total Products',
      value: stats.totalProducts,
      color: '#2196F3',
    },
    {
      id: 'customers',
      icon: '👥',
      title: isArabic ? 'إجمالي العملاء' : 'Total Customers',
      value: stats.totalCustomers,
      color: '#9C27B0',
    },
    {
      id: 'completed',
      icon: '✅',
      title: isArabic ? 'الطلبات المكتملة' : 'Completed Orders',
      value: stats.completedOrders,
      color: '#00BCD4',
    },
  ];

  const adminOptions = [
    { 
      id: 'products', 
      icon: '📦', 
      title: isArabic ? 'إدارة المنتجات' : 'Manage Products',
      screen: 'ManageProducts',
    },
    { 
      id: 'orders', 
      icon: '📋', 
      title: isArabic ? 'إدارة الطلبات' : 'Manage Orders', 
      badge: stats.pendingOrders,
      screen: 'ManageOrders',
    },
    { 
      id: 'users', 
      icon: '👥', 
      title: isArabic ? 'إدارة المستخدمين' : 'Manage Users',
      screen: 'ManageUsers',
    },
    { 
      id: 'categories', 
      icon: '🗂️', 
      title: isArabic ? 'إدارة الفئات' : 'Manage Categories',
      screen: 'ManageCategories',
    },
    { 
      id: 'offers', 
      icon: '🎁', 
      title: isArabic ? 'إدارة العروض' : 'Manage Offers',
      screen: 'ManageOffers',
    },
    { 
      id: 'delivery', 
      icon: '🚚', 
      title: isArabic ? 'إعدادات التوصيل' : 'Delivery Settings',
      screen: 'DeliverySettings',
    },
    { 
      id: 'reports', 
      icon: '📊', 
      title: isArabic ? 'التقارير' : 'Reports',
      screen: 'Reports',
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={isArabic ? 'لوحة الإدارة' : 'Admin Dashboard'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isArabic ? 'جاري تحميل البيانات...' : 'Loading data...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={isArabic ? 'لوحة الإدارة' : 'Admin Dashboard'}
        rightComponent={
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notificationButton}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'الإحصائيات' : 'Statistics'}</Text>
          <View style={styles.statsGrid}>
            {statsCards.map((stat) => (
              <View key={stat.id} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                  {stat.badge ? (
                    <View style={[styles.badge, { backgroundColor: stat.color }]}>
                      <Text style={styles.badgeText}>{stat.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'الإدارة' : 'Management'}</Text>
          <View style={styles.grid}>
            {adminOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.card}
                onPress={() => {
                  if (option.screen) {
                    navigation.navigate(option.screen as any);
                  }
                }}
              >
                <Text style={styles.icon}>{option.icon}</Text>
                <Text style={styles.title}>{option.title}</Text>
                {option.badge ? (
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{option.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  statsGrid: {
    paddingHorizontal: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statIcon: {
    fontSize: 32,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  statValue: {
    fontSize: FONT_SIZE.xxl * 1.2,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  cardBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 24,
    alignItems: 'center',
  },
  cardBadgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.xs,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
});
