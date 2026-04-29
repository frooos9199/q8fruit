import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { fetchDeliverySettings, updateDeliverySettings } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';

export const DeliverySettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
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
        t('error'),
        t('admin.deliverySettings.valuesPositive')
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
          t('success'),
          t('admin.deliverySettings.saved'),
          [{ text: t('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(result.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Save error:', error);

      const errorMessage = error?.message ? String(error.message) : String(error);
      Alert.alert(
        t('error'),
        t('admin.deliverySettings.saveFailed', { error: errorMessage })
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title={t('admin.deliverySettings.title')}
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
        title={t('admin.deliverySettings.title')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('admin.deliverySettings.cardTitle')}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('admin.deliverySettings.feeLabel')}
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
                {t('admin.deliverySettings.feeHint')}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('admin.deliverySettings.freeAboveLabel')}
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
                {t('admin.deliverySettings.freeAboveHint')}
              </Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>
                {t('admin.deliverySettings.exampleTitle')}
              </Text>
              <Text style={styles.exampleText}>
                {t('admin.deliverySettings.exampleText', {
                  fee: fee || '0',
                  freeAbove: freeAbove || '0',
                })}
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
                  {t('admin.deliverySettings.saveButton')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.md },
  scrollContent: { flexGrow: 1, paddingBottom: SPACING.xl },
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
