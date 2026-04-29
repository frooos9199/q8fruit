import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { COLORS, SPACING, FONT_SIZE } from '../constants';

export const ManageOffersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Header 
        title={t('admin.manageOffers.title')}
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyText}>
            {t('admin.manageOffers.comingSoon')}
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
