"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useTranslation } from 'react-i18next';

export default function DeliverySettings() {
  const { t } = useTranslation();
  const [deliveryNote, setDeliveryNote] = useState("التوصيل خلال ساعتين");
  const [deliveryTime, setDeliveryTime] = useState("خلال ساعتين");
  const [deliveryPrice, setDeliveryPrice] = useState(2);
  const [freeAbove, setFreeAbove] = useState(100);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadSettings = async () => {
      try {
        const { getDeliverySettingsFromFirebase } = await import('../../../lib/firebaseSync');
        const settings = await getDeliverySettingsFromFirebase();

        if (settings) {
          const resolvedPrice = Number(settings.fee ?? settings.deliveryPrice ?? settings.price);
          const resolvedFreeAbove = Number(settings.freeAbove);
          const resolvedTime = String(settings.deliveryTime ?? settings.time ?? 'خلال ساعتين');
          const resolvedNote = String(settings.note ?? 'التوصيل خلال ساعتين');

          if (Number.isFinite(resolvedPrice)) {
            setDeliveryPrice(resolvedPrice);
            window.localStorage.setItem('deliveryPrice', String(resolvedPrice));
          }
          if (Number.isFinite(resolvedFreeAbove)) {
            setFreeAbove(resolvedFreeAbove);
            window.localStorage.setItem('freeAbove', String(resolvedFreeAbove));
          }
          setDeliveryTime(resolvedTime);
          setDeliveryNote(resolvedNote);
          window.localStorage.setItem('deliveryTime', resolvedTime);
          window.localStorage.setItem('deliveryNote', resolvedNote);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل إعدادات التوصيل من Firebase:', error);
      }

      const storedTime = window.localStorage.getItem('deliveryTime');
      const storedNote = window.localStorage.getItem('deliveryNote');
      const storedPrice = window.localStorage.getItem('deliveryPrice');

      if (storedTime) setDeliveryTime(storedTime);
      if (storedNote) setDeliveryNote(storedNote);
      if (storedPrice && !Number.isNaN(Number(storedPrice))) {
        setDeliveryPrice(Number(storedPrice));
      }
      const storedFreeAbove = window.localStorage.getItem('freeAbove');
      if (storedFreeAbove && !Number.isNaN(Number(storedFreeAbove))) {
        setFreeAbove(Number(storedFreeAbove));
      }
      setLoading(false);
    };

    loadSettings();
  }, []);

  const saveDeliverySettings = async (nextPrice: number, nextTime: string, nextNote: string, nextFreeAbove: number) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("deliveryPrice", String(nextPrice));
      window.localStorage.setItem("freeAbove", String(nextFreeAbove));
      window.localStorage.setItem("deliveryTime", nextTime);
      window.localStorage.setItem("deliveryNote", nextNote);
    }
    
    // حفظ في Firebase أيضاً
    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'delivery'), {
          deliveryPrice: nextPrice,
          price: nextPrice,
          fee: nextPrice,
          freeAbove: nextFreeAbove,
          note: nextNote,
          deliveryTime: nextTime,
          time: nextTime,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        console.log('✅ تم حفظ إعدادات التوصيل في Firebase:', { nextPrice, nextTime, nextNote, nextFreeAbove });
      } catch (error) {
        console.error('❌ خطأ في حفظ إعدادات التوصيل في Firebase:', error);
      }
    }
  };

  const handleSave = async () => {
    await saveDeliverySettings(deliveryPrice, deliveryTime, deliveryNote, freeAbove);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,118,110,0.10)] backdrop-blur-sm">
      <h2 className="mb-4 text-xl font-bold text-slate-800">{t('admin.delivery.settings.title')}</h2>
      {loading && <div className="mb-4 text-sm text-slate-500">{t('admin.delivery.settings.loading')}</div>}
      <label className="block mb-3">
        <span className="font-semibold">{t('admin.delivery.settings.noteLabel')}</span>
        <textarea
          className="mt-1 min-h-[60px] w-full rounded-xl border border-slate-300 p-3"
          value={deliveryNote}
          onChange={e => setDeliveryNote(e.target.value)}
          placeholder={t('admin.delivery.settings.notePlaceholder')}
        />
      </label>
      <label className="block mb-3">
        <span className="font-semibold">{t('admin.delivery.settings.timeLabel')}</span>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-300 p-3"
          value={deliveryTime}
          onChange={e => setDeliveryTime(e.target.value)}
          placeholder={t('admin.delivery.settings.timePlaceholder')}
        />
      </label>
      <label className="block mb-3">
        <span className="font-semibold">{t('admin.delivery.settings.feeLabel')}</span>
        <input
          type="number"
          className="mt-1 w-full rounded-xl border border-slate-300 p-3"
          value={deliveryPrice}
          onChange={e => {
            const val = Number(e.target.value);
            setDeliveryPrice(val);
          }}
          min={0}
          step={0.1}
        />
      </label>
      <label className="block mb-3">
        <span className="font-semibold">{t('admin.delivery.settings.freeAboveLabel')}</span>
        <input
          type="number"
          className="mt-1 w-full rounded-xl border border-slate-300 p-3"
          value={freeAbove}
          onChange={e => setFreeAbove(Number(e.target.value))}
          min={0}
          step={1}
        />
        <p className="mt-1 text-xs text-slate-500">
          💡 {t('admin.delivery.settings.hint')}
        </p>
      </label>
      <button
        onClick={handleSave}
        className="mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 font-bold text-white"
      >
        {t('common.save')}
      </button>
      {saved && <div className="text-green-600 mt-2">{t('common.savedSuccessfully')}</div>}
    </div>
  );
}
