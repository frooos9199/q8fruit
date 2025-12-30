// منتجات الفواكه مع صور حقيقية وأسعار واقعية للكويت
const fruitProducts = [
  {
    id: 1,
    name: "تفاح أحمر",
    units: [
      { name: "كيلو", price: 1.250 },
      { name: "حبة", price: 0.150 }
    ],
    quantity: 100,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 2,
    name: "موز",
    units: [
      { name: "كيلو", price: 0.750 },
      { name: "حبة", price: 0.100 }
    ],
    quantity: 150,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 3,
    name: "برتقال",
    units: [
      { name: "كيلو", price: 1.000 },
      { name: "حبة", price: 0.120 }
    ],
    quantity: 120,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 4,
    name: "فراولة",
    units: [
      { name: "كيلو", price: 2.500 },
      { name: "علبة", price: 1.000 }
    ],
    quantity: 80,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 5,
    name: "عنب أحمر",
    units: [
      { name: "كيلو", price: 2.000 },
      { name: "علبة", price: 1.500 }
    ],
    quantity: 60,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 6,
    name: "مانجو",
    units: [
      { name: "كيلو", price: 1.800 },
      { name: "حبة", price: 0.500 }
    ],
    quantity: 90,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 7,
    name: "أناناس",
    units: [
      { name: "حبة", price: 2.000 },
      { name: "شرائح", price: 1.500 }
    ],
    quantity: 40,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 8,
    name: "رمان",
    units: [
      { name: "كيلو", price: 2.200 },
      { name: "حبة", price: 0.800 }
    ],
    quantity: 70,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1553575992-6b7dc0e44e7e?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 9,
    name: "بطيخ",
    units: [
      { name: "حبة", price: 3.000 },
      { name: "ربع", price: 0.800 }
    ],
    quantity: 30,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop&crop=center"
    ]
  },
  {
    id: 10,
    name: "كيوي",
    units: [
      { name: "كيلو", price: 3.500 },
      { name: "حبة", price: 0.200 }
    ],
    quantity: 50,
    active: true,
    category: "فواكه",
    images: [
      "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&h=400&fit=crop&crop=center"
    ]
  }
];

// دالة لإضافة المنتجات إلى localStorage
function addFruitProducts() {
  if (typeof window !== 'undefined') {
    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    // حساب أعلى ID موجود
    const maxId = existingProducts.length > 0 ? Math.max(...existingProducts.map((p: any) => p.id || 0)) : 0;
    
    // دمج المنتجات الجديدة مع الموجودة (تجنب التكرار)
    const allProducts = [...existingProducts];
    let currentId = maxId;
    
    fruitProducts.forEach(newProduct => {
      const exists = allProducts.find((p: any) => p.name === newProduct.name);
      if (!exists) {
        currentId++;
        allProducts.push({ ...newProduct, id: currentId });
      }
    });
    
    localStorage.setItem('products', JSON.stringify(allProducts));
    console.log('تم إضافة منتجات الفواكه بنجاح!');
    alert('تم إضافة ' + fruitProducts.length + ' منتج فواكه بنجاح!');
    
    // إعادة تحميل الصفحة لإظهار المنتجات الجديدة
    window.location.reload();
  }
}

// تصدير الدالة للاستخدام
if (typeof window !== 'undefined') {
  (window as any).addFruitProducts = addFruitProducts;
}

export { fruitProducts, addFruitProducts };