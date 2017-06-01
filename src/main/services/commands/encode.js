import { execSync, execFileSync } from 'child_process';
import { isWin } from 'shared-nowa';
import config from 'config-main-nowa';
import log from '../applog';
import env from './env';

const encodeMap = {
  437: 'UTF-8',
  950: 'GBK',
  936: 'GBK',
};

export default function () {
  let encode = 'UTF-8';
  try {
    if (isWin) {
      const pageCode = execSync('chcp', { env }).toString().split(':')[1].trim();
      if (encodeMap[pageCode]) encode = encodeMap[pageCode];
      config.setItem('ENCODE', encode);
    } else {
      // const locale = execFileSync('env', { env }).toString();
      // log.error(locale);
      // const lang = stdout.split('\n')[0].split('"')[1];
      // const t = lang.split('\n')[0].split('"')[1];
      // encode = lang.split('.')[1];
    }
  } catch (e) {
    log.error(e);
  }

  console.log('encode', encode);
  config.setItem('ENCODE', encode);
  return encode;
}
