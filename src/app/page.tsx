"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  clearProductsCache,
  getBannersFromFirebase,
  getCategoriesFromFirebase,
  getLogoFromFirebase,
  getProductsFromFirebase,
  loadAllDataFromFirebase,
} from "../lib/firebaseSync";
import { syncProductImages } from "../lib/imageSync";

// تعريفات TypeScript أعلى الملف
interface Product {
  id: number | string;
  name: string;
  units: { name: string; price: number }[];
  quantity: number;
  active: boolean;
  isHidden?: boolean;
  images?: string[]; // صور متعددة
  image?: string; // دعم خلفي للصورة القديمة
  category: string;
  categories?: string[]; // تصنيفات متعددة
}

interface Unit {
  name: string;
  price: number;
}

interface CateringCategory {
  id: number;
  name: string;
  products?: string[];
  image?: string;
}

interface ProductCardProps {
  product: Product;
  quantities: { [productId: string]: number };
  handleQuantityChange: (productId: number | string, value: number) => void;
  small?: boolean;
}

function ProductCard({ product, quantities, handleQuantityChange, small = false }: ProductCardProps) {
  const quantity = quantities[String(product.id)] || 1;
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);
  const selectedUnit = product.units[selectedUnitIdx] || product.units[0];

  // إضافة المنتج للسلة
  const handleAddToCart = () => {
    if (typeof window === 'undefined') return;
    const cartRaw = window.localStorage.getItem('cart');
    let cart = [];
    try {
      cart = cartRaw ? JSON.parse(cartRaw) : [];
    } catch {
      cart = [];
    }
    const unitName = selectedUnit?.name || '';
    const price = selectedUnit?.price || 0;
    const existingIndex = cart.findIndex((item:any) => item.id == product.id && item.unit === unitName);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      // استخدام أول صورة من images إذا وجدت، وإلا image القديمة
      let cartImage = product.image || '';
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        cartImage = product.images[0];
      }
      cart.push({
        id: product.id,
        name: product.name,
        image: cartImage,
        unit: unitName,
        price: price,
        quantity: quantity,
      });
    }
    window.localStorage.setItem('cart', JSON.stringify(cart));
  };

  // سلايدر صور تلقائي
  const [imgIdx, setImgIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    if (product.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setImgIdx((prev) => (prev + 1) % product.images!.length);
          setFade(true);
        }, 150); // مدة التلاشي
      }, 3000); // كل 3 ثواني
      return () => clearInterval(interval);
    }
  }, [product.images]);

  return (
    <div
      className={`group flex flex-col items-stretch rounded-xl border border-white/80 bg-white/92 p-3 shadow-[0_18px_40px_rgba(15,118,110,0.10)] backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:rounded-2xl sm:p-4`}
    >
      <div className={`${small ? 'w-full h-32 xs:h-36 sm:h-40 mb-2 sm:mb-3' : 'w-40 h-40 mb-4'} mx-auto rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center relative`}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[imgIdx]}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover object-center rounded-xl sm:rounded-2xl group-hover:scale-105 transition-all duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 0.3s, transform 0.5s', objectPosition: 'center' }}
            onError={(e) => {
              // في حالة فشل تحميل الصورة، جرب الصورة القديمة
              if (product.image) {
                (e.target as HTMLImageElement).src = product.image;
              }
            }}
          />
        ) : product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover object-center rounded-xl sm:rounded-2xl group-hover:scale-105 transition-all duration-500" 
            style={{ objectPosition: 'center' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className={`font-bold ${small ? 'text-sm sm:text-base mb-2' : 'text-lg mb-3'} text-center text-slate-800 line-clamp-2`}>{product.name}</div>
      {/* اختيار الوحدة */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
        {product.units.map((unit, idx) => (
          <button
            key={unit.name}
            type="button"
            className={`flex items-center gap-1 text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border-2 transition-all duration-200 focus:outline-none shadow-sm min-w-[44px] sm:min-w-[52px] justify-center
              ${idx === selectedUnitIdx
                ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 text-emerald-700 shadow-md'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50'}
            `}
            onClick={() => setSelectedUnitIdx(idx)}
          >
            {idx === selectedUnitIdx && (
              <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.2"/><circle cx="10" cy="10" r="4" fill="currentColor" /></svg>
            )}
            <span className="text-xs">{unit.name}</span>
          </button>
        ))}
      </div>
      {/* اختيار العدد */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 select-none">
        <button
          type="button"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-base sm:text-lg font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={() => handleQuantityChange(product.id, Math.max(1, quantity - 1))}
          aria-label="نقص العدد"
        >
          -
        </button>
        <span className="w-8 sm:w-10 text-center text-lg font-bold text-slate-800 sm:text-xl">{quantity}</span>
        <button
          type="button"
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base sm:text-lg font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={() => handleQuantityChange(product.id, Math.min(product.quantity, quantity + 1))}
          aria-label="زيادة العدد"
        >
          +
        </button>
      </div>
      {/* صف السعر والوحدة */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 mb-3 sm:mb-4 px-1">
        <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center flex-wrap">
          <span className="text-sm sm:text-base">د.ك</span>
          <span className="mx-1" />
          <span>{(selectedUnit?.price * quantity).toFixed(3)}</span>
          {quantity > 1 && (
            <span className="ml-1 whitespace-nowrap rounded-full bg-slate-100 px-1 py-0.5 text-xs text-slate-500 sm:ml-2 sm:px-2">({selectedUnit?.price} × {quantity})</span>
          )}
        </span>
        {selectedUnit?.name && (
          <span className="flex items-center gap-1 rounded-full border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-2 py-1 text-xs font-bold text-emerald-700 shadow-sm transition-all sm:px-3">
            <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.2"/><circle cx="10" cy="10" r="4" fill="currentColor" /></svg>
            <span className="text-xs">{selectedUnit.name}</span>
          </span>
        )}
      </div>
      <button onClick={handleAddToCart} className={`mt-auto px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group`}>
        <span className="ml-1 sm:ml-2">أضف للسلة</span>
        <svg width="18" height="18" className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-13z"/><circle cx="9" cy="21" r="1" fill="currentColor"/><circle cx="18" cy="21" r="1" fill="currentColor"/></svg>
      </button>
      {/* زر مشاركة واتساب */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`🍎 ${product.name}\n💰 ${selectedUnit?.price} د.ك / ${selectedUnit?.name}\n\n🛒 اطلب من فكهاني الكويت:\nhttps://www.q8fruit.com`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 transition-all hover:bg-green-100 active:scale-95"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        شارك على واتساب
      </a>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [logo, setLogo] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{uid?: string; name?: string; email?: string} | null>(null);
  // البنرات
  const [banners, setBanners] = useState<string[]>([]);

  // دالة لتغيير كمية منتج معين
  const handleQuantityChange = (productId: number | string, value: number) => {
    setQuantities((prev) => ({ ...prev, [String(productId)]: value }));
  };

  const fetchProducts = async () => {
    if (typeof window !== "undefined") {
      try {
        console.log('🔄 بدء جلب المنتجات من Firebase...');

        const firebaseProducts = await getProductsFromFirebase();
        const validFirebaseProducts = Array.isArray(firebaseProducts)
          ? (firebaseProducts as Product[]).filter(
              (p) =>
                typeof p === "object" &&
                p !== null &&
                (typeof p.id === "number" || typeof p.id === "string") &&
                typeof p.name === "string" &&
                Array.isArray(p.units) &&
                p.units.length > 0 &&
                p.units.every(
                  (u: Unit) =>
                    typeof u === "object" &&
                    u !== null &&
                    typeof u.name === "string" &&
                    typeof u.price === "number"
                ) &&
                p.active !== false &&
                p.isHidden !== true &&
                typeof p.category === "string"
            )
          : [];

        console.log(`✅ عدد المنتجات المعتمدة من Firebase: ${validFirebaseProducts.length}`);
        setProducts(validFirebaseProducts);
        clearProductsCache();
        return;
      } catch (error) {
        console.error('❌ خطأ في جلب المنتجات:', error);
        clearProductsCache();
        setProducts([]);
      }
    }
  };

  // عناصر المنيو الجانبي
  type MenuLink = { href: string; label: string; onClick?: () => void };
  const [menuLinks, setMenuLinks] = useState<MenuLink[]>([
    { href: "/login", label: "تسجيل الدخول" },
    { href: "/register", label: "تسجيل حساب جديد" },
    // يمكن إضافة روابط أخرى هنا لاحقاً
  ]);

  // تحديث روابط المنيو حسب حالة المستخدم
  useEffect(() => {
    if (currentUser && !isAdmin) {
      setMenuLinks([
        { href: "/account", label: "حسابي" },
        { href: "/invoices", label: "فواتيري" },
        { href: "#logout", label: "تسجيل الخروج", onClick: () => handleLogout() },
      ]);
    } else if (currentUser && isAdmin) {
      setMenuLinks([
        { href: "/admin", label: "لوحة الإدارة" },
        { href: "#logout", label: "تسجيل الخروج", onClick: () => handleLogout() },
      ]);
    } else {
      setMenuLinks([
        { href: "/login", label: "تسجيل الدخول" },
        { href: "/register", label: "تسجيل حساب جديد" },
      ]);
    }
  }, [currentUser, isAdmin]);

  // دالة تسجيل الخروج
  function handleLogout() {
    if (typeof window !== "undefined") {
      // استخدام Firebase Auth للخروج
      import('../lib/auth').then(({ logoutUser }) => {
        logoutUser().then(() => {
          window.localStorage.removeItem("currentUser");
          window.localStorage.removeItem("isAdmin");
          window.location.href = "/";
        }).catch(console.error);
      });
    }
  }
  
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  
  // دالة لجلب التصنيفات
  const fetchCategories = async () => {
    if (typeof window !== 'undefined') {
      try {
        const firebaseCategories = await getCategoriesFromFirebase();
        if (Array.isArray(firebaseCategories) && firebaseCategories.length > 0) {
          const simplifiedCategories = firebaseCategories.map((cat: CateringCategory) => ({
            id: cat.id,
            name: cat.name
          }));
          setCategories(simplifiedCategories);
          window.localStorage.setItem('cateringCategories', JSON.stringify(firebaseCategories));
          return;
        }

        // fallback إلى localStorage
        const storedCategories = window.localStorage.getItem('cateringCategories');
        if (storedCategories) {
          try {
            const parsed = JSON.parse(storedCategories);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const simplifiedCategories = parsed.map((cat: CateringCategory) => ({
                id: cat.id,
                name: cat.name
              }));
              setCategories(simplifiedCategories);
              return;
            }
          } catch {
            // ignore
          }
        }

        setCategories([]);
      } catch (error) {
        // في حالة الخطأ، لا تعرض أي تصنيفات إطلاقاً
        setCategories([]);
      }
    }
  };

  const fetchBranding = async () => {
    if (typeof window === 'undefined') return;

    try {
      const logoFromFirebase = await getLogoFromFirebase();
      if (logoFromFirebase) {
        setLogo(logoFromFirebase);
        window.localStorage.setItem('siteLogo', logoFromFirebase);
      } else {
        const storedLogo = window.localStorage.getItem("siteLogo");
        if (storedLogo) setLogo(storedLogo);
      }

      const bannersFromFirebase = await getBannersFromFirebase();
      if (Array.isArray(bannersFromFirebase) && bannersFromFirebase.length > 0) {
        setBanners(bannersFromFirebase);
        window.localStorage.setItem('banners', JSON.stringify(bannersFromFirebase));
      } else {
        const storedBanners = window.localStorage.getItem("banners");
        if (storedBanners) {
          try {
            const parsed = JSON.parse(storedBanners);
            setBanners(Array.isArray(parsed) ? parsed : []);
          } catch {
            setBanners([]);
          }
        } else {
          setBanners([]);
        }
      }
    } catch {
      // لا تفعل شيئاً إضافياً
    }
  };
  
  useEffect(() => {
    // لا تعرض المنتجات الافتراضية - انتظر البيانات الحقيقية
    setProducts([]);
    setCategories([]);

    if (typeof window !== "undefined") {
      const loadDataSequentially = async () => {
        try {
          console.log('🔄 بدء تحميل البيانات...');
          await loadAllDataFromFirebase();
          await syncProductImages();
          await fetchProducts();
          await fetchCategories();
          await fetchBranding();
        } catch (error) {
          console.error('❌ خطأ في تحميل البيانات:', error);
          setProducts([]);
          setCategories([]);
        }
      };

      loadDataSequentially();

      setIsAdmin(window.localStorage.getItem("isAdmin") === "true");
      const userStr = window.localStorage.getItem("currentUser");
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }

      const storedBanners = window.localStorage.getItem("banners");
      if (storedBanners) {
        try {
          const parsed = JSON.parse(storedBanners);
          setBanners(Array.isArray(parsed) ? parsed : []);
        } catch {
          setBanners([]);
        }
      } else {
        setBanners([]);
      }

      const updateCartCount = () => {
        const cartRaw = window.localStorage.getItem("cart");
        if (cartRaw) {
          try {
            const cart = JSON.parse(cartRaw);
            setCartCount(Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0);
          } catch {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      };

      updateCartCount();
      const cartObserver = setInterval(() => {
        updateCartCount();
      }, 1000);

      const onStorage = (e: StorageEvent) => {
        if (e.key === "products") {
          if (e.newValue === null || e.newValue === '') {
            console.log('تم مسح المنتجات من localStorage');
            setProducts([]);
          } else {
            fetchProducts();
          }
        }
        if (e.key === "siteLogo") {
          setLogo(e.newValue);
        }
        if (e.key === "isAdmin") setIsAdmin(e.newValue === "true");
        if (e.key === "cateringCategories") {
          fetchCategories();
        }
        if (e.key === "currentUser") {
          try {
            setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
          } catch {
            setCurrentUser(null);
          }
        }
        if (e.key === "banners") {
          try {
            const parsed = e.newValue ? JSON.parse(e.newValue) : [];
            setBanners(Array.isArray(parsed) ? parsed : []);
          } catch {
            setBanners([]);
          }
        }
      };

      window.addEventListener("storage", onStorage);
      return () => {
        clearInterval(cartObserver);
        window.removeEventListener("storage", onStorage);
      };
    }
  }, []);

  // مراقبة التحديثات على التصنيفات
  useEffect(() => {
    fetchCategories();
    
    const categoryObserver = setInterval(() => {
      fetchCategories();
    }, 1000);
    
    return () => clearInterval(categoryObserver);
  }, []);

  // تجميع المنتجات حسب التصنيف
  const grouped: Record<string, Product[]> = {};
  products.forEach((product) => {
    if (!product.active) return;
    const productCategories = product.categories || [product.category];
    productCategories.forEach(categoryName => {
      if (!grouped[categoryName]) grouped[categoryName] = [];
      if (!grouped[categoryName].find(p => p.id === product.id)) {
        grouped[categoryName].push(product);
      }
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffdf6] via-[#f7fbf7] to-[#eef7f2] font-sans">
      {/* رسالة ترحيبية */}
      {currentUser?.name && (
        <div className="w-full text-center py-3 sm:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-sm sm:text-lg shadow-lg">
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            أهلاً وسهلاً: {currentUser.name}
          </span>
        </div>
      )}
      {/* منيو جانبي والهيدر كما هو ... */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex">
          <div className="flex h-full w-72 flex-col gap-4 border-r-4 border-emerald-500 bg-white/95 p-6 shadow-2xl animate-slideInRight backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">القائمة</h3>
              <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-blue-500 text-3xl transition-colors">&times;</button>
            </div>
            {menuLinks.map((link) => (
              link.onClick ? (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-right text-lg font-semibold text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:text-emerald-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  {link.label}
                </button>
              ) : (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-lg font-semibold text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 hover:text-emerald-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {link.label}
                </Link>
              )
            ))}
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
      <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-emerald-100 bg-white/92 px-3 py-3 shadow-lg backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => setMenuOpen(true)} className="p-2 sm:p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation">
            <svg width="18" height="18" className="sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          {/* أيقونة موبايل ورقم التواصل */}
          <a href="tel:+96598899426" className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all touch-manipulation">
            <svg width="12" height="12" className="sm:w-[16px] sm:h-[16px]" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4h4l2 5-1.5 1.5a7 7 0 0 0 7 7L17 17l5 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
            <span dir="ltr" className="text-xs sm:text-sm">98899426</span>
          </a>
        </div>
        <div className="flex-1 flex justify-center">
          {logo ? (
            <div className="relative">
              <img src={logo} alt="شعار الموقع" className="w-10 h-10 sm:w-16 sm:h-16 object-contain rounded-full shadow-xl border-2 sm:border-4 border-white bg-white" />
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur opacity-25"></div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-base sm:text-2xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">فكهاني الكويت</h1>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">طازج • طبيعي • صحي</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {/* زر الإدارة يظهر فقط للأدمن */}
          {isAdmin && (
            <Link href="/admin" className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-xs sm:text-sm hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation">
              <span className="flex items-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">الإدارة</span>
              </span>
            </Link>
          )}
          <Link href="/cart" className="relative p-2 sm:p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation">
            <svg width="18" height="18" className="sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-13z"/><circle cx="9" cy="21" r="1" fill="currentColor"/><circle cx="18" cy="21" r="1" fill="currentColor"/></svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white animate-pulse">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </Link>
        </div>
      </header>

      {/* بانر ديناميكي */}
      {banners.length > 0 && (
        <div className="max-w-6xl mx-auto my-4 sm:my-12 px-2 sm:px-4">
          <div className="relative rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <img src={banners[0]} alt="بانر رئيسي" className="w-full h-28 sm:h-40 md:h-56 object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white">
              <h2 className="text-sm sm:text-xl md:text-2xl font-bold mb-1">أطيب الفواكه والخضار</h2>
              <p className="text-xs sm:text-sm md:text-base opacity-90">طازج يومياً من المزرعة إلى بيتك</p>
            </div>
          </div>
        </div>
      )}

      {/* عرض المجموعات (التصنيفات) من localStorage */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-6 sm:mt-16">
        {categories.map((cat) => (
          <section key={cat.name} className="mb-6 sm:mb-16">
            <div className="text-center mb-3 sm:mb-8">
              <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {cat.name}
              </h2>
              <div className="w-12 sm:w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-6">
              {(grouped[cat.name] && grouped[cat.name].length > 0) ? (
                grouped[cat.name].map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantities={quantities}
                    handleQuantityChange={handleQuantityChange}
                    small={true}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-6 sm:py-8">
                  <div className="text-4xl sm:text-6xl mb-2">😢</div>
                  <p className="text-sm sm:text-base">لا توجد منتجات في هذا القسم حالياً.</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>


      <footer className="mt-16 bg-gradient-to-r from-[#163f36] via-[#18584a] to-[#1b6f61] py-8 text-white sm:mt-24 sm:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="text-center md:text-right">
              <h3 className="mb-3 text-lg font-bold text-emerald-200 sm:mb-4 sm:text-xl">فكهاني الكويت</h3>
              <p className="text-sm leading-relaxed text-emerald-50/90">
                متجرك المفضل للفواكه والخضار الطازجة
                <br />
                جودة عالية وأسعار منافسة
              </p>
            </div>
            <div className="text-center">
              <h4 className="mb-3 text-base font-semibold text-cyan-200 sm:mb-4 sm:text-lg">تواصل معنا</h4>
              <div className="space-y-2">
                <a href="tel:+96598899426" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/12 px-4 py-2 font-bold text-cyan-100 transition-all hover:bg-white/20 touch-manipulation">
                  <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4h4l2 5-1.5 1.5a7 7 0 0 0 7 7L17 17l5 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
                  <span dir="ltr" className="text-sm sm:text-base">98899426</span>
                </a>
                <a href="https://wa.me/96598899426" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/12 px-4 py-2 font-bold text-emerald-100 transition-all hover:bg-white/20 touch-manipulation">
                  <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  <span className="text-sm sm:text-base">واتساب</span>
                </a>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="mb-3 text-base font-semibold text-emerald-200 sm:mb-4 sm:text-lg">حمّل التطبيق</h4>
              <div className="space-y-3 mb-4">
                {/* Google Play */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.fruitq8.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-white transition-all hover:bg-black/50 border border-white/10"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76a2 2 0 0 0 2.25-.24l.06-.05 12.6-7.28-2.74-2.74-12.17 10.31zm-1.1-20.5C2 3.6 2 3.96 2 4.35v15.3c0 .4.04.76.12 1.1L14.4 8.5 2.08 3.26zM20.5 10.5l-2.75-1.59-3.07 3.09 3.07 3.08 2.78-1.61a1.98 1.98 0 0 0 0-2.97zM5.43.48a2 2 0 0 0-2.25-.24L15.5 11.5 18.24 8.74 5.43.48z"/></svg>
                  <div className="text-right">
                    <div className="text-[10px] text-white/70 leading-none">GET IT ON</div>
                    <div className="text-sm font-bold leading-tight">Google Play</div>
                  </div>
                </a>
                {/* App Store */}
                <a
                  href="https://apps.apple.com/us/app/q8fruit-%D9%81%D9%83%D9%87%D8%A7%D9%86%D9%89-%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA/id1487406440"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-white transition-all hover:bg-black/50 border border-white/10"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="text-right">
                    <div className="text-[10px] text-white/70 leading-none">Download on the</div>
                    <div className="text-sm font-bold leading-tight">App Store</div>
                  </div>
                </a>
              </div>
              <h4 className="mb-2 text-sm font-semibold text-emerald-200">روابط مهمة</h4>
              <div className="space-y-1.5">
                <Link href="/" className="block text-sm text-emerald-50/90 transition-colors hover:text-white">الرئيسية</Link>
                <Link href="/cart" className="block text-sm text-emerald-50/90 transition-colors hover:text-white">السلة</Link>
                <Link href="/privacy" className="block text-sm text-emerald-50/90 transition-colors hover:text-white">سياسة الخصوصية</Link>
                <Link href="/terms" className="block text-sm text-emerald-50/90 transition-colors hover:text-white">الشروط والأحكام</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/15 pt-4 text-center sm:pt-6">
            <p className="mb-2 text-sm text-emerald-50/90 sm:text-base">
              جميع الحقوق محفوظة &copy; {new Date().getFullYear()} فكهاني الكويت
            </p>
            <p className="text-xs text-emerald-100/70 sm:text-sm">
              تطوير:
              <a
                href="https://nexdev-portfolio-one.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 font-bold text-cyan-200 transition-colors hover:text-white"
              >
                NexDev
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}