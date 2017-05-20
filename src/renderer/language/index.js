import i18nHelper from 'i18n-helper';

import zh from './zh';
import en from './en';
import { getLocalLanguage, setLocalLanguage } from 'store-renderer-nowa';

const locale = window.navigator.language;
let i18n;

const lang = getLocalLanguage();

if (lang) {
  i18n = i18nHelper(lang === 'en' ? en : zh);
} else if (locale.includes('zh')) {
  setLocalLanguage('zh');
  i18n = i18nHelper(zh);
} else {
  setLocalLanguage('en');
  i18n = i18nHelper(en);
}

export default i18n;
