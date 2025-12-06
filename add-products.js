// سكريبت لإضافة المنتجات من موقع fruitsq8.com
// افتح console المتصفح في http://localhost:3000 وانسخ هذا الكود واضغط Enter

const products = [
  // الفواكه
  { id: 1, name: "تفاح امريكي احمر", units: [{name: "كيلو", price: 1.500}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 2, name: "كيوي ذهبي جنوب افريقيا", units: [{name: "كيلو", price: 3.000}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 3, name: "برتقال لبناني للعصير", units: [{name: "كيلو", price: 0.800}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 4, name: "موز فلبيني", units: [{name: "كيلو", price: 0.750}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 5, name: "تفاح ايراني صغير", units: [{name: "كيلو", price: 1.500}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 6, name: "فراوله امريكي", units: [{name: "علبة", price: 3.000}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 7, name: "شمام", units: [{name: "حبة", price: 1.250}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 8, name: "نكتارين استرالي", units: [{name: "كيلو", price: 2.000}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 9, name: "خوخ كعب الغزال", units: [{name: "كيلو", price: 1.500}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 10, name: "مانجو اليمني", units: [{name: "كيلو", price: 4.000}], quantity: 1000, active: true, category: "فواكه", images: [] },
  { id: 11, name: "تين", units: [{name: "كيلو", price: 3.000}], quantity: 1000, active: true, category: "فواكه", images: [] },
  
  // الخضار
  { id: 12, name: "خيار", units: [{name: "كيلو", price: 0.500}], quantity: 1000, active: true, category: "خضار", images: [] },
  { id: 13, name: "باذنجان", units: [{name: "كيلو", price: 0.650}], quantity: 1000, active: true, category: "خضار", images: [] },
  { id: 14, name: "زهره", units: [{name: "حبة", price: 1.500}], quantity: 1000, active: true, category: "خضار", images: [] },
  { id: 15, name: "بروكلي", units: [{name: "حبة", price: 1.500}], quantity: 1000, active: true, category: "خضار", images: [] },
  { id: 16, name: "قرع مدور", units: [{name: "حبة", price: 1.500}], quantity: 1000, active: true, category: "خضار", images: [] },
  { id: 17, name: "ليمون اخضر", units: [{name: "كيلو", price: 0.850}], quantity: 1000, active: true, category: "خضار", images: [] },
  { id: 18, name: "فلفل بارد اخضر", units: [{name: "كيلو", price: 0.750}], quantity: 1000, active: true, category: "خضار", images: [] },
  { id: 19, name: "فلفل بارد ملون", units: [{name: "كيلو", price: 0.550}], quantity: 1000, active: true, category: "خضار", images: [] },
  
  // الورقيات
  { id: 20, name: "خس مدور", units: [{name: "حبة", price: 1.250}], quantity: 1000, active: true, category: "ورقيات", images: [] },
  { id: 21, name: "خس", units: [{name: "ربطة", price: 0.250}], quantity: 1000, active: true, category: "ورقيات", images: [] },
  { id: 22, name: "جرجير", units: [{name: "ربطة", price: 0.250}], quantity: 1000, active: true, category: "ورقيات", images: [] },
  { id: 23, name: "فجل احمر", units: [{name: "ربطة", price: 0.250}], quantity: 1000, active: true, category: "ورقيات", images: [] },
  { id: 24, name: "فجل ابيض", units: [{name: "ربطة", price: 0.250}], quantity: 1000, active: true, category: "ورقيات", images: [] },
  { id: 25, name: "نعناع اخضر", units: [{name: "ربطة", price: 0.250}], quantity: 1000, active: true, category: "ورقيات", images: [] },
  
  // سلات الفواكه
  { id: 26, name: "سلة فواكه مشكلة صغيرة", units: [{name: "سلة", price: 5.000}], quantity: 1000, active: true, category: "سلات الفواكه", images: [] },
  { id: 27, name: "سلة فواكه مشكلة متوسطة", units: [{name: "سلة", price: 10.000}], quantity: 1000, active: true, category: "سلات الفواكه", images: [] },
  { id: 28, name: "سلة فواكه مشكلة كبيرة", units: [{name: "سلة", price: 15.000}], quantity: 1000, active: true, category: "سلات الفواكه", images: [] },
];

// حفظ في localStorage
localStorage.setItem('products', JSON.stringify(products));
console.log('✅ تم إضافة ' + products.length + ' منتج بنجاح!');
console.log('🔄 قم بتحديث الصفحة لرؤية المنتجات');

// طباعة ملخص
console.log('📊 ملخص المنتجات:');
const categories = {};
products.forEach(p => {
  if (!categories[p.category]) categories[p.category] = 0;
  categories[p.category]++;
});
Object.keys(categories).forEach(cat => {
  console.log(`  - ${cat}: ${categories[cat]} منتج`);
});
