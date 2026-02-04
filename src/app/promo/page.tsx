import { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart, Truck, Shield, Star, Gift, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Q8 Fruit - فكهاني الكويت | أفضل فواكه وخضار طازجة مع توصيل سريع',
  description: 'اطلب فواكه وخضروات طازجة من Q8 Fruit. توصيل سريع في جميع مناطق الكويت، أسعار منافسة، جودة عالية. احصل على خصم 20% على أول طلب!',
  openGraph: {
    title: 'Q8 Fruit - فكهاني الكويت | عرض خاص للعملاء الجدد',
    description: 'خصم 20% على أول طلب! فواكه وخضروات طازجة مع توصيل مجاني للطلبات فوق 10 د.ك',
    images: ['/landing-og.jpg'],
  },
};

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-yellow-400 text-green-900 px-4 py-2 rounded-full font-bold text-sm mb-6 animate-bounce">
              🎉 عرض خاص: خصم 20% على أول طلب!
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              فواكه وخضار طازجة<br />
              <span className="text-yellow-300">توصيل لباب البيت</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-green-50">
              أفضل جودة، أسرع توصيل، أسعار منافسة في الكويت 🇰🇼
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/"
                className="bg-yellow-400 text-green-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ابدأ التسوق الآن
                <ChevronLeft className="inline w-5 h-5 mr-2" />
              </Link>
              
              <Link
                href="/download"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition-all border-2 border-white"
              >
                📱 حمّل التطبيق
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <span>تقييم 4.8/5</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>+10,000 طلب</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <span>توصيل في ساعة</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            لماذا Q8 Fruit؟
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-green-50 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">توصيل سريع</h3>
              <p className="text-gray-600">توصيل خلال ساعة واحدة في جميع مناطق الكويت</p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">جودة مضمونة</h3>
              <p className="text-gray-600">نضمن لك أعلى جودة أو نعيد المبلغ كاملاً</p>
            </div>
            
            <div className="text-center p-6 bg-yellow-50 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">طازج يومياً</h3>
              <p className="text-gray-600">منتجات طازجة يومياً من أفضل المزارع</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">عروض حصرية</h3>
              <p className="text-gray-600">عروض يومية وأسعار منافسة على جميع المنتجات</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            🎁 عرض خاص للعملاء الجدد
          </h2>
          <p className="text-xl mb-8">
            احصل على <span className="text-4xl font-bold text-yellow-300">20%</span> خصم على أول طلب
          </p>
          <div className="bg-white text-gray-800 inline-block px-8 py-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">استخدم الكود:</p>
            <p className="text-3xl font-bold text-orange-600">WELCOME20</p>
          </div>
          <div>
            <Link
              href="/"
              className="inline-block bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              اطلب الآن واحصل على الخصم
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            ماذا يقول عملاؤنا؟
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'أحمد المطيري', rating: 5, text: 'خدمة ممتازة وتوصيل سريع جداً. المنتجات طازجة دائماً!' },
              { name: 'فاطمة العنزي', rating: 5, text: 'أفضل تطبيق للفواكه والخضار. الأسعار ممتازة والجودة عالية.' },
              { name: 'خالد السعيد', rating: 5, text: 'صار التطبيق المفضل عندي. العروض حلوة والتوصيل سريع.' },
            ].map((review, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{review.text}"</p>
                <p className="font-bold text-gray-800">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-green-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            جاهز لتجربة أفضل فواكه وخضار في الكويت؟
          </h2>
          <p className="text-xl mb-8">
            ابدأ الآن واحصل على خصم 20% على أول طلب!
          </p>
          <Link
            href="/"
            className="inline-block bg-yellow-400 text-green-900 px-12 py-5 rounded-full font-bold text-xl hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            اطلب الآن 🛒
          </Link>
        </div>
      </section>
    </div>
  );
}
