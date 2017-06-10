import { request } from 'shared-nowa';
import config from 'config-main-nowa';
import { join, dirname } from 'path';
import { copySync, removeSync } from 'fs-extra';

import { APP_PATH } from './services/paths';
import log from './services/applog';
import mainWin from './services/windowManager';
import download from './services/boilerplate/download';

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
}

export default update;

