"use client";
import { useState } from "react";
import ProductEditModal from "./ProductEditModal";
import { useEffect, useState as useStateReact } from "react";
import CateringTable from "../catering/CateringTable";

interface ProductUnit {
  name: string;
  price: number;
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
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('products');
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        setProducts([]);
      }
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
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('products', JSON.stringify(prods));
    }
  };

  const toggleActive = (id: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
      saveProductsToStorage(updated);
      return updated;
    });
  };

  const removeProduct = (id: number) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProductsToStorage(updated);
      return updated;
    });
  };

  const updateProductCategories = (productId: number, categoryName: string, isChecked: boolean) => {
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

  const handleEditSave = (updated: Product) => {
    setProducts((prev) => {
      const newProducts = prev.map((p) => (p.id === updated.id ? updated : p));
      saveProductsToStorage(newProducts);
      return newProducts;
    });
    setEditProduct(null);
  };

  const handleAddSave = (newProduct: Product) => {
    setProducts((prev) => {
      const maxId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) : 0;
      const newProducts = [
        ...prev,
        { ...newProduct, id: maxId + 1 }
      ];
      saveProductsToStorage(newProducts);
      return newProducts;
    });
    setAddModalOpen(false);
  };

  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name.includes(filterName);
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
        <div>
          <label className="block text-sm font-bold mb-1">بحث بالاسم</label>
          <input
            type="text"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            className="border rounded p-2 min-w-[180px]"
            placeholder="اسم المنتج..."
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
      <table className="min-w-full border text-center">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2">#</th>
            <th className="p-2">الصورة</th>
            <th className="p-2">اسم المنتج</th>
            <th className="p-2">الوحدات والأسعار</th>
            <th className="p-2">الكمية</th>
            <th className="p-2">الكاترينج</th>
            <th className="p-2">الحالة</th>
            <th className="p-2">تفعيل/إيقاف</th>
            <th className="p-2">تعديل</th>
            <th className="p-2">حذف</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => (
            <tr key={`product-${product.id}-${index}`} className="border-b">
              <td className="p-2 font-bold text-gray-600">{index + 1}</td>
              <td className="p-2">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                ) : product.image ? (
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                ) : null}
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
                {product.active ? (
                  <span className="text-green-600 font-bold">مفعل</span>
                ) : (
                  <span className="text-red-600 font-bold">موقوف</span>
                )}
              </td>
              <td className="p-2">
                <button
                  onClick={() => toggleActive(product.id)}
                  className={`px-3 py-1 rounded text-white ${product.active ? "bg-red-500" : "bg-green-500"}`}
                >
                  {product.active ? "إيقاف" : "تفعيل"}
                </button>
              </td>
              <td className="p-2">
                <button
                  onClick={() => setEditProduct(product)}
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                >
                  تعديل
                </button>
              </td>
              <td className="p-2">
                <button
                  onClick={() => removeProduct(product.id)}
                  className="px-3 py-1 rounded bg-red-600 text-white"
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
