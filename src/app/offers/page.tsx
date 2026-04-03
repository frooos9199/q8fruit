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
    <div className="mx-auto max-w-6xl px-4 py-10 text-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          العروض 🎁
        </h1>
        <Link href="/" className="text-sm font-semibold text-emerald-700 transition-colors hover:text-teal-700 sm:text-base">
          العودة للرئيسية
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500">جاري تحميل العروض...</div>
      ) : offers.length === 0 ? (
        <div className="py-16 text-center text-slate-500">لا توجد عروض متاحة حالياً.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {offers.map((product) => {
            const image = product.images?.[0] || product.image || "";
            const unit = product.units?.[0];
            const price = unit?.price ?? 0;
            const discount = product.discount ?? 0;
            const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

            return (
              <div key={product.id} className="rounded-2xl border border-white/80 bg-white/92 p-3 shadow-[0_18px_40px_rgba(15,118,110,0.10)] sm:p-4">
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 sm:h-40">
                  {image ? (
                    <img src={image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">لا توجد صورة</div>
                  )}
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      خصم {discount}%
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="line-clamp-2 text-sm font-bold text-slate-800 sm:text-base">
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
