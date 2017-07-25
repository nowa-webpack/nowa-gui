import { lt } from 'semver';
import { join, dirname } from 'path';
import { copySync, removeSync } from 'fs-extra';

import config from 'config-main-nowa';
import { request } from 'shared-nowa';

import log from './applog';
import mainWin from './windowManager';
import { download } from './boilerplate/util';
import { APP_PATH, APP_VERSION } from './paths';


const extension = {
  win32: 'exe',
  darwin: 'dmg',
  linux: 'deb',
};

class Updator {
  constructor() {
    this.remoteUrl = '';
  }

  async check() {
    const registry = config.getItem('REGISTRY');
    const { data, err } = await request(`${registry}/nowa-gui-version/latest`);

    if (err) {
      log.error(err);
      mainWin.send('main-err', err);
      return { update: false };
    }

    const { version, innerUpdate } = data;
    this.remoteUrl = data.dist.tarball;

    if (lt(APP_VERSION, version)) {
      return {
        update: true,
        innerUpdate,
        newVersion: version,
        upgradeUrl: innerUpdate ? ''
          // : `${data.downloadDomain}/${version}/NowaGUI.${extension[process.platform]}`
          : `${data.downloadDomain}/nowa-gui.${extension[process.platform]}`
      };
    }
    return { update: false };
  }

  async override() {
    const target = APP_PATH;
    try {
      const files = await download(this.remoteUrl, target);
      const dir = dirname(files[1].path);
      copySync(join(target, dir), target);
      removeSync(join(target, dir));
      return { err: false, msg: '' };
    } catch (e) {
      log.error('download err', e);
      return { err: true, msg: e.message };
    }
  }
}

export default new Updator();
