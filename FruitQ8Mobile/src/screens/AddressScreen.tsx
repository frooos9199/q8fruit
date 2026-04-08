import React, { useState, useEffect } from 'react';
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
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_INFO_KEY = '@user_info';

export const AddressScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
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

      // If the user is logged in, load the latest saved address from Firebase.
      try {
        const userId = await AsyncStorage.getItem('@user_id');
        if (userId) {
          const { getUserData } = await import('../services/firebase');
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

  const handleSave = async () => {
    if (!name || !phone || !area || !block || !street || !building) {
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields'
      );
      return;
    }

    try {
      const userInfo = { name, phone, area, block, street, building, floor, apartment };
      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

      // Also persist to Firebase so it stays across devices and is reused at checkout.
      try {
        const userId = await AsyncStorage.getItem('@user_id');
        if (userId) {
          const { updateUserAddress } = await import('../services/firebase');
          await updateUserAddress(userId, {
            name,
            phone,
            address: { area, block, street, building, floor, apartment },
          });
        }
      } catch (fbError) {
        console.log('Firebase save skipped:', fbError);
      }

      Alert.alert(
        isArabic ? 'نجح' : 'Success',
        isArabic ? 'تم حفظ العنوان بنجاح' : 'Address saved successfully',
        [{ text: isArabic ? 'حسناً' : 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving user info:', error);
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'حدث خطأ في حفظ العنوان' : 'Error saving address'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isArabic ? 'عنواني' : 'My Address'}
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
          <Text style={styles.sectionTitle}>{isArabic ? 'المعلومات الشخصية' : 'Personal Information'}</Text>
          
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'العنوان' : 'Address'}</Text>
          
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
        </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isArabic ? 'حفظ العنوان' : 'Save Address'}
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
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfWidth: {
    flex: 1,
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
  saveButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: SPACING.xl,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});
