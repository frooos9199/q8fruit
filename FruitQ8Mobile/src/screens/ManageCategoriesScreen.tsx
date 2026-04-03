import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { COLORS, SPACING, FONT_SIZE } from '../constants';

export const ManageCategoriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      <Header 
        title={isArabic ? 'إدارة الفئات' : 'Manage Categories'}
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗂️</Text>
          <Text style={styles.emptyText}>
            {isArabic ? 'قريباً - إدارة الفئات' : 'Coming Soon - Manage Categories'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xl * 3 },
  emptyIcon: { fontSize: 80, marginBottom: SPACING.lg },
  emptyText: { fontSize: FONT_SIZE.lg, color: COLORS.textSecondary, textAlign: 'center' },
});
