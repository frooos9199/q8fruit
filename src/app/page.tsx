"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { syncData, checkCompatibility } from "../lib/dataSync";
import { 
  loadAllDataFromFirebase, 
  syncAllDataToFirebase, 
  watchProducts 
} from "../lib/firebaseSync";
import { forceLoadAllData, checkDataCompleteness, retryDataLoad } from "../lib/forceSync";
import { syncProductImages, fullImageSync } from "../lib/imageSync";

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
  categories?: string[]; // تصنيفات متعددة
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
    } else {
      setImgIdx(0);
    }
  }, [product.images]);

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col items-stretch border border-gray-100 dark:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl group backdrop-blur-sm`}
    >
  <div className={`relative aspect-square ${small ? 'w-full' : 'w-40'} mx-auto rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 flex items-center justify-center border-2 border-red-400`}>
        {/* صورة المنتج */}
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[imgIdx]}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover object-center rounded-xl sm:rounded-2xl transition-all duration-500 border-2 border-blue-400 ${fade ? 'opacity-100' : 'opacity-0'}`}
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
            className="absolute inset-0 w-full h-full object-cover object-center rounded-xl sm:rounded-2xl transition-all duration-500 border-2 border-blue-400" 
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
      <div className={`font-bold ${small ? 'text-sm sm:text-base mb-2' : 'text-lg mb-3'} text-gray-800 dark:text-gray-100 text-center line-clamp-2`}>{product.name}</div>
      {/* اختيار الوحدة */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
        {product.units.map((unit, idx) => (
          <button
            key={unit.name}
            type="button"
            className={`flex items-center gap-1 text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border-2 transition-all duration-200 focus:outline-none shadow-sm min-w-[44px] sm:min-w-[52px] justify-center
              ${idx === selectedUnitIdx
                ? 'border-green-500 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 text-green-700 dark:text-green-200 shadow-md'
                : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900 dark:hover:to-blue-900'}
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
        <span className="w-8 sm:w-10 text-center font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100">{quantity}</span>
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
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 sm:ml-2 bg-gray-100 dark:bg-slate-700 px-1 sm:px-2 py-0.5 rounded-full whitespace-nowrap">({selectedUnit?.price} × {quantity})</span>
          )}
        </span>
        {selectedUnit?.name && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 sm:px-3 py-1 rounded-full border-2 border-green-400 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 text-green-700 dark:text-green-200 shadow-sm transition-all">
            <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.2"/><circle cx="10" cy="10" r="4" fill="currentColor" /></svg>
            <span className="text-xs">{selectedUnit.name}</span>
          </span>
        )}
      </div>
      <button onClick={handleAddToCart} className={`mt-auto px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base gap-2 sm:gap-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl sm:rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group`}>
        <span className="ml-1 sm:ml-2">أضف للسلة</span>
        <svg width="18" height="18" className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-13z"/><circle cx="9" cy="21" r="1" fill="currentColor"/><circle cx="18" cy="21" r="1" fill="currentColor"/></svg>
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
  const [currentUser, setCurrentUser] = useState<{uid?: string; name?: string; email?: string} | null>(null);
  // البنرات
  const [banners, setBanners] = useState<string[]>([]);

  // دالة لتغيير كمية منتج معين
  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  // منتجات افتراضية تظهر عند عدم وجود منتجات في localStorage
  const defaultProducts: Product[] = [
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
    }
  ];

  const fetchProducts = async () => {
    if (typeof window !== "undefined") {
      // التحقق من اكتمال البيانات أولاً
      if (!checkDataCompleteness()) {
        console.log('البيانات غير مكتملة، جاري إعادة التحميل...');
        const success = await retryDataLoad();
        if (!success) {
          // استخدام البيانات الافتراضية كحل أخير
          setProducts(defaultProducts);
          window.localStorage.setItem('products', JSON.stringify(defaultProducts));
          await syncAllDataToFirebase();
          return;
        }
      }
      
      // جلب من localStorage بعد التأكد من اكتمال البيانات
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
      
      // إذا لم يوجد أي منتج، استخدم الافتراضي ومزامنه مع Firebase
      if (!safeProducts || safeProducts.length === 0) {
        setProducts(defaultProducts);
        window.localStorage.setItem('products', JSON.stringify(defaultProducts));
        await syncAllDataToFirebase();
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
  
  // دالة إعادة تحميل البيانات يدوياً
  const handleForceReload = async () => {
    setDataLoading(true);
    
    // مزامنة شاملة للبيانات والصور
    const dataSuccess = await forceLoadAllData();
    const imageSuccess = await fullImageSync();
    
    if (dataSuccess || imageSuccess) {
      await fetchProducts();
      await fetchCategories();
    }
    
    setDataLoading(false);
  };
  
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  // دالة لجلب التصنيفات
  const fetchCategories = async () => {
    if (typeof window !== 'undefined') {
      // التحقق من اكتمال البيانات
      if (!checkDataCompleteness()) {
        await retryDataLoad();
      }
      
      const stored = window.localStorage.getItem('cateringCategories');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const simplifiedCategories = parsed.map((cat: any) => ({
            id: cat.id,
            name: cat.name
          }));
          setCategories(simplifiedCategories);
        } catch {
          const defaultCategories = [
            { id: 1, name: "فواكه", products: [], image: undefined },
            { id: 2, name: "خضار", products: [], image: undefined },
            { id: 3, name: "ورقيات", products: [], image: undefined },
            { id: 4, name: "سلات الفواكه", products: [], image: undefined },
          ];
          window.localStorage.setItem('cateringCategories', JSON.stringify(defaultCategories));
          syncAllDataToFirebase();
          setCategories(defaultCategories.map(cat => ({ id: cat.id, name: cat.name })));
        }
      } else {
        const defaultCategories = [
          { id: 1, name: "فواكه", products: [], image: undefined },
          { id: 2, name: "خضار", products: [], image: undefined },
          { id: 3, name: "ورقيات", products: [], image: undefined },
          { id: 4, name: "سلات الفواكه", products: [], image: undefined },
        ];
        window.localStorage.setItem('cateringCategories', JSON.stringify(defaultCategories));
        syncAllDataToFirebase();
        setCategories(defaultCategories.map(cat => ({ id: cat.id, name: cat.name })));
      }
    }
  };
  
  useEffect(() => {
    // تحقق من التوافق وبدء التزامن
    if (checkCompatibility()) {
      const cleanup = syncData();
      
      // مراقبة تغييرات Firebase في الوقت الفعلي
      const unsubscribeProducts = watchProducts((firebaseProducts) => {
        if (firebaseProducts.length > 0) {
          setProducts(firebaseProducts);
          // حفظ في localStorage أيضاً
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('products', JSON.stringify(firebaseProducts));
          }
        }
      });
      
      if (typeof window !== "undefined") {
        // تحميل البيانات من Firebase أولاً
        loadAllDataFromFirebase().then(async () => {
          // مزامنة الصور بعد تحميل البيانات
          await syncProductImages();
          
          const storedLogo = window.localStorage.getItem("siteLogo");
          if (storedLogo) setLogo(storedLogo);
          fetchProducts();
          fetchCategories();
        });
        
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
        }, 1000); // تحديث أسرع للموبايل
        const onStorage = (e: StorageEvent) => {
          if (e.key === "products") {
            fetchProducts();
            // مزامنة مع Firebase عند تغيير المنتجات
            syncAllDataToFirebase();
          }
          if (e.key === "siteLogo") {
            setLogo(e.newValue);
            syncAllDataToFirebase();
          }
          if (e.key === "isAdmin") setIsAdmin(e.newValue === "true");
          if (e.key === "cateringCategories") {
            fetchCategories();
            syncAllDataToFirebase();
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
              setBanners(Array.isArray(parsed) && parsed.length > 0 ? parsed : [
                '/banners/banner1.jpg',
                '/banners/banner2.jpg',
                '/banners/banner3.jpg',
                '/banners/banner4.jpg',
              ]);
              syncAllDataToFirebase();
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
          if (cleanup) cleanup();
          if (unsubscribeProducts) unsubscribeProducts();
        };
      }
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
    
    // إضافة المنتج لجميع التصنيفات المختارة
    const productCategories = product.categories || [product.category];
    productCategories.forEach(categoryName => {
      if (!grouped[categoryName]) grouped[categoryName] = [];
      // تجنب التكرار
      if (!grouped[categoryName].find(p => p.id === product.id)) {
        grouped[categoryName].push(product);
      }
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-blue-900 dark:to-green-900 font-sans">
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
          <div className="w-72 bg-white dark:bg-slate-800 h-full shadow-2xl p-6 flex flex-col gap-4 animate-slideInRight border-r-4 border-green-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">القائمة</h3>
              <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-blue-500 text-3xl transition-colors">&times;</button>
            </div>
            {menuLinks.map((link) => (
              link.onClick ? (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900 dark:hover:to-blue-900 hover:text-green-600 transition-all duration-200 border border-transparent hover:border-green-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  {link.label}
                </button>
              ) : (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900 dark:hover:to-blue-900 hover:text-green-600 transition-all duration-200 border border-transparent hover:border-green-200">
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
      <header className="w-full flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg sticky top-0 z-30 border-b border-green-100 dark:border-green-900">
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
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">طازج • طبيعي • صحي</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {/* زر إعادة تحميل البيانات للموبايل */}
          <button
            onClick={handleForceReload}
            disabled={dataLoading}
            className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation lg:hidden"
            title="إعادة تحميل البيانات"
          >
            <svg width="18" height="18" className={`${dataLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
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


      <footer className="mt-16 sm:mt-24 py-8 sm:py-12 bg-gradient-to-r from-green-800 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="text-center md:text-right">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-green-300">فكهاني الكويت</h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                متجرك المفضل للفواكه والخضار الطازجة
                <br />
                جودة عالية وأسعار منافسة
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-blue-300">تواصل معنا</h4>
              <a href="tel:+96598899426" className="inline-flex items-center justify-center gap-2 text-cyan-300 font-bold bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all touch-manipulation">
                <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4h4l2 5-1.5 1.5a7 7 0 0 0 7 7L17 17l5 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
                <span dir="ltr" className="text-sm sm:text-base">98899426</span>
              </a>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-300">روابط سريعة</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-200 hover:text-white transition-colors text-sm sm:text-base">الرئيسية</Link>
                <Link href="/cart" className="block text-gray-200 hover:text-white transition-colors text-sm sm:text-base">السلة</Link>
                <Link href="/login" className="block text-gray-200 hover:text-white transition-colors text-sm sm:text-base">تسجيل الدخول</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-green-700 pt-4 sm:pt-6 text-center">
            <p className="text-gray-200 mb-2 text-sm sm:text-base">
              جميع الحقوق محفوظة &copy; {new Date().getFullYear()} فكهاني الكويت
            </p>
            <p className="text-xs sm:text-sm text-gray-300">
              تطوير:
              <a
                href="https://nexdev-portfolio-one.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 font-bold hover:text-blue-200 transition-colors ml-1"
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