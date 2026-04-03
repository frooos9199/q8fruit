import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { fetchUsers, updateUser, deleteUser } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';

export const ManageUsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter((u: any) =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditName(user.name || '');
    setEditPhone(user.phone || '');
    setEditEmail(user.email || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName || !editEmail) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    const result = await updateUser(selectedUser.id, {
      name: editName,
      phone: editPhone,
      email: editEmail,
    });

    if (result.success) {
      Alert.alert(isArabic ? 'نجح' : 'Success', isArabic ? 'تم التحديث بنجاح' : 'Updated successfully');
      setEditModalVisible(false);
      loadUsers();
    } else {
      Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'فشل التحديث' : 'Failed to update');
    }
  };

  const handleChangeRole = (user: any, role: string) => {
    Alert.alert(
      isArabic ? 'تغيير الدور' : 'Change Role',
      isArabic ? `تغيير دور المستخدم إلى "${role === 'admin' ? 'أدمن' : role === 'delivery' ? 'مندوب' : 'مستخدم'}"؟` : `Change user role to "${role}"?`,
      [
        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isArabic ? 'تغيير' : 'Change',
          onPress: async () => {
            const result = await updateUser(user.id, { role, isAdmin: role === 'admin' });
            if (result.success) {
              Alert.alert(isArabic ? 'نجح' : 'Success', isArabic ? 'تم التحديث' : 'Updated successfully');
              loadUsers();
            } else {
              Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'فشل التحديث' : 'Failed to update');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (user: any) => {
    Alert.alert(
      isArabic ? 'حذف المستخدم' : 'Delete User',
      isArabic ? `هل تريد حذف "${user.name}"؟` : `Delete "${user.name}"?`,
      [
        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isArabic ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteUser(user.id);
            if (result.success) {
              Alert.alert(isArabic ? 'نجح' : 'Success', isArabic ? 'تم الحذف بنجاح' : 'Deleted successfully');
              loadUsers();
            } else {
              Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'فشل الحذف' : 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') return '#E3F2FD';
    if (role === 'delivery') return '#FFF3E0';
    return '#F5F5F5';
  };

  const getRoleText = (role: string) => {
    if (role === 'admin') return isArabic ? 'أدمن' : 'Admin';
    if (role === 'delivery') return isArabic ? 'مندوب' : 'Delivery';
    return isArabic ? 'مستخدم' : 'User';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title={isArabic ? 'إدارة المستخدمين' : 'Manage Users'}
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
        title={isArabic ? 'إدارة المستخدمين' : 'Manage Users'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={isArabic ? 'بحث عن مستخدم...' : 'Search users...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>{isArabic ? 'إجمالي' : 'Total'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.filter((u: any) => u.role === 'admin' || u.isAdmin).length}</Text>
          <Text style={styles.statLabel}>{isArabic ? 'أدمن' : 'Admins'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.filter((u: any) => u.role === 'delivery').length}</Text>
          <Text style={styles.statLabel}>{isArabic ? 'مندوبين' : 'Delivery'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>
              {isArabic ? 'لا يوجد مستخدمين' : 'No users found'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || '👤'}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name || 'N/A'}</Text>
                <Text style={styles.userEmail}>{user.email || 'N/A'}</Text>
                <Text style={styles.userPhone}>{user.phone || 'N/A'}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role || 'user') }]}>
                  <Text style={styles.roleText}>{getRoleText(user.role || 'user')}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(user)}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.roleButton]}
                  onPress={() => {
                    Alert.alert(
                      isArabic ? 'تغيير الدور' : 'Change Role',
                      isArabic ? 'اختر الدور الجديد' : 'Select new role',
                      [
                        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
                        { text: isArabic ? 'مستخدم' : 'User', onPress: () => handleChangeRole(user, 'user') },
                        { text: isArabic ? 'مندوب' : 'Delivery', onPress: () => handleChangeRole(user, 'delivery') },
                        { text: isArabic ? 'أدمن' : 'Admin', onPress: () => handleChangeRole(user, 'admin') },
                      ]
                    );
                  }}
                >
                  <Text style={styles.actionIcon}>👤</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(user)}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isArabic ? 'تعديل المستخدم' : 'Edit User'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={isArabic ? 'الاسم' : 'Name'}
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor={COLORS.textSecondary}
            />
            
            <TextInput
              style={styles.input}
              placeholder={isArabic ? 'البريد الإلكتروني' : 'Email'}
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              placeholderTextColor={COLORS.textSecondary}
            />
            
            <TextInput
              style={styles.input}
              placeholder={isArabic ? 'رقم الهاتف' : 'Phone'}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.textSecondary}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{isArabic ? 'إلغاء' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>{isArabic ? 'حفظ' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  userCard: {
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
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.white },
  userInfo: { flex: 1, marginLeft: SPACING.md, justifyContent: 'center' },
  userName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  userEmail: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  userPhone: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 4,
  },
  roleText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textPrimary },
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
  roleButton: { backgroundColor: '#FFF3E0' },
  deleteButton: { backgroundColor: '#FFEBEE' },
  actionIcon: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: COLORS.background },
  saveButton: { backgroundColor: COLORS.primary },
  cancelButtonText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  saveButtonText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white },
});
