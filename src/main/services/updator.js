import { lt } from 'semver';
// import { join, dirname } from 'path';
// import { copySync, removeSync } from 'fs-extra';

import config from 'config-main-nowa';
import { request } from 'shared-nowa';

// import { APP_PATH, APP_VERSION } from './paths';
import { APP_VERSION } from './paths';
import log from './applog';
import mainWin from './windowManager';
// import download from './boilerplate/download';

/*
async function update() {
  const { data: pkg, err } = await request(`${config.getItem('REGISTRY')}/nowa-gui/latest`);
  try {
    if (err) throw err;
    const target = join(APP_PATH, 'do');
    download(pkg.dist.tarball, target)
      .then((files) => {
        const dir = dirname(files[1].path);
        console.log(dir);
        copySync(join(target, dir), target);
        removeSync(join(target, dir));
      });
  } catch (e) {
    log.error(e);
    mainWin.send('main-err', e);
  }
}*/

// const EXTENSION_MAP = {
//   win32: 'exe',
//   darwin: 'dmg',
//   linux: 'deb',
// };

class Updator {
  constructor() {
    // super();
    this.extension = {
      win32: 'exe',
      darwin: 'dmg',
      linux: 'deb',
    };
  }

  async checkAPPUpdate() {
    const registry = config.getItem('REGISTRY');
    const { data, err } = await request(`${registry}/nowa-gui-version-test/latest`);

    if (err) {
      log.error(err);
      mainWin.send('main-err', err);
      return { update: false };
    }

    const { version, innerUpdate } = data;

    if (lt(APP_VERSION, version)) {
      return {
        update: true,
        innerUpdate,
        newVersion: version,
        upgradeUrl: innerUpdate ? ''
          : `${data.downloadDomain}/${version}/NowaGUI.${this.extension[process.platform]}`
      };
    }
    return { update: false };
  }

}

export default new Updator();
