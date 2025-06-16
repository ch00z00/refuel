import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻訳JSONファイルのインポート
import translationEN from './locales/en/translation.json';
import translationJA from './locales/ja/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  ja: {
    translation: translationJA,
  },
};

i18n
  .use(LanguageDetector) // ブラウザの言語設定を検出
  .use(initReactI18next) // react-i18nextの初期化
  .init({
    resources,
    fallbackLng: 'ja', // デフォルトの言語
    // eslint-disable-next-line no-undef
    debug: process.env.NODE_ENV === 'development', // 開発モード時のみデバッグ情報を出力

    interpolation: {
      escapeValue: false, // ReactはXSS対策済みなのでfalse
    },

    detection: {
      // 言語検出の順序と方法
      order: [
        'querystring',
        'cookie',
        'localStorage',
        'sessionStorage',
        'navigator',
        'htmlTag',
        'path',
        'subdomain',
      ],
      caches: ['localStorage', 'cookie'], // 検出された言語を保存する場所
    },
  });

export default i18n;
