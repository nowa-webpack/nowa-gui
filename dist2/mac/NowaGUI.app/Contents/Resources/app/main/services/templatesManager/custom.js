const fs = require('fs-extra');
const co = require('co');
const download = require('download');
const { join, dirname } = require('path');
const log = require('electron-log');

const { getWin } = require('../windowManager');
const { delay } = require('../utils');
const { constants: { TEMPLATES_DIR } } = require('../is');
const { getMainifest, setMainifest } = require('./manifest');

const downloadRemoteTemplate = (remotePath, dirpath) =>
  download(remotePath, TEMPLATES_DIR,
    {
      extract: true,
      retries: 0,
      timeout: 10000
    })
    .then((files) => {
      const dir = dirname(files[1].path);
      if (fs.existsSync(dirpath)) {
        fs.renameSync(dirpath, dirpath + '11');
        fs.renameSync(join(TEMPLATES_DIR, dir), dirpath);
        fs.removeSync(dirpath + '11');
      } else {
        fs.renameSync(join(TEMPLATES_DIR, dir), dirpath);
      }
      return { err: false };
    })
    .catch(e => ({ err: e }));

const add = ({ type, item }) => {
  console.log('addCustomTemplates', type);
  const win = getWin();
  const manifest = getMainifest();

  if (type === 'local') {
    const local = manifest.local || [];

    local.push(item);

    manifest.local = local;
    // fs.writeJsonSync(manifestPath, manifest);
    setMainifest(manifest);

    win.webContents.send('load-local-templates', local);
  } else {
    co(function* () {
      const tempPath = join(TEMPLATES_DIR, `remote-${item.name}`);
      const { err } = yield downloadRemoteTemplate(item.remote, tempPath);

      if (err) {
        win.webContents.send('main-err', err.message);
        log.error(err);
        yield delay(1000);
        item.disable = true;
      } else {
        item.disable = false;
        item.path = tempPath;
      }

      item.loading = false;

      const remote = manifest.remote || [];
      remote.push(item);
      manifest.remote = remote;
      // fs.writeJsonSync(manifestPath, manifest);
      setMainifest(manifest);
      win.webContents.send('load-remote-templates', remote);
    }).catch((err) => {
      console.log('addCustomTemplates err', type, err);
      log.error(err);
      win.webContents.send('main-err', err.message);
    });
  }
};

const edit = ({ type, item }) => {
  console.log('editCustomTemplates', type);
  const win = getWin();
  const manifest = getMainifest();

  if (type === 'remote') {
    co(function* () {
      const remote = yield manifest.remote.map(function* (_t) {
        if (_t.id === item.id) {
          item.path = join(TEMPLATES_DIR, `remote-${item.name}`);

          if (_t.name !== item.name && _t.remote === item.remote) {
            fs.renameSync(_t.path, item.path);
          }

          if (_t.remote !== item.remote) {
            const { err } = yield downloadRemoteTemplate(item.remote, item.path);
            if (err) {
              win.webContents.send('main-err', err.message);
              item.disable = true;
              log.error(err);
            } else {
              item.disable = false;
            }
          }
          return Object.assign(_t, item);
        }

        return _t;
      });

      manifest.remote = remote;
      // fs.writeJsonSync(manifestPath, manifest);
      setMainifest(manifest);
      win.webContents.send('load-remote-templates', remote);
    }).catch((err) => {
      console.log('editCustomTemplates', type, err);
      log.error(err);
      win.webContents.send('main-err', err.message);
    });
  } else {
    manifest.local.map((_t) => {
      if (_t.id === item.id) {
        return Object.assign(_t, item);
      }
      return _t;
    });
    // fs.writeJsonSync(manifestPath, manifest);
    setMainifest(manifest);
    win.webContents.send('load-local-templates', manifest.local);
  }
};

const update = (item) => {
  console.log('updateCustomTemplates');
  const win = getWin();

  co(function* () {
    const { err } = yield downloadRemoteTemplate(item.remote, item.path);

    if (err) {
      win.webContents.send('main-err', err.message);
      yield delay(1000);
      item.disable = true;
      log.error(err);
    } else {
      item.disable = false;
    }

    item.loading = false;

    const manifest = getMainifest();

    manifest.remote.map((_t) => _t.id === item.id ? item : _t);

    // fs.writeJsonSync(manifestPath, manifest);
    setMainifest(manifest);
    win.webContents.send('load-remote-templates', manifest.remote);
    
  }).catch((err) => {
    console.log('updateCustomTemplates', err);
    log.error(err);
    win.webContents.send('main-err', err.message);
  });
};

const remove = ({ type, item }) => {
  console.log('removeCustomTemplates', type);
  const win = getWin();
  const manifest = getMainifest();

  if (type === 'remote' && item.path) {
    fs.removeSync(item.path);
  }
  const filter = manifest[type].filter(_t => _t.id !== item.id);

  manifest[type] = filter;

  // fs.writeJsonSync(manifestPath, manifest);
  setMainifest(manifest);
  win.webContents.send(`load-${type}-templates`, filter);
};

module.exports = {
  add,
  edit,
  update,
  remove,
};

