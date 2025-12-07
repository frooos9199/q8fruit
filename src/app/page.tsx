"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// تعريفات TypeScript أعلى الملف
interface Product {
  id: number;
  name: string;
  units: { name: string; price: number }[];
  quantity: number;
  active: boolean;
  images?: string[]; // صور متعددة
  image?: string; // دعم خلفي للصورة القديمة
  category: string;
}

interface ProductCardProps {
  product: Product;
  quantities: { [productId: number]: number };
  handleQuantityChange: (productId: number, value: number) => void;
  small?: boolean;
}

function ProductCard({ product, quantities, handleQuantityChange, small = false }: ProductCardProps) {
  const quantity = quantities[product.id] || 1;
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
    const existingIndex = cart.findIndex((item:any) => item.id === product.id && item.unit === unitName);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      // استخدم أول صورة من images إذا وجدت، وإلا image القديمة
      let cartImage = product.image;
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
    } else {
      setImgIdx(0);
    }
  }, [product.images]);

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-md p-3 flex flex-col items-stretch border border-gray-100 dark:border-gray-800 transition-all duration-200 hover:scale-105 hover:shadow-lg group${small ? '' : ''}`}
    >
      <div className={`${small ? 'w-36 h-36 xs:w-36 xs:h-36 sm:w-40 sm:h-40 mb-2' : 'w-40 h-40 mb-3'} mx-auto rounded-xl overflow-hidden bg-white flex items-center justify-center`}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[imgIdx]}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 0.2s' }}
          />
        ) : product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300" />
        ) : null}
      </div>
      <div className={`font-bold ${small ? 'text-sm xs:text-base mb-1' : 'text-base mb-2'} text-gray-800 dark:text-gray-100 text-center`}>{product.name}</div>
      {/* اختيار الوحدة */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {product.units.map((unit, idx) => (
          <button
            key={unit.name}
            type="button"
            className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border transition-all duration-150 focus:outline-none shadow-sm min-w-[48px] justify-center
              ${idx === selectedUnitIdx
                ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200'
                : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900'}
            `}
            onClick={() => setSelectedUnitIdx(idx)}
          >
            {idx === selectedUnitIdx && (
              <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor" className="text-green-500"><circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.13"/><circle cx="10" cy="10" r="4" fill="currentColor" /></svg>
            )}
            <span>{unit.name}</span>
          </button>
        ))}
      </div>
      {/* اختيار العدد */}
      <div className="flex items-center justify-center gap-2 mb-3 select-none">
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-lg font-bold hover:bg-pink-200 dark:hover:bg-pink-700 transition"
          onClick={() => handleQuantityChange(product.id, Math.max(1, quantity - 1))}
          aria-label="نقص العدد"
        >
          -
        </button>
        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-lg font-bold hover:bg-green-200 dark:hover:bg-green-700 transition"
          onClick={() => handleQuantityChange(product.id, Math.min(product.quantity, quantity + 1))}
          aria-label="زيادة العدد"
        >
          +
        </button>
      </div>
      {/* صف السعر والوحدة */}
      <div className="flex items-center justify-between gap-2 mb-3 px-2">
        <span className="text-lg font-bold text-green-700 dark:text-green-300 flex items-center">
          د.ك<span className="mx-1" />{(selectedUnit?.price * quantity).toFixed(3)}
          {quantity > 1 && (
            <span className="text-xs text-gray-500 ml-2">({selectedUnit?.price} × {quantity})</span>
          )}
        </span>
        {selectedUnit?.name && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border border-green-400 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 shadow-sm transition-all">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" className="text-green-500"><circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.13"/><circle cx="10" cy="10" r="4" fill="currentColor" /></svg>
            <span>{selectedUnit.name}</span>
          </span>
        )}
      </div>
      <button onClick={handleAddToCart} className={`mt-auto ${small ? 'px-2 py-1 xs:px-4 xs:py-2 text-xs xs:text-sm gap-1 xs:gap-2' : 'px-4 py-2 text-sm gap-2'} bg-green-500 hover:bg-pink-500 text-white rounded-full font-bold shadow transition-all flex items-center justify-center`}>
        <span className="ml-4">أضف للسلة</span>
        <svg width={small ? "18" : "20"} height={small ? "18" : "20"} fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-13z"/><circle cx="9" cy="21" r="1" fill="currentColor"/><circle cx="18" cy="21" r="1" fill="currentColor"/></svg>
      </button>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
  const [logo, setLogo] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name?: string} | null>(null);
  // البنرات
  const [banners, setBanners] = useState<string[]>([]);

  // دالة لتغيير كمية منتج معين
  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  // لا تعرض أي منتجات افتراضية إذا لم يوجد منتجات في localStorage
  const defaultProducts: Product[] = [];

  const fetchProducts = () => {
    if (typeof window !== "undefined") {
      const storedProducts = window.localStorage.getItem("products");
      let safeProducts: Product[] = [];
      if (storedProducts) {
        try {
          const parsed = JSON.parse(storedProducts);
          safeProducts = Array.isArray(parsed)
            ? parsed.filter(
                (p) =>
                  typeof p === "object" &&
                  typeof p.id === "number" &&
                  typeof p.name === "string" &&
                  Array.isArray(p.units) &&
                  p.units.every(
                    (u: any) =>
                      typeof u === "object" &&
                      typeof u.name === "string" &&
                      typeof u.price === "number"
                  ) &&
                  typeof p.quantity === "number" &&
                  typeof p.active === "boolean" &&
                  typeof p.category === "string"
              )
            : [];
        } catch {
          safeProducts = [];
        }
      }
      // إذا لم يوجد أي منتج في الإدارة، اعرض الافتراضي
      if (!safeProducts || safeProducts.length === 0) {
        setProducts(defaultProducts);
      } else {
        setProducts(safeProducts);
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
      window.localStorage.removeItem("currentUser");
      window.localStorage.removeItem("isAdmin");
      window.location.href = "/";
    }
  }
  
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  
  // دالة لجلب التصنيفات
  const fetchCategories = () => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('cateringCategories');
      if (stored) {
        try {
          setCategories(JSON.parse(stored));
        } catch {
          setCategories([
            { id: 1, name: "فواكه" },
            { id: 2, name: "خضار" },
            { id: 3, name: "ورقيات" },
            { id: 4, name: "سلات الفواكه" },
          ]);
        }
      } else {
        // إنشاء التصنيفات الافتراضية
        const defaultCategories = [
          { id: 1, name: "فواكه" },
          { id: 2, name: "خضار" },
          { id: 3, name: "ورقيات" },
          { id: 4, name: "سلات الفواكه" },
        ];
        setCategories(defaultCategories);
        window.localStorage.setItem('cateringCategories', JSON.stringify(defaultCategories));
      }
    }
  };
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLogo = window.localStorage.getItem("siteLogo");
      if (storedLogo) setLogo(storedLogo);
      fetchProducts();
      // تحقق من حالة الأدمن
      setIsAdmin(window.localStorage.getItem("isAdmin") === "true");
      // جلب المستخدم الحالي
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
      // البنرات
      const storedBanners = window.localStorage.getItem("banners");
      if (storedBanners) {
        try {
          const parsed = JSON.parse(storedBanners);
          setBanners(Array.isArray(parsed) && parsed.length > 0 ? parsed : [
            '/banners/banner1.jpg',
            '/banners/banner2.jpg',
            '/banners/banner3.jpg',
            '/banners/banner4.jpg',
          ]);
        } catch {
          setBanners([
            '/banners/banner1.jpg',
            '/banners/banner2.jpg',
            '/banners/banner3.jpg',
            '/banners/banner4.jpg',
          ]);
        }
      } else {
        setBanners([
          '/banners/banner1.jpg',
          '/banners/banner2.jpg',
          '/banners/banner3.jpg',
          '/banners/banner4.jpg',
        ]);
      }
      // تحديث رقم السلة مباشرة عند كل تغيير في localStorage (cart)
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
      // مراقبة التغييرات على cart أو البنرات أو المنتجات في localStorage بشكل مباشر
      const cartObserver = setInterval(() => {
        updateCartCount();
        fetchProducts();
      }, 500);
      const onStorage = (e: StorageEvent) => {
        if (e.key === "products") fetchProducts();
        if (e.key === "siteLogo") setLogo(e.newValue);
        if (e.key === "isAdmin") setIsAdmin(e.newValue === "true");
        if (e.key === "cateringCategories") fetchCategories();
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
            setBanners(Array.isArray(parsed) && parsed.length > 0 ? parsed : [
              '/banners/banner1.jpg',
              '/banners/banner2.jpg',
              '/banners/banner3.jpg',
              '/banners/banner4.jpg',
            ]);
          } catch {
            setBanners([
              '/banners/banner1.jpg',
              '/banners/banner2.jpg',
              '/banners/banner3.jpg',
              '/banners/banner4.jpg',
            ]);
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
  (products.length > 0 ? products : defaultProducts).forEach((product) => {
    if (!product.active) return;
    if (!grouped[product.category]) grouped[product.category] = [];
    grouped[product.category].push(product);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-cyan-400 to-blue-500 dark:from-green-700 dark:via-cyan-800 dark:to-blue-900 font-sans">
      {/* رسالة ترحيبية */}
      {currentUser?.name && (
        <div className="w-full text-center py-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-bold text-lg">
          أهلاً: {currentUser.name}
        </div>
      )}
      {/* منيو جانبي والهيدر كما هو ... */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex">
          <div className="w-64 bg-white dark:bg-gray-900 h-full shadow-xl p-6 flex flex-col gap-4 animate-slideInRight">
            <button onClick={() => setMenuOpen(false)} className="self-end text-gray-500 hover:text-pink-500 text-2xl mb-4">&times;</button>
            {menuLinks.map((link) => (
              link.onClick ? (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="block w-full text-right px-4 py-2 rounded-lg text-lg font-bold text-green-700 dark:text-green-200 hover:bg-green-50 dark:hover:bg-gray-800 transition"
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.href} href={link.href} className="block px-4 py-2 rounded-lg text-lg font-bold text-green-700 dark:text-green-200 hover:bg-green-50 dark:hover:bg-gray-800 transition">
                  {link.label}
                </Link>
              )
            ))}
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
      <header className="w-full flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-900/80 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(true)} className="text-green-700 dark:text-green-200 text-2xl md:text-3xl mr-2 md:mr-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          {/* أيقونة موبايل ورقم التواصل */}
          <span className="flex items-center gap-1 text-green-700 dark:text-green-200 font-bold text-lg mr-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4h4l2 5-1.5 1.5a7 7 0 0 0 7 7L17 17l5 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
            <span dir="ltr">98899426</span>
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          {logo ? (
            <img src={logo} alt="شعار الموقع" className="w-16 h-16 object-contain rounded-full shadow border-2 border-green-200 bg-white" />
          ) : (
            <span className="text-2xl font-extrabold text-green-700">فكهاني الكويت</span>
          )}
        </div>
        <div className="flex items-center gap-2 relative ml-2 md:ml-4">
          {/* زر الإدارة يظهر فقط للأدمن */}
          {isAdmin && (
            <Link href="/admin" className="text-xs md:text-base font-bold px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border border-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition mr-2">الإدارة</Link>
          )}
          <Link href="/cart" className="text-green-700 dark:text-green-200 text-2xl md:text-3xl hover:text-pink-500 transition relative">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-13z"/><circle cx="9" cy="21" r="1" fill="currentColor"/><circle cx="18" cy="21" r="1" fill="currentColor"/></svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">{cartCount}</span>
            )}
          </Link>
        </div>
      </header>

      {/* بانر ديناميكي */}
      {banners.length > 0 && (
        <div className="max-w-4xl mx-auto my-10 rounded-2xl overflow-hidden shadow-xl">
          <img src={banners[0]} alt="بانر رئيسي" className="w-full h-32 md:h-44 object-cover object-center" />
        </div>
      )}

      {/* عرض المجموعات (التصنيفات) من localStorage */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        {categories.map((cat) => (
          <section key={cat.name} className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6 text-center">
              {cat.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {(grouped[cat.name] && grouped[cat.name].length > 0) ? (
                grouped[cat.name].map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantities={quantities}
                    handleQuantityChange={handleQuantityChange}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-8">لا توجد منتجات في هذا القسم حالياً.</div>
              )}
            </div>
          </section>
        ))}
      </div>


      <footer className="mt-20 py-8 text-center text-gray-500 dark:text-gray-400 border-t bg-white/60 dark:bg-gray-900/60">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()} فكهاني الكويت
        <br />
        <span className="text-sm mt-2 inline-block">
          المطور:
          <a
            href="https://nexdev-portfolio-one.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 dark:text-green-300 font-bold hover:underline ml-1"
          >
            NexDev
          </a>
        </span>
      </footer>
    </div>
  );
}