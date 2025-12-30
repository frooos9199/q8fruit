import { db } from './firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

// إضافة المنتجات الافتراضية إلى Firebase
export const addDefaultProductsToFirebase = async () => {
  const defaultProducts = [
    {
      id: 1,
      name: "تفاح أحمر",
      units: [{ name: "كيلو", price: 1.250 }, { name: "حبة", price: 0.150 }],
      quantity: 100,
      active: true,
      category: "فواكه",
      images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 2,
      name: "موز",
      units: [{ name: "كيلو", price: 0.750 }, { name: "حبة", price: 0.100 }],
      quantity: 150,
      active: true,
      category: "فواكه",
      images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 3,
      name: "برتقال",
      units: [{ name: "كيلو", price: 1.000 }, { name: "حبة", price: 0.120 }],
      quantity: 120,
      active: true,
      category: "فواكه",
      images: ["https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 4,
      name: "خس",
      units: [{ name: "حبة", price: 0.500 }],
      quantity: 80,
      active: true,
      category: "ورقيات",
      images: ["https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 5,
      name: "طماطم",
      units: [{ name: "كيلو", price: 0.800 }],
      quantity: 200,
      active: true,
      category: "خضار",
      images: ["https://images.unsplash.com/photo-1546470427-e5380b6d0b66?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 6,
      name: "خيار",
      units: [{ name: "كيلو", price: 0.600 }],
      quantity: 150,
      active: true,
      category: "خضار",
      images: ["https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 7,
      name: "عنب أحمر",
      units: [{ name: "كيلو", price: 2.500 }],
      quantity: 50,
      active: true,
      category: "فواكه",
      images: ["https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 8,
      name: "جزر",
      units: [{ name: "كيلو", price: 0.400 }],
      quantity: 180,
      active: true,
      category: "خضار",
      images: ["https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 9,
      name: "بطاطس",
      units: [{ name: "كيلو", price: 0.350 }],
      quantity: 300,
      active: true,
      category: "خضار",
      images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&crop=center"]
    },
    {
      id: 10,
      name: "مانجو",
      units: [{ name: "كيلو", price: 3.000 }, { name: "حبة", price: 0.500 }],
      quantity: 40,
      active: true,
      category: "فواكه",
      images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop&crop=center"]
    }
  ];

  try {
    for (const product of defaultProducts) {
      await setDoc(doc(db, 'products', product.id.toString()), {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log('تم إضافة جميع المنتجات إلى Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في إضافة المنتجات:', error);
    return false;
  }
};

// إضافة التصنيفات الافتراضية
export const addDefaultCategoriesToFirebase = async () => {
  const defaultCategories = [
    { id: 1, name: "فواكه", products: [], image: undefined },
    { id: 2, name: "خضار", products: [], image: undefined },
    { id: 3, name: "ورقيات", products: [], image: undefined },
    { id: 4, name: "سلات الفواكه", products: [], image: undefined },
  ];

  try {
    await setDoc(doc(db, 'settings', 'categories'), {
      categories: defaultCategories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('تم إضافة التصنيفات إلى Firebase');
    return true;
  } catch (error) {
    console.error('خطأ في إضافة التصنيفات:', error);
    return false;
  }
};

// إعداد Firebase بالكامل
export const setupFirebaseData = async () => {
  try {
    console.log('جاري إعداد Firebase...');
    
    const productsSuccess = await addDefaultProductsToFirebase();
    const categoriesSuccess = await addDefaultCategoriesToFirebase();
    
    if (productsSuccess && categoriesSuccess) {
      console.log('✅ تم إعداد Firebase بنجاح!');
      return true;
    } else {
      console.log('❌ حدث خطأ في إعداد Firebase');
      return false;
    }
  } catch (error) {
    console.error('خطأ في إعداد Firebase:', error);
    return false;
  }
};