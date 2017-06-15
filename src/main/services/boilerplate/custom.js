import { join, dirname } from 'path';
import { existsSync, removeSync, renameSync, copySync } from 'fs-extra';
import { delay } from 'shared-nowa';

import log from '../applog';
import { download } from './util';
import mainWin from '../windowManager';
import { TEMPLATES_DIR } from '../paths';
import { getMainifest, setMainifest } from './manifest';

/*const downloadRemoteTemplate = async function (item) {
  const { path, remote } = item;
  try {
    const files = await download(remote, path);
    const dir = dirname(files[1].path);

    if (existsSync(path)) {
      renameSync(path, `${path}-tn11`);
      renameSync(join(TEMPLATES_DIR, dir), path);
      removeSync(`${path}-tn11`);
    } else {
      renameSync(join(TEMPLATES_DIR, dir), path);
    }
    item.disable = false;

    return item;
  } catch (err) {
    log.error('downloadRemoteTemplate', err);
    mainWin.send('main-err', err.message);
    await delay(500);
    item.disable = true;
  }
};*/

/*const newRemote = async function (item) {
  console.log('newRemote');
  const manifest = getMainifest();

  try {
    const tempPath = join(TEMPLATES_DIR, `@remote/${item.name}`);

    // if (!item.disable) {
    
    // }
    item.path = tempPath;
    item.loading = false;
    item.downloaded = false;
    item.disable = false;

    const remote = manifest.remote || [];
    remote.push(item);
    // manifest.remote = remote;
    setMainifest('remote', remote);
    return {
      success: true,
      data: manifest.remote
    };
  } catch (err) {
    log.error('newRemote', err);
    mainWin.send('main-err', err);
    return {
      success: false,
    };
  }
};*/

/*const newRemote = async function (raw) {
  console.log('newRemote');
  const manifest = getMainifest();

  try {
    const tempPath = join(TEMPLATES_DIR, `remote-${raw.name}`);
    const item = await downloadRemoteTemplate(raw, tempPath);

    if (!item.disable) {
      item.path = tempPath;
    }

    item.loading = false;

    const remote = manifest.remote || [];
    remote.push(item);
    manifest.remote = remote;
    setMainifest(manifest);
    return {
      success: true,
      data: manifest.remote
    };
  } catch (err) {
    log.error('newRemote', err);
    mainWin.send('main-err', err);
    return {
      success: false,
    };
  }
};*/

/*const editRemote = async function (raw) {
  console.log('editRemote');
  const manifest = getMainifest();
  let item = raw;

  try {
    // if (item.loading) {
    //   item = await downloadRemoteTemplate(raw, raw.path);

    //   if (item.disable) {
    //     return {
    //       success: false,
    //     };
    //   }
    //   item.loading = false;
    // }

    manifest.remote = manifest.remote.map(n => n.id === item.id ? item : n);
    setMainifest('remote', manifest.remote);
    return {
      success: true,
      data: manifest.remote
    };
  } catch (err) {
    log.error(err);
    mainWin.send('main-err', err.message);
  }
};*/

/*const updateRemote = async function (raw) {
  console.log('updateRemote');
  try {
    const manifest = getMainifest();
    const item = await downloadRemoteTemplate(raw, raw.path);

    item.loading = false;
    manifest.remote.map(n => n.id === item.id ? item : n);

    setMainifest(manifest);
    return {
      success: true,
      data: manifest.remote
    };
  } catch (err) {
    log.error('updateRemote', err);
    mainWin.send('main-err', err.message);
    return { success: false, };
  // }
};*/

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
    // console.log(manifest.remote);
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
    // const manifest = getMainifest();
    // manifest.local = local;
    setMainifest('local', local);
  } catch (err) {
    log.error('changeLocal', err);
    mainWin.send('main-err', err.message);
  }
};

const get = () => {
  const manifest = getMainifest();
  if (manifest.local) {
    manifest.local.map((item) => {
      item.disable = !existsSync(item.path);
      return item;
    });
  }
  return manifest;
};

export default {
  // newRemote,
  // editRemote,
  load,
  // updateRemote,
  removeRemote,
  get,
  changeLocal,
  changeRemote,
};

