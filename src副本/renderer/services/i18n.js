import i18nHelper from 'i18n-helper';
import { remote } from 'electron';
import _ from 'lodash';
import { zh, en } from 'language';

const { locale } = remote.getGlobal('services');
const storage = window.localStorage;

let i18n;

if (storage.getItem('LANGUAGE')) {
  if (storage.getItem('LANGUAGE') === 'en') {
    i18n = i18nHelper(en);
  } else {
    i18n = i18nHelper(zh);
  }
} else {
  if (_.startsWith(locale, 'zh')) {
    storage.setItem('LANGUAGE', 'zh');
    i18n = i18nHelper(zh);
  } else {
    storage.setItem('LANGUAGE', 'en');
    i18n = i18nHelper(en);
	}
}

export default i18n;

