"use client";
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  return (
    <div className="flex gap-2 items-center">
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
      <span>|</span>
      <button
        onClick={() => changeLanguage('bn')}
        className={
          i18n.language === 'bn'
            ? 'font-bold underline text-purple-600'
            : 'text-gray-500'
        }
      >
        বাংলা
      </button>
    </div>
  );
};

export default LanguageSwitcher;
