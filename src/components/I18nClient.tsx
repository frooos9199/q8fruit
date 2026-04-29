"use client";

import { useEffect } from 'react';
import i18n from '@/i18n';

const STORAGE_KEY = 'app_language';
const SUPPORTED_LANGS = new Set(['ar', 'en', 'bn']);

const resolveDir = (lng: string) => (lng === 'ar' ? 'rtl' : 'ltr');
const resolveHtmlLang = (lng: string) => (lng === 'ar' ? 'ar' : lng === 'bn' ? 'bn' : 'en');

export default function I18nClient() {
  useEffect(() => {
    const applyHtmlAttrs = (lng: string) => {
      const safeLng = SUPPORTED_LANGS.has(lng) ? lng : 'ar';
      document.documentElement.dir = resolveDir(safeLng);
      document.documentElement.lang = resolveHtmlLang(safeLng);
    };

    const loadSavedLanguage = () => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGS.has(saved) && saved !== i18n.language) {
          i18n.changeLanguage(saved);
        }
      } catch {
        // ignore
      }

      applyHtmlAttrs(i18n.language);
    };

    const onLanguageChanged = (lng: string) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, lng);
      } catch {
        // ignore
      }
      applyHtmlAttrs(lng);
    };

    loadSavedLanguage();
    i18n.on('languageChanged', onLanguageChanged);

    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  return null;
}
