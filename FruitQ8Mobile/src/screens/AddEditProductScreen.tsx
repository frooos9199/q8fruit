import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Header } from '../components';
import { addProduct, updateProduct } from '../services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { launchImageLibrary } from 'react-native-image-picker';

export const AddEditProductScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const product = route.params?.product;
  const isEdit = !!product;

  const [nameAr, setNameAr] = useState(product?.nameAr || '');
  const [nameEn, setNameEn] = useState(product?.name || '');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [quantity, setQuantity] = useState(product?.quantity?.toString() || '');
  const [category, setCategory] = useState(product?.category || '');
  const [units, setUnits] = useState<Array<{name: string; price: string}>>(product?.units?.map((u: any) => ({name: u.name, price: u.price.toString()})) || [{name: '', price: ''}]);
  const [discount, setDiscount] = useState(product?.discount?.toString() || '0');
  const [description, setDescription] = useState(product?.description || '');
  const [showDescription, setShowDescription] = useState(!!product?.description);
  const [loading, setLoading] = useState(false);

  const availableCategories = ['فواكه', 'خضار', 'ورقيات', 'سلات الفواكه'];

  const addUnit = () => {
    setUnits([...units, {name: '', price: ''}]);
  };

  const removeUnit = (index: number) => {
    if (units.length > 1) {
      setUnits(units.filter((_, i) => i !== index));
    }
  };

  const updateUnit = (index: number, field: 'name' | 'price', value: string) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    setUnits(newUnits);
  };

  const pickImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5,
        quality: 0.6,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.didCancel || result.errorCode) {
        if (result.errorCode) {
          Alert.alert(
            isArabic ? 'خطأ' : 'Error',
            isArabic ? 'حدث خطأ في اختيار الصور' : 'Error selecting images'
          );
        }
        return;
      }

      const uris = result.assets?.map(asset => asset.uri).filter(Boolean) as string[];
      if (uris && uris.length > 0) {
        setImages([...images, ...uris]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'حدث خطأ في اختيار الصور' : 'Error selecting images'
      );
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!nameAr || !nameEn || !category || !quantity) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const validUnits = units.filter(u => u.name && u.price && parseFloat(u.price) > 0);
    if (validUnits.length === 0) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'يرجى إضافة وحدة واحدة على الأقل بسعر صحيح' : 'Please add at least one unit with valid price');
      return;
    }

    if (images.length === 0) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', isArabic ? 'يرجى إضافة صورة واحدة على الأقل' : 'Please add at least one image');
      return;
    }

    setLoading(true);
    const data = {
      name: nameEn,
      nameAr,
      category,
      quantity: parseInt(quantity),
      discount: parseInt(discount) || 0,
      images,
      image: images[0] || '',
      units: validUnits.map(u => ({
        name: u.name,
        price: parseFloat(u.price)
      })),
      price: parseFloat(validUnits[0].price),
      description: showDescription ? description : '',
      active: true,
    };

    try {
      if (isEdit) {
        const result = await updateProduct(product.id, data);
        if (result.success) {
          Alert.alert(
            isArabic ? 'نجح' : 'Success',
            isArabic ? 'تم التحديث بنجاح' : 'Updated successfully',
            [{ text: isArabic ? 'حسناً' : 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          throw new Error(result.error || 'Update failed');
        }
      } else {
        const result = await addProduct(data);
        if (result.success) {
          Alert.alert(
            isArabic ? 'نجح' : 'Success',
            isArabic ? 'تمت الإضافة بنجاح' : 'Added successfully',
            [{ text: isArabic ? 'حسناً' : 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          throw new Error(result.error || 'Add failed');
        }
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? `حدث خطأ: ${error.message || 'خطأ غير معروف'}` : `An error occurred: ${error.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEdit ? (isArabic ? 'تعديل المنتج' : 'Edit Product') : (isArabic ? 'إضافة منتج' : 'Add Product')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* 1. صور المنتج */}
          <Text style={styles.sectionTitle}>{isArabic ? 'صور المنتج *' : 'Product Images *'}</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.productImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
              <Text style={styles.addImageText}>+</Text>
              <Text style={styles.addImageLabel}>{isArabic ? 'إضافة صور' : 'Add Images'}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* 2. الاسم عربي و إنجليزي */}
          <Text style={styles.sectionTitle}>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'الاسم (عربي) *' : 'Name (Arabic) *'}</Text>
            <TextInput
              style={styles.input}
              value={nameAr}
              onChangeText={setNameAr}
              placeholder="تفاح أحمر"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'الاسم (إنجليزي) *' : 'Name (English) *'}</Text>
            <TextInput
              style={styles.input}
              value={nameEn}
              onChangeText={setNameEn}
              placeholder="Red Apple"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* 3. الكمية */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'الكمية *' : 'Quantity *'}</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="100"
              keyboardType="number-pad"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* 4. التصنيف */}
          <Text style={styles.sectionTitle}>{isArabic ? 'التصنيف *' : 'Category *'}</Text>
          
          <View style={styles.categoriesGrid}>
            {availableCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 5. الوحدات والأسعار */}
          <Text style={styles.sectionTitle}>{isArabic ? 'الوحدات والأسعار *' : 'Units & Prices *'}</Text>

          {units.map((unit, index) => (
            <View key={index} style={styles.unitRow}>
              <View style={styles.unitInputWrapper}>
                <Text style={styles.label}>{isArabic ? 'الوحدة' : 'Unit'}</Text>
                <TextInput
                  style={styles.input}
                  value={unit.name}
                  onChangeText={(val) => updateUnit(index, 'name', val)}
                  placeholder={isArabic ? 'كجم / حبة / صندوق' : 'kg / piece / box'}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              <View style={styles.unitInputWrapper}>
                <Text style={styles.label}>{isArabic ? 'السعر (د.ك)' : 'Price (KD)'}</Text>
                <TextInput
                  style={styles.input}
                  value={unit.price}
                  onChangeText={(val) => updateUnit(index, 'price', val)}
                  placeholder="1.500"
                  keyboardType="decimal-pad"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
              {units.length > 1 && (
                <TouchableOpacity style={styles.removeUnitBtn} onPress={() => removeUnit(index)}>
                  <Text style={styles.removeUnitText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addUnitBtn} onPress={addUnit}>
            <Text style={styles.addUnitText}>+ {isArabic ? 'إضافة وحدة' : 'Add Unit'}</Text>
          </TouchableOpacity>

          {/* 6. نسبة الخصم */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{isArabic ? 'نسبة الخصم (%)' : 'Discount (%)'}</Text>
            <TextInput
              style={styles.input}
              value={discount}
              onChangeText={setDiscount}
              placeholder="0"
              keyboardType="number-pad"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* 7. الوصف (اختياري) */}
          <View style={styles.descriptionSection}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.sectionTitle}>{isArabic ? 'وصف المنتج (اختياري)' : 'Product Description (Optional)'}</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, showDescription && styles.toggleBtnActive]}
                onPress={() => setShowDescription(!showDescription)}
              >
                <Text style={[styles.toggleBtnText, showDescription && styles.toggleBtnTextActive]}>
                  {showDescription ? (isArabic ? '✓ مفعّل' : '✓ Enabled') : (isArabic ? 'تفعيل' : 'Enable')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showDescription && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={isArabic ? 'اكتب وصف تفصيلي عن المنتج...' : 'Write detailed description...'}
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  form: { padding: SPACING.md },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
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
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.md },
  halfWidth: { flex: 1 },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  imagePlaceholderText: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  imagePlaceholderLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  imagesScroll: { marginBottom: SPACING.lg },
  imageWrapper: {
    width: 120,
    height: 120,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  addImageBtn: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  addImageText: { fontSize: 32, color: COLORS.textSecondary },
  addImageLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  unitRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  unitInputWrapper: { flex: 1 },
  removeUnitBtn: {
    width: 40,
    height: 48,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeUnitText: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  addUnitBtn: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addUnitText: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.primary },
  descriptionSection: { marginTop: SPACING.md },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  toggleBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleBtnTextActive: {
    color: COLORS.white,
  },
});
