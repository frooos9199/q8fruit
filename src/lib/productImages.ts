// صور المنتجات الافتراضية
// يمكن استبدالها بصور حقيقية لاحقاً

export const productImages = {
  // الفواكه
  "تفاح امريكي احمر": "/products/apple-red.jpg",
  "كيوي ذهبي جنوب افريقيا": "/products/kiwi-gold.jpg",
  "برتقال لبناني للعصير": "/products/orange.jpg",
  "موز فلبيني": "/products/banana.jpg",
  "تفاح ايراني صغير": "/products/apple-small.jpg",
  "فراوله امريكي": "/products/strawberry.jpg",
  "شمام": "/products/melon.jpg",
  "نكتارين استرالي": "/products/nectarine.jpg",
  "خوخ كعب الغزال": "/products/peach.jpg",
  "مانجو اليمني": "/products/mango.jpg",
  "تين": "/products/fig.jpg",
  
  // الخضار
  "خيار": "/products/cucumber.jpg",
  "باذنجان": "/products/eggplant.jpg",
  "زهره": "/products/cauliflower.jpg",
  "بروكلي": "/products/broccoli.jpg",
  "قرع مدور": "/products/pumpkin.jpg",
  "ليمون اخضر": "/products/lime.jpg",
  "فلفل بارد اخضر": "/products/green-pepper.jpg",
  "فلفل بارد ملون": "/products/colored-pepper.jpg",
  
  // الورقيات
  "خس مدور": "/products/lettuce-round.jpg",
  "خس": "/products/lettuce.jpg",
  "جرجير": "/products/rocca.jpg",
  "فجل احمر": "/products/radish-red.jpg",
  "فجل ابيض": "/products/radish-white.jpg",
  "نعناع اخضر": "/products/mint.jpg",
  
  // سلات الفواكه
  "سلة فواكه مشكلة صغيرة": "/products/basket-small.jpg",
  "سلة فواكه مشكلة متوسطة": "/products/basket-medium.jpg",
  "سلة فواكه مشكلة كبيرة": "/products/basket-large.jpg",
  
  // صورة افتراضية
  "default": "/products/default.jpg"
};

// دالة للحصول على صورة المنتج
export function getProductImage(productName: string): string {
  return productImages[productName as keyof typeof productImages] || productImages.default;
}

// روابط صور مجانية من Unsplash (مؤقتة)
export const unsplashImages = {
  "تفاح امريكي احمر": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
  "كيوي ذهبي جنوب افريقيا": "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400",
  "برتقال لبناني للعصير": "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400",
  "موز فلبيني": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
  "تفاح ايراني صغير": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400",
  "فراوله امريكي": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
  "شمام": "https://images.unsplash.com/photo-1621583832446-1dfe51308d46?w=400",
  "نكتارين استرالي": "https://images.unsplash.com/photo-1629828874514-944d8c0b3366?w=400",
  "خوخ كعب الغزال": "https://images.unsplash.com/photo-1629828874514-944d8c0b3366?w=400",
  "مانجو اليمني": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
  "تين": "https://images.unsplash.com/photo-1628516235160-900a2c585a55?w=400",
  
  "خيار": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400",
  "باذنجان": "https://images.unsplash.com/photo-1659261200833-ec993c7adf37?w=400",
  "زهره": "https://images.unsplash.com/photo-1568584711271-6f5dc2e1d3a0?w=400",
  "بروكلي": "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400",
  "قرع مدور": "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400",
  "ليمون اخضر": "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400",
  "فلفل بارد اخضر": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400",
  "فلفل بارد ملون": "https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400",
  
  "خس مدور": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400",
  "خس": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400",
  "جرجير": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
  "فجل احمر": "https://images.unsplash.com/photo-1612624729737-8c5d20f14b3c?w=400",
  "فجل ابيض": "https://images.unsplash.com/photo-1612624729737-8c5d20f14b3c?w=400",
  "نعناع اخضر": "https://images.unsplash.com/photo-1628556899053-68f8e06e9e0b?w=400",
  
  "سلة فواكه مشكلة صغيرة": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400",
  "سلة فواكه مشكلة متوسطة": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400",
  "سلة فواكه مشكلة كبيرة": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400",
  
  "default": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400"
};

// دالة للحصول على صورة من Unsplash
export function getUnsplashImage(productName: string): string {
  return unsplashImages[productName as keyof typeof unsplashImages] || unsplashImages.default;
}
