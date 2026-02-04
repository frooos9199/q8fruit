'use client';

import { useState } from 'react';
import { validatePromoCode } from '@/lib/promo';

interface PromoCodeInputProps {
  orderTotal: number;
  onPromoApplied: (discount: number, code: string) => void;
}

export default function PromoCodeInput({ orderTotal, onPromoApplied }: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setError('الرجاء إدخال كود الخصم');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call API to validate promo code
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderTotal }),
      });

      const data = await response.json();

      if (data.valid) {
        setSuccess('✅ تم تطبيق كود الخصم بنجاح!');
        onPromoApplied(data.discount || 0, promoCode);
      } else {
        setError(data.message || 'كود خصم غير صحيح');
      }
    } catch (err) {
      setError('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        كود الخصم
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="أدخل كود الخصم"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={applyPromoCode}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'جاري التحقق...' : 'تطبيق'}
        </button>
      </div>
      
      {error && (
        <p className="text-red-600 text-sm mt-2">❌ {error}</p>
      )}
      
      {success && (
        <p className="text-green-600 text-sm mt-2">{success}</p>
      )}

      <div className="mt-4 space-y-2">
        <p className="text-xs text-gray-500">أكواد مقترحة:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPromoCode('WELCOME20')}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors"
          >
            WELCOME20 (خصم 20%)
          </button>
          <button
            onClick={() => setPromoCode('FLASH15')}
            className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs hover:bg-orange-100 transition-colors"
          >
            FLASH15 (خصم 15%)
          </button>
          <button
            onClick={() => setPromoCode('FREEDEL')}
            className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs hover:bg-green-100 transition-colors"
          >
            FREEDEL (توصيل مجاني)
          </button>
        </div>
      </div>
    </div>
  );
}
