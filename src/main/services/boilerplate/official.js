/*
  官网模板，包含nowa模板和ali模板
*/
import { lt } from 'semver';
import { join, dirname } from 'path';
import { existsSync, removeSync, copySync } from 'fs-extra';

import config from 'config-main-nowa';
import { request } from 'shared-nowa';

import log from '../applog';
import mainWin from '../windowManager';
import { TEMPLATES_DIR } from '../paths';
import { getMainifest, setMainifest } from './manifest';
import { getTemplate, download } from './util'

/*
  模板形式
  {
    "name": "nowa-template-salt",
    "defaultTag": "v_2",
    "description": "h5 project template using saltui",
    "homepage": "https://github.com/nowa-webpack/template-salt",
    "type": "OFFICIAL" || "ALI",
    "loading": false,
    "tags": [
      {
        "name": "v_1",
        "path": "C:\\Users\\wb-xyl259837\\.nowa-gui\\template\\nowa-template-salt-v_1",
        "update": false,
        "downloaded": false,
        "remote": "http://registry.npm.taobao.org/nowa-template-salt/download/nowa-template-salt-1.0.2.tgz",
        "version": "1.0.2"
      },
      {
        "name": "v_2",
        ...
      }
    ]
  },
*/

// 通过 nowa-gui-templates 这个 npm 组件获取模板列表，不下载
const get = async function ({
  type = 'official',
  registry = config.getItem('REGISTRY'),
}) {
  console.log(`get ${type} boilerplate`);
  const manifest = getMainifest();
  // const registry = config.getItem('REGISTRY');

  // const url = `${registry}/nowa-gui-templates/latest`;
  const url = `${registry}/${type === 'ali' ? '@ali/' : ''}nowa-gui-templates/latest`;

  const { data: repo, err } = await request(url);

  if (!err) {
    const boilerplate = await Promise.all(
      repo.templates.map(tempName => getTemplate({
        registry,
        tempName,
        type, 
        typeData: manifest[type] || []
      }))
    );
    const typeData = boilerplate.filter(n => !!n);
    
    setMainifest(type, typeData);

    return typeData;
  }
  log.error(err);
  mainWin.send('main-err', err);
  return manifest[type] || [];
};

// 下载模板
const load = async function({
  type,
  registry = config.getItem('REGISTRY'),
  item,
  name
}) {
  const { remote, path } = item;
  const manifest = getMainifest();
  try {
    console.log(`load ${type} boilerplate`);
    const files = await download(remote, path);
    const dir = dirname(files[1].path);
    copySync(join(path, dir), path);
    removeSync(join(path, dir));
    item.downloaded = true;
    item.loading = false;
    manifest[type].map(n => n.name === name ? item : n);
    setMainifest(type, manifest[type]);
    return { err: false, data: manifest[type] };
  } catch (err) {
    log.error(err);
    mainWin.send('main-err', err);
    return { err: true, data: manifest[type] };
  }
};

// 更新模板
const update = async function ({
  name,
  item,
  type,
  registry = config.getItem('REGISTRY')
}) {
  console.log(`update ${type} boilerplate`);
  const manifest = getMainifest();
  const url = `${registry}/${name}/${item.name}`;
  console.log(url);

  try {
    const { data: pkg, err } = await request(url);

    if (err) throw err;

    const newVersion = pkg.version;
    // const target = `${name}-${item.name}`;
    // const folder = join(TEMPLATES_DIR, target);

    manifest[type].map((n) => {
      if (n.name === name) {
        n.tags = n.tags.map((_t) => {
          if (_t.name === item.name) {
            _t.update = false;
            _t.version = newVersion;
          }
          return _t;
        });
        n.loading = false;
      }
      return n;
    });

    setMainifest(type, manifest[type]);

    const files = await download(item.remote, item.path);
    const dir = dirname(files[1].path);

    copySync(join(item.path, dir), item.path);
    removeSync(join(item.path, dir));
    
    return {
      err: false,
      data: manifest[type]
    };
  } catch (err) {
    log.error(err);
    mainWin.send('main-err', err);
    return { err: true, };
  }
};


export default { get, update, load };