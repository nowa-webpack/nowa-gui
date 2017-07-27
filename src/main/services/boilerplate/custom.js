/*
  自定义模板，包含远程模板和本地模板
*/
import { join, dirname } from 'path';
import { existsSync, removeSync, renameSync, copySync } from 'fs-extra';
import { delay } from 'shared-nowa';

import log from '../applog';
import { download } from './util';
import mainWin from '../windowManager';
import { TEMPLATES_DIR } from '../paths';
import { getMainifest, setMainifest } from './manifest';


/*
  自定义模板形式

  {
    "name": "dd-test",
    "remote": "https://github.com/caohaijiang/dingyou-dingtalk-mobile/archive/master.zip",
    "id": "48509e11-8f5c-4d8d-b874-591e87954b24",
    "disable": false,
    "loading": false,
    "downloaded": true,
    "path": "C:\\Users\\wb-xyl259837\\.nowa-gui\\template\\@remote\\dd-test"
  }
*/

// 移除远程模板
const removeRemote = (item) => {
  console.log('removeRemote');
  const manifest = getMainifest();

  if (existsSync(item.path)) {
    removeSync(item.path);
  }
  const filter = manifest.remote.filter(n => n.id !== item.id);

  // manifest.remote = filter;

  setMainifest('remote', filter);
};

// 下载远程模板
const load = async function ({ ...item }) {
  const { remote, path, id } = item;
  const manifest = getMainifest();
  try {
    console.log(`load remote boilerplate`);
    const files = await download(remote, path);
    const dir = dirname(files[1].path);
    copySync(join(path, dir), path);
    removeSync(join(path, dir));
    item.disable = false;
    item.loading = false;
    item.downloaded = true;
    manifest.remote = manifest.remote.map(n => n.id === id ? item : n);
    setMainifest('remote', manifest.remote);
    return { err: false, data: manifest.remote };
  } catch (err) {
    log.error(err);
    mainWin.send('main-err', err);
    item.disable = true;
    item.loading = false;
    manifest.remote = manifest.remote.map(n => n.id === id ? item : n);
    setMainifest('remote', manifest.remote);
    return { err: true, data: manifest.remote };
  }
};

const changeRemote = (remote) => {
  try {
    setMainifest('remote', remote);
  } catch (err) {
    log.error('changeRemote', err);
    mainWin.send('main-err', err.message);
  }
};

const changeLocal = (local) => {
  try {
    setMainifest('local', local);
  } catch (err) {
    log.error('changeLocal', err);
    mainWin.send('main-err', err.message);
  }
};

// 获取自定义模板列表
const get = () => {
  const manifest = getMainifest();
  // 如果本地模板原始路径丢失，则去除改模板
  if (manifest.local) {
    manifest.local.map((item) => {
      item.disable = !existsSync(item.path);
      return item;
    });
  }
  return manifest;
};

export default {
  load,
  removeRemote,
  get,
  changeLocal,
  changeRemote,
};

