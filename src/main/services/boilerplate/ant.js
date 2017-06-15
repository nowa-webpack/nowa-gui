import { lt } from 'semver';
import { join, dirname } from 'path';
import { existsSync, removeSync, copySync } from 'fs-extra';

import config from 'config-main-nowa';
import { request } from 'shared-nowa';

import log from '../applog';
import { download } from './util';
import mainWin from '../windowManager';
import { TEMPLATES_DIR } from '../paths';
import { getMainifest, setMainifest } from './manifest';


const get = async function () {
  console.log(`get ant boilerplate`);
  const manifest = getMainifest();
  const getTemplate = async function ({ name, git_url, description }) {
    const homepage = git_url.replace('git:', 'https:').slice(0, -4);
    const remote = homepage.concat('/archive/master.zip');
    const tempName = `@ant/${name}`;
    try {
      const target = join(TEMPLATES_DIR, tempName)
      const obj = {
        name: tempName,
        description,
        homepage,
        remote,
        type: 'ANT',
        loading: false,
        downloaded: existsSync(target),
        path: target,
      };

      //   download(remote, obj.path)
      //     .then((files) => {
      //       const dir = dirname(files[1].path);
      //       copySync(join(obj.path, dir), join(obj.path, 'proj'));
      //       removeSync(join(obj.path, dir));
      //     });

      // downloadRemoteTemplate(remote, obj.path);

      return obj;

    } catch (e) {
      log.error(e);
      mainWin.send('main-err', e);
      if (manifest.ant && manifest.ant.length > 0) {
        return manifest.ant.filter(n => n.name === tempName)[0];
      }
      return null;
    }
  };

  const url = 'http://scaffold.ant.design/list.json';

  const { data, err } = await request(url);

  if (!err) {
    const boilerplate = await Promise.all(data.list.map(getTemplate));
    // manifest.ant = boilerplate.filter(n => !!n);
    const antData = boilerplate.filter(n => !!n);

    setMainifest('ant', antData);

    return antData;
  }
  log.error(err);
  mainWin.send('main-err', err);
  return manifest.ant || [];
};
   

const load = async function ({ ...item }) {
  const { remote, path } = item;
  // item.loading = false;
  try {
    console.log(`load ant boilerplate`);
    const files = await download(remote, path);
    const dir = dirname(files[1].path);
    copySync(join(path, dir), path);
    removeSync(join(path, dir));
    item.downloaded = true;
    item.loading = false;
    return { err: false, item };
    // return 
  } catch (err) {
    log.error(err);
    mainWin.send('main-err', err);
    item.loading = false;
    return { err: true, item };
  }
};

const update = async function ({ name, tag, type, registry = config.getItem('REGISTRY') }) {
  console.log(`update ant boilerplate`);
  // const manifest = getMainifest();
  // console.log(`${registry}/${name}/${tag}`);
  // try {
  //   const { data: pkg, err } = await request(`${registry}/${name}/${tag}`);

  //   if (err) throw err;

  //   const newVersion = pkg.version;
  //   const target = `${name}-${tag}`;
  //   const folder = join(TEMPLATES_DIR, target);

  //   manifest[type].map((item) => {
  //     if (item.name === name) {
  //       item.tags = item.tags.map((_t) => {
  //         if (_t.name === tag) {
  //           _t.update = false;
  //           _t.version = newVersion;
  //         }
  //         return _t;
  //       });
  //       item.loading = false;
  //     }
  //     return item;
  //   });

  //   setMainifest(manifest);

  //   const files = await download(pkg.dist.tarball, folder);
  //   const dir = dirname(files[1].path);

  //   copySync(join(folder, dir), folder);
  //   removeSync(join(folder, dir));
  //   return {
  //     success: true,
  //     data: manifest[type]
  //   };
  // } catch (err) {
  //   log.error(err);
  //   mainWin.send('main-err', err);
  //   return { success: false, };
  // }
};

export default { get, update, load };
