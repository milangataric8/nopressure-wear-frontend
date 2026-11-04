import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nOptions } from './options.js';

i18n.use(LanguageDetector).use(initReactI18next).init(i18nOptions);
export default i18n;
