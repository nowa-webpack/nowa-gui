import { lt } from 'semver';
import { join, dirname } from 'path';
import { existsSync, removeSync, copySync } from 'fs-extra';

import config from 'config-main-nowa';
import { request } from 'shared-nowa';

import log from '../applog';
import download from './download';
import mainWin from '../windowManager';
import { TEMPLATES_DIR } from '../paths';
import { getMainifest, setMainifest } from './manifest';


const get = async function ({
  type = 'official',
  registry = config.getItem('REGISTRY'),
}) {
  console.log(`get ${type} boilerplate`);
  const manifest = getMainifest();
  const getTemplate = async function (tempName) {
    const { data: pkg, err } = await request(`${registry}/${tempName}`);
    try {
      if (err) throw err;

      const distTags = pkg['dist-tags'];
      const tags = Object.keys(distTags).filter(tag => tag !== 'latest');
      const defaultTag = tags[tags.length - 1];
      const { description } = pkg.versions[distTags[defaultTag]];
      const homepage = pkg.repository.url;
      const obj = {
        name: tempName,
        defaultTag,
        description,
        homepage: homepage.slice(4, homepage.length - 4),
        type: type === 'official' ? 'OFFICIAL' : 'ALI',
        loading: false,
      };

      obj.tags = tags.map((tag) => {
        const name = `${tempName}-${tag}`;
        const tempPath = join(TEMPLATES_DIR, name);
        const version = distTags[tag];
        const o = {
          name: tag,
          // version,
          path: tempPath,
          update: false,
        };
        // 这个模板未被下载
        if (!existsSync(tempPath)) {
          o.version = version;
          download(pkg.versions[version].dist.tarball, tempPath)
            .then((files) => {
              const dir = dirname(files[1].path);
              copySync(join(tempPath, dir), tempPath);
              removeSync(join(tempPath, dir));
            });
        } else {
          const manifestItem = manifest[type].filter(n => n.name === tempName)[0];
          const oldVersion = manifestItem.tags.filter(n => n.name === tag)[0].version;
          o.version = oldVersion;
          o.update = lt(oldVersion, version);
        }

        return o;
      });

      return obj;
    } catch (e) {
      log.error(e);
      mainWin.send('main-err', e);
      if (manifest[type].length > 0) {
        return manifest[type].filter(n => n.name === tempName)[0];
      }
      return null;
    }
  };

  const url = `${registry}/${type === 'ali' ? '@ali/' : ''}nowa-gui-templates/latest`;

  const { data: repo, err } = await request(url);

  if (!err) {
    const boilerplate = await Promise.all(repo.templates.map(getTemplate));
    manifest[type] = boilerplate.filter(n => !!n);

    setMainifest(manifest);

    return boilerplate;

    // mainWin.send('load-official-templates', manifest);
  }
  log.error(err);
  mainWin.send('main-err', err);
  return manifest[type] || [];
};

const update = async function ({ name, tag, type, registry = config.getItem('REGISTRY') }) {
  console.log(`update ${type} boilerplate`);
  const manifest = getMainifest();
  console.log(`${registry}/${name}/${tag}`);
  try {
    const { data: pkg, err } = await request(`${registry}/${name}/${tag}`);

    if (err) throw err;

    const newVersion = pkg.version;
    const target = `${name}-${tag}`;
    const folder = join(TEMPLATES_DIR, target);

    manifest[type].map((item) => {
      if (item.name === name) {
        item.tags = item.tags.map((_t) => {
          if (_t.name === tag) {
            _t.update = false;
            _t.version = newVersion;
          }
          return _t;
        });
        item.loading = false;
      }
      return item;
    });

    setMainifest(manifest);

    const files = await download(pkg.dist.tarball, folder);
    const dir = dirname(files[1].path);

    copySync(join(folder, dir), folder);
    removeSync(join(folder, dir));
    return {
      success: true,
      data: manifest[type]
    };
  } catch (err) {
    log.error(err);
    mainWin.send('main-err', err);
    return { success: false, };
  }
};

export default { get, update };
