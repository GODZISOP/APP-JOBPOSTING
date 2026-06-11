import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import ur from './ur.json';

const LANGUAGE_KEY = '@app_lang';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLang) {
        // Map saved names back to language codes for i18next
        if (storedLang === 'Urdu') return callback('ur');
        // By default, fallback to English
        return callback('en');
      }
      return callback('en');
    } catch (error) {
      console.log('Error reading language', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      // We map the internal language code back to the human readable name for backward compatibility
      const nameMap = {
        'en': 'English',
        'ur': 'Urdu'
      };
      await AsyncStorage.setItem(LANGUAGE_KEY, nameMap[language] || 'English');
    } catch (error) {}
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Prevents loading screens on language change
    }
  });

export default i18n;
