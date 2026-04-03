"use client";
import { useState, useRef, useMemo } from "react";
import ProductEditModal from "./ProductEditModal";
import { useEffect, useState as useStateReact } from "react";
import CateringTable from "../catering/CateringTable";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

interface ProductUnit {
  name: string;
  price: number;
  originalPrice?: number; // السعر الأصلي قبل الخصم
}

interface Product {
  id: number | string;
  docId?: string;
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

const getProductDocId = (product: Product) => {
  if (product.docId && String(product.docId).trim()) return String(product.docId);
  return String(product.id);
};

const getProductDisplayId = (product: Product) => {
  const numericId = Number(product.id);
  if (Number.isFinite(numericId)) {
    return numericId;
  }

  const numericDocId = Number(product.docId);
  if (Number.isFinite(numericDocId)) {
    return numericDocId;
  }

  return "-";
};

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unsubscribe: (() => void) | undefined;

    const loadProducts = async () => {
      try {
        const stored = window.localStorage.getItem('products');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('📦 عرض مؤقت من localStorage:', parsed.length);
          const withOrder = parsed.map((p: Product, index: number) => ({
            ...p,
            order: p.order ?? index
          }));
          withOrder.sort((a: Product, b: Product) => (a.order || 0) - (b.order || 0));
          setProducts(withOrder);
        }

        if (db) {
          try {
            const snapshot = await getDocs(collection(db, 'products'));
            const firebaseProducts = snapshot.docs.map((productDoc) => {
              const data = productDoc.data() as Record<string, unknown>;
              const resolvedId =
                typeof data.id === 'number' || typeof data.id === 'string'
                  ? data.id
                  : productDoc.id;

              return {
                ...data,
                id: resolvedId,
                docId: productDoc.id,
                order: typeof data.order === 'number' ? data.order : Number(data.order ?? 0) || 0,
              } as Product;
            });
            
            firebaseProducts.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            console.log('🔥 تحميل من Firebase:', firebaseProducts.length);

            setProducts(firebaseProducts);
            window.localStorage.setItem('products', JSON.stringify(firebaseProducts));
            window.localStorage.setItem('productsLastUpdate', new Date().toISOString());
            setLoading(false);
          } catch (error) {
            console.error('❌ خطأ في تحميل Firebase:', error);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل المنتجات:', error);
        setLoading(false);
      }
    };

    loadProducts();

    // تنظيف عند إلغاء الكومبوننت
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  // فلتر بحث احترافي (debounced)
  const [inputValue, setInputValue] = useState(""); // النص الفوري
  const [search, setSearch] = useState(""); // النص الفعلي للبحث
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
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

  const saveProductsToStorage = async (prods: Product[]) => {
    console.log('💾 حفظ المنتجات في localStorage:', prods.length);
    if (typeof window !== 'undefined') {
      // حفظ في localStorage فوراً
      window.localStorage.setItem('products', JSON.stringify(prods));
      window.localStorage.setItem('productsLastUpdate', new Date().toISOString());
      
      // 🔥 مزامنة فورية مع Firebase
      try {
        const { syncProductsToFirebase } = await import('../../../lib/firebaseSync');
        await syncProductsToFirebase(prods);
        console.log('✅ تم مزامنة Firebase فوراً');
      } catch (firebaseError) {
        console.error('❌ خطأ في مزامنة Firebase:', firebaseError);
      }
    }
  };

  const toggleActive = async (docId: string) => {
    console.log(`🔄 تغيير حالة المنتج ${docId}`);
    
    setProducts((prev) => {
      const updated = prev.map((p) => (getProductDocId(p) === docId ? { ...p, active: !p.active } : p));
      const updatedProduct = updated.find(p => getProductDocId(p) === docId);
      
      console.log(`✅ حالة جديدة للمنتج ${docId}:`, updatedProduct?.active);
      
      // حفظ فوري في localStorage و Firebase
      saveProductsToStorage(updated);
      
      return updated;
    });
  };

  const removeProduct = async (docId: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج؟`)) return;
    
    console.log(`🗑️ بدء حذف المنتج ${docId}`);
    
    // حذف من localStorage أولاً (عرض فوري)
    setProducts((prev) => {
      const updated = prev.filter((p) => getProductDocId(p) !== docId);
      saveProductsToStorage(updated);
      console.log(`✅ تم حذف المنتج ${docId} من localStorage`);
      return updated;
    });
    
    // 🔥 حذف من Firebase في الخلفية
    if (db) {
      try {
        const productRef = doc(db, 'products', docId);
        await deleteDoc(productRef);
        console.log(`✅ تم حذف المنتج ${docId} من Firebase`);
        alert('✅ تم حذف المنتج بنجاح!');
      } catch (err) {
        console.error('❌ خطأ في حذف المنتج من Firebase:', err);
        alert('⚠️ تم حذف المنتج محلياً، لكن فشل الحذف من Firebase. قد تحتاج لإعادة المحاولة.');
      }
    } else {
      alert('✅ تم حذف المنتج بنجاح!');
    }
  };

  const updateProductCategories = async (docId: string, categoryName: string, isChecked: boolean) => {
    setProducts((prev) => {
      const updated = prev.map((product) => {
        if (getProductDocId(product) === docId) {
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
      
      // 🔥 تحديث Firebase أيضاً
      const updatedProduct = updated.find(p => getProductDocId(p) === docId);
      if (updatedProduct && db) {
        const productRef = doc(db, 'products', getProductDocId(updatedProduct));
        updateDoc(productRef, {
          categories: updatedProduct.categories,
          category: updatedProduct.category
        }).catch(err => console.error('❌ خطأ في تحديث الفئات في Firebase:', err));
      }
      
      return updated;
    });
  };

  // 🎁 تفعيل/إلغاء العرض
  const toggleOffer = async (docId: string) => {
    setProducts((prev) => {
      const updated = prev.map((product) => {
        if (getProductDocId(product) === docId) {
          return {
            ...product,
            hasOffer: !product.hasOffer,
            discount: product.hasOffer ? undefined : product.discount || 15
          };
        }
        return product;
      });
      
      saveProductsToStorage(updated);
      
      // 🔥 حفظ في Firebase للتطبيق
      const updatedProduct = updated.find(p => getProductDocId(p) === docId);
      if (updatedProduct && db) {
        const productRef = doc(db, 'products', getProductDocId(updatedProduct));
        updateDoc(productRef, {
          hasOffer: updatedProduct.hasOffer || false,
          discount: updatedProduct.discount || 0
        }).catch(err => console.error('❌ خطأ في تحديث Firebase:', err));
      }
      
      return updated;
    });
  };

  const updateDiscount = async (docId: string, discount: number) => {
    if (discount < 0 || discount > 100) {
      alert('يجب أن تكون نسبة الخصم بين 0 و 100');
      return;
    }

    console.log(`💰 تحديث خصم المنتج ${docId} إلى ${discount}%`);

    setProducts((prev) => {
      const updated = prev.map((product) => {
        if (getProductDocId(product) === docId) {
          return {
            ...product,
            discount: discount > 0 ? discount : undefined,
            hasOffer: discount > 0
          };
        }
        return product;
      });
      
      // حفظ فوري
      saveProductsToStorage(updated);
      
      return updated;
    });
  };

  const handleEditSave = async (updated: Product) => {
    console.log('💾 حفظ تعديل المنتج:', updated);
    
    try {
      setProducts((prev) => {
        const newProducts = prev.map((p) => (p.id === updated.id ? updated : p));
        saveProductsToStorage(newProducts);
        return newProducts;
      });
      
      // 🔥 حفظ في Firebase فوراً مع جميع البيانات
      if (db) {
        const productRef = doc(db, 'products', getProductDocId(updated));
        await setDoc(productRef, {
          ...updated,
          docId: getProductDocId(updated),
          updatedAt: new Date().toISOString()
        }, { merge: false });
        
        console.log('✅ تم حفظ المنتج في Firebase:', updated.id);
        window.localStorage.setItem('productsLastUpdate', new Date().toISOString());
        alert(`✅ تم حفظ تعديلات المنتج "${updated.name}" بنجاح!`);
      } else {
        alert(`✅ تم حفظ تعديلات المنتج "${updated.name}" محلياً!`);
      }
      
      setEditProduct(null);
    } catch (err) {
      console.error('❌ خطأ في حفظ المنتج:', err);
      alert('❌ خطأ في حفظ التعديلات. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleAddSave = async (newProduct: Product) => {
    console.log('🔄 بدء إضافة منتج جديد:', newProduct);
    setProducts((prev) => {
      console.log('📊 المنتجات الحالية:', prev.length);

      const maxId = prev.length > 0
        ? Math.max(...prev.map((p) => {
            const numericId = Number(p.id);
            return Number.isFinite(numericId) ? numericId : 0;
          }))
        : 0;
      const maxOrder = prev.length > 0 ? Math.max(...prev.map(p => p.order || 0)) : -1;
      const newId = maxId + 1;
      const newOrder = maxOrder + 1;

      console.log('🆔 ID جديد:', newId, 'ترتيب جديد:', newOrder);

      const productWithId = { ...newProduct, id: newId, docId: String(newId), order: newOrder };
      const newProducts = [...prev, productWithId];

      console.log('✅ المنتجات بعد الإضافة:', newProducts.length);
      console.log('📦 المنتج المضاف:', productWithId);

      saveProductsToStorage(newProducts);

      // 🔥 إضافة المنتج إلى Firebase مباشرة
      if (db) {
        const productRef = doc(db, 'products', newId.toString());
        setDoc(productRef, {
          name: productWithId.name,
          units: productWithId.units,
          category: productWithId.category,
          categories: productWithId.categories || [productWithId.category],
          active: productWithId.active !== false, // true by default
          image: productWithId.image || '',
          images: productWithId.images || [],
          hasOffer: productWithId.hasOffer || false,
          discount: productWithId.discount || 0,
          order: newOrder
        }).catch(async (err) => {
          console.error('❌ خطأ في إضافة المنتج لـ Firebase:', err);
        });
      }

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

  // فلترة المنتجات بكفاءة
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const nameMatch = q === "" || product.name.toLowerCase().includes(q);
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "active" && product.active) ||
        (filterStatus === "inactive" && !product.active);
      return nameMatch && statusMatch;
    });
  }, [products, search, filterStatus]);

  return (
    <div>
      {loading && (
        <div className="mb-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-cyan-800">
          <p className="font-bold">🔄 جاري التحميل من Firebase...</p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded font-bold"
          onClick={() => setAddModalOpen(true)}
        >
          + إضافة منتج
        </button>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            إجمالي المنتجات: {products.length} | المعروضة: {filteredProducts.length}
          </p>
        </div>
        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
          <p className="flex items-center gap-2 text-sm text-cyan-700">
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
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setSearching(true);
              if (searchTimeout.current) clearTimeout(searchTimeout.current);
              searchTimeout.current = setTimeout(() => {
                setSearch(e.target.value);
                setSearching(false);
              }, 350);
            }}
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
        {searching ? (
          <div className="text-center text-green-600 font-bold py-6">جاري البحث...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 font-bold py-6">لا توجد منتجات مطابقة</div>
        ) : (
          <table className="min-w-full border text-center rtl">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
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
                  className={`border-b border-slate-200 cursor-move transition-colors hover:bg-emerald-50/60 ${
                    draggedItem === Number(product.id) ? 'opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, Number(product.id))}
                  onDragOver={handleDragOver}
                >
                  <td className="p-2 font-bold text-gray-600">{index + 1}</td>
                  <td className="p-2">{getProductDisplayId(product)}</td>
                  <td className="p-2">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded mx-auto" />
                    ) : product.image ? (
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded mx-auto" />
                    ) : (
                      <span className="text-gray-400">بدون صورة</span>
                    )}
                  </td>
                  <td className="p-2">{product.name}</td>
                  <td className="p-2">
                    {product.units.map((unit, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span>{unit.name}</span>
                        <span className="text-green-600 font-bold">{unit.price} د.ك</span>
                      </div>
                    ))}
                  </td>
                  <td className="p-2">{product.quantity}</td>
                  <td className="p-2">
                    {categories.map((category) => {
                      const isSelected = (product.categories || [product.category]).includes(category.name);
                      return (
                        <label key={category.id} className="inline-flex items-center mr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => updateProductCategories(getProductDocId(product), category.name, e.target.checked)}
                          />
                          <span className="ml-1">{category.name}</span>
                        </label>
                      );
                    })}
                  </td>
                  <td className="p-2">
                    <button
                      className={`px-2 py-1 rounded ${product.hasOffer ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => toggleOffer(getProductDocId(product))}
                    >
                      {product.hasOffer ? "🎁 عرض مفعل" : "تفعيل عرض"}
                    </button>
                    {product.hasOffer && (
                      <div className="mt-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={product.discount || 0}
                          onChange={(e) => updateDiscount(getProductDocId(product), parseInt(e.target.value) || 0)}
                          className="border rounded p-1 w-16 text-center"
                        />
                        <span className="ml-1">%</span>
                      </div>
                    )}
                    {product.hasOffer && product.discount && (
                      <div className="text-xs text-green-700 mt-1">خصم {product.discount}%</div>
                    )}
                  </td>
                  <td className="p-2">
                    <span className={product.active ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {product.active ? "مفعل" : "موقوف"}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded"
                      onClick={() => toggleActive(getProductDocId(product))}
                    >
                      {product.active ? "إيقاف" : "تفعيل"}
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                      onClick={() => setEditProduct(product)}
                    >
                      تعديل
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => removeProduct(getProductDocId(product))}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
  );
}
