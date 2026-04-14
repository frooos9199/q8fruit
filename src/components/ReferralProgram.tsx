'use client';

import { useCallback, useEffect, useState } from 'react';
import { Share2, Copy, Gift, Users } from 'lucide-react';

interface ReferralProgramProps {
  userId: string;
  userName: string;
}

export default function ReferralProgram({ userId, userName }: ReferralProgramProps) {
  const [referralCode, setReferralCode] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [copied, setCopied] = useState(false);

  void userName;

  const fetchReferralData = useCallback(async () => {
    try {
      const response = await fetch(`/api/referral/${userId}`);
      const data = await response.json();
      
      if (data.code) {
        setReferralCode(data.code);
        setTotalReferrals(data.totalReferrals || 0);
        setTotalRewards(data.totalRewards || 0);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    const shareData = {
      title: 'انضم لـ Q8 Fruit',
      text: `استخدم كود الدعوة ${referralCode} واحصل على خصم 2 دينار كويتي على أول طلب! 🍎🥬`,
      url: `https://www.q8fruit.com?ref=${referralCode}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyToClipboard();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-8 h-8 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">برنامج الإحالة</h2>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-gray-700 mb-3">
          ادعُ أصدقاءك واحصل على <span className="font-bold text-green-600">2 د.ك</span> لكل صديق يسجل ويطلب!
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <p className="text-sm text-gray-600 mb-2">كود الدعوة الخاص بك:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border-2 border-green-500 rounded-lg px-4 py-3 text-center">
              <span className="text-2xl font-bold text-green-600 tracking-wider">
                {referralCode || 'جاري التحميل...'}
              </span>
            </div>
            <button
              onClick={copyToClipboard}
              className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="نسخ الكود"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          {copied && (
            <p className="text-green-600 text-sm mt-2 text-center">✅ تم النسخ!</p>
          )}
        </div>

        <button
          onClick={shareReferral}
          className="w-full bg-blue-600 text-white rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          مشاركة الكود مع الأصدقاء
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 text-center">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{totalReferrals}</p>
          <p className="text-sm text-gray-600">إحالات ناجحة</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 text-center">
          <Gift className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{totalRewards.toFixed(2)} د.ك</p>
          <p className="text-sm text-gray-600">إجمالي المكافآت</p>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 rounded-lg p-4">
        <h3 className="font-bold text-gray-800 mb-2">📋 كيف يعمل؟</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>شارك كود الدعوة مع أصدقائك</li>
          <li>يسجل صديقك ويستخدم الكود في أول طلب</li>
          <li>يحصل صديقك على خصم 2 د.ك</li>
          <li>تحصل أنت على 2 د.ك في حسابك!</li>
        </ol>
      </div>
    </div>
  );
}
