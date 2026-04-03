import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { fetchDeliverySettings, updateDeliverySettings } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';

export const DeliverySettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fee, setFee] = useState('');
  const [freeAbove, setFreeAbove] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await fetchDeliverySettings();
      setFee(settings.fee?.toString() || '0');
      setFreeAbove(settings.freeAbove?.toString() || '0');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const feeValue = parseFloat(fee) || 0;
    const freeAboveValue = parseFloat(freeAbove) || 0;

    if (feeValue < 0 || freeAboveValue < 0) {
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'القيم يجب أن تكون موجبة' : 'Values must be positive'
      );
      return;
    }

    setSaving(true);
    try {
      console.log('Saving delivery settings:', { feeValue, freeAboveValue });
      const result = await updateDeliverySettings(feeValue, freeAboveValue);
      console.log('Save result:', result);
      
      if (result.success) {
        Alert.alert(
          isArabic ? 'نجح' : 'Success',
          isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully',
          [{ text: isArabic ? 'حسناً' : 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? `فشل حفظ الإعدادات: ${error.message || error}` : `Failed to save settings: ${error.message || error}`
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title={isArabic ? 'إعدادات التوصيل' : 'Delivery Settings'}
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
        title={isArabic ? 'إعدادات التوصيل' : 'Delivery Settings'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isArabic ? '⚙️ إعدادات رسوم التوصيل' : '⚙️ Delivery Fee Settings'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isArabic ? 'رسوم التوصيل (د.ك)' : 'Delivery Fee (KD)'}
            </Text>
            <TextInput
              style={styles.input}
              value={fee}
              onChangeText={setFee}
              keyboardType="decimal-pad"
              placeholder="0.000"
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.hint}>
              {isArabic
                ? 'رسوم التوصيل الافتراضية لكل طلب'
                : 'Default delivery fee per order'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isArabic ? 'توصيل مجاني فوق (د.ك)' : 'Free Delivery Above (KD)'}
            </Text>
            <TextInput
              style={styles.input}
              value={freeAbove}
              onChangeText={setFreeAbove}
              keyboardType="decimal-pad"
              placeholder="0.000"
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.hint}>
              {isArabic
                ? 'الطلبات فوق هذا المبلغ تحصل على توصيل مجاني'
                : 'Orders above this amount get free delivery'}
            </Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>
              {isArabic ? '📝 مثال:' : '📝 Example:'}
            </Text>
            <Text style={styles.exampleText}>
              {isArabic
                ? `• رسوم التوصيل: ${fee || '0'} د.ك\n• توصيل مجاني فوق: ${freeAbove || '0'} د.ك\n\nإذا كان الطلب ${freeAbove || '0'} د.ك أو أكثر، التوصيل مجاني\nإذا كان أقل، يتم إضافة ${fee || '0'} د.ك`
                : `• Delivery Fee: ${fee || '0'} KD\n• Free Above: ${freeAbove || '0'} KD\n\nIf order is ${freeAbove || '0'} KD or more, delivery is free\nIf less, ${fee || '0'} KD will be added`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isArabic ? '💾 حفظ الإعدادات' : '💾 Save Settings'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  inputGroup: { marginBottom: SPACING.lg },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  exampleBox: {
    backgroundColor: '#E3F2FD',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  exampleTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  exampleText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});
