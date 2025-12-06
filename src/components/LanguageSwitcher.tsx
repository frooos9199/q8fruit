"use client";
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (lng === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };
  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('ar')}
        className={
          i18n.language === 'ar'
            ? 'font-bold underline text-green-600'
            : 'text-gray-500'
        }
      >
        العربية
      </button>
      <span>|</span>
      <button
        onClick={() => changeLanguage('en')}
        className={
          i18n.language === 'en'
            ? 'font-bold underline text-blue-600'
            : 'text-gray-500'
        }
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
