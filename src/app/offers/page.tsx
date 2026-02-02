"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getProductsFromFirebase } from "../../lib/firebaseSync";

interface Product {
  id: number | string;
  name: string;
  units: { name: string; price: number }[];
  quantity: number;
  active: boolean;
  images?: string[];
  image?: string;
  category: string;
  categories?: string[];
  hasOffer?: boolean;
  discount?: number;
}

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (typeof window === "undefined") return;
      try {
        const firebaseProducts = await getProductsFromFirebase();
        if (Array.isArray(firebaseProducts) && firebaseProducts.length > 0) {
          setProducts(firebaseProducts);
          window.localStorage.setItem("products", JSON.stringify(firebaseProducts));
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }

      const raw = window.localStorage.getItem("products");
      const parsed = raw ? JSON.parse(raw) : [];
      setProducts(Array.isArray(parsed) ? parsed : []);
      setLoading(false);
    };

    load();
  }, []);

  const offers = useMemo(
    () => products.filter((p) => p.active !== false && p.hasOffer),
    [products]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          العروض 🎁
        </h1>
        <Link href="/" className="text-sm sm:text-base text-green-700 hover:text-green-800 font-semibold">
          العودة للرئيسية
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">جاري تحميل العروض...</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">لا توجد عروض متاحة حالياً.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {offers.map((product) => {
            const image = product.images?.[0] || product.image || "";
            const unit = product.units?.[0];
            const price = unit?.price ?? 0;
            const discount = product.discount ?? 0;
            const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

            return (
              <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100 dark:border-slate-700">
                <div className="relative w-full h-32 sm:h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700">
                  {image ? (
                    <img src={image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">لا توجد صورة</div>
                  )}
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      خصم {discount}%
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100 line-clamp-2">
                    {product.name}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-green-600 font-bold text-sm sm:text-base">د.ك {finalPrice.toFixed(3)}</span>
                    {discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">{price.toFixed(3)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
