import { db } from './firebase';
import { collection, setDoc, doc } from 'firebase/firestore';

export const seedProducts = async () => {
  if (!db) {
    console.error('Firebase not initialized');
    return false;
  }

  const products = [
    {
      id: 1,
      name: 'تفاح أحمر',
      units: [{ name: 'كيلو', price: 1.250 }],
      quantity: 100,
      active: true,
      category: 'فواكه',
      images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&crop=center']
    },
    {
      id: 2,
      name: 'موز',
      units: [{ name: 'كيلو', price: 0.750 }],
      quantity: 150,
      active: true,
      category: 'فواكه',
      images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center']
    },
    {
      id: 3,
      name: 'برتقال',
      units: [{ name: 'كيلو', price: 1.000 }],
      quantity: 120,
      active: true,
      category: 'فواكه',
      images: ['https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop&crop=center']
    },
    {
      id: 4,
      name: 'طماطم',
      units: [{ name: 'كيلو', price: 0.800 }],
      quantity: 200,
      active: true,
      category: 'خضار',
      images: ['https://images.unsplash.com/photo-1546470427-e5380e2d2b8d?w=400&h=400&fit=crop&crop=center']
    },
    {
      id: 5,
      name: 'خيار',
      units: [{ name: 'كيلو', price: 0.600 }],
      quantity: 180,
      active: true,
      category: 'خضار',
      images: ['https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop&crop=center']
    },
    {
      id: 6,
      name: 'خس',
      units: [{ name: 'حبة', price: 0.500 }],
      quantity: 100,
      active: true,
      category: 'ورقيات',
      images: ['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop&crop=center']
    }
  ];

  try {
    console.log('🌱 جاري إضافة البيانات الأساسية...');
    const productsRef = collection(db, 'products');
    
    for (const product of products) {
      await setDoc(doc(productsRef, product.id.toString()), {
        ...product,
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('✅ تم إضافة البيانات الأساسية بنجاح');
    
    // حفظ في localStorage أيضاً
    if (typeof window !== 'undefined') {
      localStorage.setItem('products', JSON.stringify(products));
      console.log('✅ تم حفظ المنتجات في localStorage');
    }
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات الأساسية:', error);
    return false;
  }
};

export const seedCategories = async () => {
  if (!db) {
    console.error('Firebase not initialized');
    return false;
  }

  const categories = [
    { id: 1, name: 'فواكه' },
    { id: 2, name: 'خضار' },
    { id: 3, name: 'ورقيات' }
  ];

  try {
    console.log('🌱 جاري إضافة التصنيفات...');
    const cateringRef = collection(db, 'cateringCategories');
    
    for (const category of categories) {
      await setDoc(doc(cateringRef, category.id.toString()), {
        ...category,
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('✅ تم إضافة التصنيفات بنجاح');
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('cateringCategories', JSON.stringify(categories));
      console.log('✅ تم حفظ التصنيفات في localStorage');
    }
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في إضافة التصنيفات:', error);
    return false;
  }
};
