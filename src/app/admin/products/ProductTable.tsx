"use client";
import { useState } from "react";
import ProductEditModal from "./ProductEditModal";
import { useEffect, useState as useStateReact } from "react";
import CateringTable from "../catering/CateringTable";

interface ProductUnit {
  name: string;
  price: number;
  originalPrice?: number; // السعر الأصلي قبل الخصم
}

interface Product {
  id: number;
  name: string;
  units: ProductUnit[];
  quantity: number;
  active: boolean;
  images?: string[];
  image?: string;
  category: string;
  categories?: string[];
  order?: number; // ترتيب المنتج
  hasOffer?: boolean; // هل المنتج عليه عرض
  discount?: number; // نسبة الخصم (مثال: 15 = 15%)
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadProducts = () => {
        const stored = window.localStorage.getItem('products');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            console.log('📦 تحميل المنتجات من localStorage:', parsed.length);

            // إضافة ترتيب افتراضي للمنتجات القديمة
            const withOrder = parsed.map((p: Product, index: number) => ({
              ...p,
              order: p.order ?? index
            }));

            // ترتيب المنتجات حسب الـ order
            withOrder.sort((a: Product, b: Product) => (a.order || 0) - (b.order || 0));
            setProducts(withOrder);
          } catch (error) {
            console.error('خطأ في تحليل بيانات المنتجات:', error);
            setProducts([]);
          }
        } else {
          console.log('⚠️ لا توجد منتجات في localStorage');
          setProducts([]);
        }
      };

      loadProducts();

      // مراقبة تغييرات localStorage
      const handleStorageChange = (e: StorageEvent) => {
        console.log('🔄 حدث storage:', e.key, e.newValue ? JSON.parse(e.newValue).length + ' منتج' : 'null');
        if (e.key === 'products' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            console.log('📦 تحديث المنتجات من storage:', parsed.length);

            // إضافة ترتيب افتراضي للمنتجات الجديدة
            const withOrder = parsed.map((p: Product, index: number) => ({
              ...p,
              order: p.order ?? index
            }));

            // ترتيب المنتجات حسب الـ order
            withOrder.sort((a: Product, b: Product) => (a.order || 0) - (b.order || 0));

            setProducts(withOrder);
          } catch (error) {
            console.error('خطأ في تحليل بيانات المنتجات:', error);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [categories, setCategories] = useStateReact<{ id: number; name: string }[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("cateringCategories");
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        setCategories([
          { id: 1, name: "فواكه" },
          { id: 2, name: "خضار" },
          { id: 3, name: "ورقيات" },
          { id: 4, name: "سلات الفواكه" },
        ]);
      }
    } catch {
      setCategories([
        { id: 1, name: "فواكه" },
        { id: 2, name: "خضار" },
        { id: 3, name: "ورقيات" },
        { id: 4, name: "سلات الفواكه" },
      ]);
    }
  }, []);

  const saveProductsToStorage = (prods: Product[]) => {
    console.log('💾 حفظ المنتجات في localStorage:', prods.length);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('products', JSON.stringify(prods));
      // إرسال حدث مخصص لتحديث الواجهة
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'products',
        newValue: JSON.stringify(prods),
        storageArea: window.localStorage
      }));
    }
  };

  const toggleActive = async (id: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
      console.log(`تم تغيير حالة المنتج ${id} إلى:`, updated.find(p => p.id === id)?.active);
      saveProductsToStorage(updated);
      
      // مزامنة يدوية فقط - معطلة تلقائياً
      // import('../../../lib/firebaseSync').then(({ syncAllDataToFirebase }) => {
      //   syncAllDataToFirebase().catch(console.error);
      // });
      
      return updated;
    });
  };

  const removeProduct = async (id: number) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProductsToStorage(updated);
      return updated;
    });
  };

  const updateProductCategories = async (productId: number, categoryName: string, isChecked: boolean) => {
    setProducts((prev) => {
      const updated = prev.map((product) => {
        if (product.id === productId) {
          let categories = product.categories || [product.category];
          
          if (isChecked) {
            if (!categories.includes(categoryName)) {
              categories = [...categories, categoryName];
            }
          } else {
            categories = categories.filter(cat => cat !== categoryName);
            if (categories.length === 0) {
              categories = [product.category];
            }
          }
          
          return {
            ...product,
            categories,
            category: categories[0]
          };
        }
        return product;
      });
      
      saveProductsToStorage(updated);
      return updated;
    });
  };

  // 🎁 تفعيل/إلغاء العرض
  const toggleOffer = async (productId: number) => {
    setProducts((prev) => {
      const updated = prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            hasOffer: !product.hasOffer,
            discount: product.hasOffer ? undefined : product.discount || 15
          };
        }
        return product;
      });
      
      saveProductsToStorage(updated);
      return updated;
    });
  };

  // 💰 تحديث نسبة الخصم
  const updateDiscount = async (productId: number, discount: number) => {
    if (discount < 0 || discount > 100) {
      alert('يجب أن تكون نسبة الخصم بين 0 و 100');
      return;
    }

    setProducts((prev) => {
      const updated = prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            discount: discount > 0 ? discount : undefined,
            hasOffer: discount > 0
          };
        }
        return product;
      });
      
      saveProductsToStorage(updated);
      return updated;
    });
  };

  const handleEditSave = async (updated: Product) => {
    setProducts((prev) => {
      const newProducts = prev.map((p) => (p.id === updated.id ? updated : p));
      saveProductsToStorage(newProducts);
      return newProducts;
    });
    setEditProduct(null);
  };

  const handleAddSave = async (newProduct: Product) => {
    console.log('🔄 بدء إضافة منتج جديد:', newProduct);
    setProducts((prev) => {
      console.log('📊 المنتجات الحالية:', prev.length);

      const maxId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) : 0;
      const maxOrder = prev.length > 0 ? Math.max(...prev.map(p => p.order || 0)) : -1;
      const newId = maxId + 1;
      const newOrder = maxOrder + 1;

      console.log('🆔 ID جديد:', newId, 'ترتيب جديد:', newOrder);

      const productWithId = { ...newProduct, id: newId, order: newOrder };
      const newProducts = [...prev, productWithId];

      console.log('✅ المنتجات بعد الإضافة:', newProducts.length);
      console.log('📦 المنتج المضاف:', productWithId);

      saveProductsToStorage(newProducts);

      // مزامنة يدوية فقط - معطلة تلقائياً
      // import('../../../lib/firebaseSync').then(({ syncAllDataToFirebase }) => {
      //   syncAllDataToFirebase().catch(console.error);
      // });

      return newProducts;
    });
    setAddModalOpen(false);
  };  // دوال Drag & Drop
  const handleDragStart = (e: React.DragEvent, productId: number) => {
    setDraggedItem(productId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    setProducts(prev => {
      const draggedIndex = prev.findIndex(p => p.id === draggedItem);
      const targetIndex = prev.findIndex(p => p.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newProducts = [...prev];
      const [draggedProduct] = newProducts.splice(draggedIndex, 1);
      newProducts.splice(targetIndex, 0, draggedProduct);
      
      // تحديث ترقيم الترتيب
      const reordered = newProducts.map((p, index) => ({ ...p, order: index }));
      
      saveProductsToStorage(reordered);
      return reordered;
    });
    
    setDraggedItem(null);
  };

  const filteredProducts = products.filter((product) => {
    const nameMatch = filterName === "" || product.name.toLowerCase().includes(filterName.toLowerCase());
    const statusMatch =
      filterStatus === "all" ||
      (filterStatus === "active" && product.active) ||
      (filterStatus === "inactive" && !product.active);
    return nameMatch && statusMatch;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded font-bold"
          onClick={() => setAddModalOpen(true)}
        >
          + إضافة منتج
        </button>
        <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-700 dark:text-green-200 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            إجمالي المنتجات: {products.length} | المعروضة: {filteredProducts.length}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-200 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            يمكنك سحب وإفلات المنتجات لتغيير ترتيبها في الموقع
          </p>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">بحث بالاسم</label>
          <input
            type="text"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            className="border rounded p-2 min-w-[180px]"
            placeholder="اسم المنتج... (فارغ لعرض الكل)"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">الحالة</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded p-2 min-w-[120px]"
          >
            <option value="all">الكل</option>
            <option value="active">مفعل</option>
            <option value="inactive">موقوف</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
      <table className="min-w-full border text-center rtl">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2">↕️</th>
            <th className="p-2">#</th>
            <th className="p-2">الصورة</th>
            <th className="p-2">اسم المنتج</th>
            <th className="p-2">الوحدات والأسعار</th>
            <th className="p-2">الكمية</th>
            <th className="p-2">الكاترينج</th>
            <th className="p-2">العروض 🎁</th>
            <th className="p-2">الحالة</th>
            <th className="p-2">تفعيل/إيقاف</th>
            <th className="p-2">تعديل</th>
            <th className="p-2">حذف</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => (
            <tr 
              key={`product-${product.id}-${index}`} 
              className={`border-b cursor-move hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                draggedItem === product.id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, product.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, product.id)}
            >
              <td className="p-2 text-gray-400">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                  </svg>
                </div>
              </td>
              <td className="p-2 font-bold text-gray-600">{index + 1}</td>
              <td className="p-2">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded mx-auto" />
                ) : product.image ? (
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded mx-auto" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto flex items-center justify-center">
                    <span className="text-gray-400 text-xs">لا توجد صورة</span>
                  </div>
                )}
              </td>
              <td className="p-2">{product.name}</td>
              <td className="p-2">
                {product.units.map((unit, idx) => (
                  <div key={idx} className="flex gap-2 items-center justify-center">
                    <span className="font-bold">{unit.name}:</span>
                    <span>{unit.price} د.ك</span>
                  </div>
                ))}
              </td>
              <td className="p-2">{product.quantity}</td>
              <td className="p-2">
                <div className="flex flex-wrap gap-1 max-w-48">
                  {categories.map((category) => {
                    const isSelected = (product.categories || [product.category]).includes(category.name);
                    return (
                      <label key={category.id} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => updateProductCategories(product.id, category.name, e.target.checked)}
                          className="w-3 h-3 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isSelected 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {category.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </td>
              <td className="p-2">
                <div className="flex flex-col gap-2 items-center min-w-[140px]">
                  {/* زر تفعيل/إلغاء العرض */}
                  <button
                    onClick={() => toggleOffer(product.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      product.hasOffer
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    {product.hasOffer ? "🎁 عرض مفعل" : "تفعيل عرض"}
                  </button>
                  
                  {/* إدخال نسبة الخصم */}
                  {product.hasOffer && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={product.discount || 0}
                        onChange={(e) => updateDiscount(product.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border rounded text-center text-sm"
                        placeholder="15"
                      />
                      <span className="text-xs text-gray-600">%</span>
                    </div>
                  )}
                  
                  {/* عرض نسبة الخصم */}
                  {product.hasOffer && product.discount && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold">
                      خصم {product.discount}%
                    </span>
                  )}
                </div>
              </td>
              <td className="p-2">
                {product.active ? (
                  <span className="text-green-600 font-bold">مفعل</span>
                ) : (
                  <span className="text-red-600 font-bold">موقوف</span>
                )}
              </td>
              <td className="p-2">
                <button
                  onClick={() => toggleActive(product.id)}
                  className={`px-3 py-1 rounded text-white font-bold transition-colors ${
                    product.active 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {product.active ? "إيقاف" : "تفعيل"}
                </button>
              </td>
              <td className="p-2">
                <button
                  onClick={() => setEditProduct(product)}
                  className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
                >
                  تعديل
                </button>
              </td>
              <td className="p-2">
                <button
                  onClick={() => removeProduct(product.id)}
                  className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editProduct && (
        <ProductEditModal
          product={editProduct}
          onSave={handleEditSave}
          onClose={() => setEditProduct(null)}
          categories={categories}
        />
      )}
      {addModalOpen && (
        <ProductEditModal
          product={{ 
            id: 0, 
            name: "", 
            units: [{ name: "", price: 0 }], 
            quantity: 1000, 
            active: true, 
            image: undefined, 
            category: categories[0]?.name || ""
          }}
          onSave={handleAddSave}
          onClose={() => setAddModalOpen(false)}
          categories={categories}
        />
      )}
      </div>
    </div>
  );
}
