import i18nHelper from 'i18n-helper';
import { remote } from 'electron';
import _ from 'lodash';
// import { zh, en } from 'language';
import { zh, en } from '../../language';

import { getLocalLanguage, setLocalLanguage } from './localStorage';
const { locale } = remote.getGlobal('services');


let i18n;

if (getLocalLanguage()) {
  if (getLocalLanguage() === 'en') {
    i18n = i18nHelper(en);
  } else {
    i18n = i18nHelper(zh);
  }
} else {
  if (_.startsWith(locale, 'zh')) {
    setLocalLanguage('zh');
    i18n = i18nHelper(zh);
  } else {
    setLocalLanguage('en');
    i18n = i18nHelper(en);
	}
}

export default i18n;

