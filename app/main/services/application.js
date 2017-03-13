const fs = require('fs-extra');
const ejs = require('ejs');
const co = require('co');
const semver = require('semver');
const download = require('download');
const { join, dirname } = require('path');
const mkdirp = require('mkdirp');

const request = require('./request');
const { getWin } = require('./window');
const { setTemplateVersion, getTemplateVersion } = require('../config');
const { APP_PATH, TEMPLATES_DIR } = require('../constants');
const manifestPath = join(TEMPLATES_DIR, 'manifest.json');

/* 
  * TEPLATE TYPE: OFFICAL, CUSTOM_REMOTE, CUSTOM_LOCAL

*/
const delay = n => new Promise(resolve => setTimeout(resolve, n));

if (!fs.existsSync(TEMPLATES_DIR)) {
  mkdirp.sync(TEMPLATES_DIR);
  fs.writeJsonSync(manifestPath, {});
}

const getMainifest = () => {
  let manifest = {};

  try {
    manifest = fs.readJsonSync(manifestPath);
    // manifest = JSON.parse(fs.readFileSync(manifestPath));
  } catch (e) {
    console.log(e);
  }

  return manifest;
};

const getOfficalTemplates = () => {
  console.log('getOfficalTemplates');
  const win = getWin();
  let arr = [];
  co(function* () {
    const { data: repo } = yield request('https://registry.npm.taobao.org/nowa-gui-templates/latest');
    yield repo.templates.map(function* (tempName) {
      const { data: pkg } = yield request(`https://registry.npm.taobao.org/${tempName}`);
      const tags = Object.keys(pkg['dist-tags']).filter(tag => tag !== 'latest');
      const defaultTag = tags[tags.length - 1];
      const { description, image } = pkg.versions[pkg['dist-tags'][defaultTag]];
      const homepage = pkg.repository.url;
      const obj = {
        name: tempName,
        defaultTag,
        description,
        image,
        homepage: homepage.slice(4, homepage.length - 4),
        type: 'OFFICAL'
      };

      if (!fs.existsSync(join(TEMPLATES_DIR, `${tempName}-${defaultTag}`))) {
        console.log('! exist');
        obj.tags = tags.map((tag) => {
          const version = pkg['dist-tags'][tag];
          const name = `${tempName}-${tag}`;
          const curPkg = pkg.versions[version];

          setTemplateVersion(name, version);
          const folder = join(TEMPLATES_DIR, name);
          download(curPkg.dist.tarball, folder, {
            extract: true,
            retries: 0,
            timeout: 10000
          }).then(files => {
            const dir = dirname(files[1].path);
            fs.copySync(join(folder, dir), folder);
            fs.removeSync(join(folder, dir));
          });
          return { name: tag, version, update: false };
        });
      } else {
        obj.tags = tags.map((tag) => {
          const version = pkg['dist-tags'][tag];
          const name = `${tempName}-${tag}`;
          const oldVersion = getTemplateVersion(name);
          return { name: tag, version: oldVersion, update: semver.lt(oldVersion, version) };
        });
      }
      arr.push(obj);
      return obj;
    });

    let manifest = {};
    try {
      manifest = fs.readJsonSync(manifestPath);
    } catch (e) { console.log(e);}

    manifest.offical = arr;
    fs.writeJsonSync(manifestPath, manifest);

    win.webContents.send('load-offical-templates', arr);
  }).catch((err) => {
    console.log('getOfficalTemplates', err);
    win.webContents.send('main-err', err.message);
  });
};

/*const getCustomRemoteTemplates = (remoteTemp) => {
  console.log('getCustomRemoteTemplates');
  const win = getWin();
  let manifest = {};
  try {
    manifest = fs.readJsonSync(manifestPath);
  } catch (e) {console.log(e); }

  if (manifest.remote && manifest.remote.length === 0) {
    co(function* () {
      const arr = yield remoteTemp.map(function* (temp) {
        const tempPath = join(TEMPLATES_DIR, `remote-${temp.name}`);
        const { err } = yield download(temp.remote, TEMPLATES_DIR, {
          extract: true,
          retries: 0,
          timeout: 20000
        })
        .then(() => ({ err: false }))
        .catch(e => ({ err: e }));

        if (err) {
          win.webContents.send('main-err', err.message);
          yield delay(1000);
          temp.disable = true;
          // return false;
        } else {
          temp.disable = false;
          temp.path = tempPath;
        }
        return temp;
      });
      console.log(arr);

      manifest.remote = arr.filter(n => !!n);
      fs.writeJsonSync(manifestPath, manifest);

      win.webContents.send('load-remote-templates', arr);
    }).catch((err) => {
      console.log('getCustomRemoteTemplates', err);
      win.webContents.send('main-err', err.message);
    });
  } else {
    win.webContents.send('load-remote-templates', manifest.remote);
  }

};*/

/*const getCustomTemplates = (type) => {
  console.log('getCustomTemplates', type);
  const win = getWin();
  let manifest = getMainifest();

  win.webContents.send(`load-${type}-templates`, manifest[type] || []);
};*/

const downloadRemoteTemplate = (remotePath, dirpath) => {
  return download(remotePath, TEMPLATES_DIR,
    {
      extract: true,
      retries: 0,
      timeout: 20000
    })
    .then((files) => {
      const dir = dirname(files[1].path);
      fs.renameSync(join(TEMPLATES_DIR, dir), dirpath);
      return { err: false };
    })
    .catch(e => ({ err: e }));
}

const addCustomTemplates = ({ type, item }) => {
  console.log('addCustomTemplates', type);
  const win = getWin();
  let manifest = getMainifest();

  if (type === 'local') {

  } else {
    co(function* () {
      const tempPath = join(TEMPLATES_DIR, `remote-${item.name}`);
      const { err } = yield downloadRemoteTemplate(item.remote, tempPath);
      /*const { err } = yield download(item.remote, TEMPLATES_DIR, {
          extract: true,
          retries: 0,
          timeout: 20000
        })
        .then((files) => {
          const dir = dirname(files[1].path);
          fs.renameSync(join(TEMPLATES_DIR, dir), tempPath);
          return { err: false };
        })
        .catch(e => ({ err: e }));*/

      if (err) {
        win.webContents.send('main-err', err.message);
        yield delay(1000);
        item.disable = true;
        // return false;
      } else {
        item.disable = false;
        item.path = tempPath;
      }
      const arr = manifest.remote || [];
      arr.push(item);
      manifest.remote = arr;
      fs.writeJsonSync(manifestPath, manifest);

      win.webContents.send('load-remote-templates', arr);
    }).catch((err) => {
      console.log('getCustomTemplates', type, err);
      win.webContents.send('main-err', err.message);
    });
  }

};

const editCustomTemplates = ({ type, item }) => {
  console.log('editCustomTemplates', type);
  const win = getWin();
  const manifest = getMainifest();

  if (type === 'remote') {
    co(function* () {
      const arr = yield manifest.remote.map(function* (_t) {
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
            } else {
              item.disable = false;
            }
          }
          return Object.assign(_t, item);
        }

        return _t;
      });

      manifest.remote = arr;
      fs.writeJsonSync(manifestPath, manifest);

      win.webContents.send('load-remote-templates', arr);

    }).catch((err) => {
      console.log('getCustomTemplates', type, err);
      win.webContents.send('main-err', err.message);
    });
  }

  /*manifest[type].map((_item) => {
    if (_item.id === item.id) {
      return Object.assign(_item, item);
    }
    return _item;
  });*/

};

const updateCustomTemplates = (item) => {
  console.log('updateCustomTemplates');
  const win = getWin();
  // const manifest = getMainifest();

  download(item.remote, TEMPLATES_DIR,
    {
      extract: true,
      retries: 0,
      timeout: 20000
    })
    .then((files) => {
      const dir = dirname(files[1].path);
      fs.renameSync(item.path, item.path + '11');
      fs.renameSync(join(TEMPLATES_DIR, dir), item.path);
      fs.removeSync(item.path + '11');
      return { err: false };
    })
    .catch(err => {
      win.webContents.send('main-err', err.message);
    });

  // downloadRemoteTemplate(item.remote, item.path)
  //   .then(({ err }) => {
  //     if (err) {
  //       win.webContents.send('main-err', err.message);
  //     }
  //   });
};

const removeCustonTemplates = ({ type, item }) => {
  console.log('removeCustomTemplates', type);
  const win = getWin();
  const manifest = getMainifest();

  if (type === 'remote' && item.path){
    fs.removeSync(item.path);
  }
  const filter = manifest[type].filter(_t => _t.id !== item.id);

  manifest[type] = filter;

  fs.writeJsonSync(manifestPath, manifest);

  win.webContents.send(`load-${type}-templates`, filter);
};

/*const getCustomLocalTemplates = (localTemp) => {
  console.log('getCustomLocalTemplates');
  const win = getWin();
  let manifest = {};
  try {
    manifest = fs.readJsonSync(manifestPath);
  } catch (e) { 
    console.log(e);
  }

  manifest.local = localTemp;
  fs.writeJsonSync(manifestPath, manifest);

  win.webContents.send('load-local-templates', localTemp);

};*/

const getOfflineTemplates = () => {
  console.log('getOfflineTemplates');

};





/*
const fetchOfficalTemplates = (log) => {
  const win = getWin();
  let arr = [];

  co(function* () {
    const { data: repo } = yield request('https://registry.npm.taobao.org/nowa-gui-templates/latest');
    log.info(repo.templates);
    yield repo.templates.map(function* (tempName) {
      const { data: pkg } = yield request(`https://registry.npm.taobao.org/${tempName}`);
      const tags = Object.keys(pkg['dist-tags']).filter(tag => tag !== 'latest');
      const defaultTag = tags[tags.length - 1];
      const { description, image } = pkg.versions[pkg['dist-tags'][defaultTag]];
      const homepage = pkg.repository.url;
      const obj = {
        name: tempName,
        defaultTag,
        description,
        image,
        homepage: homepage.slice(4, homepage.length - 4),
        type: 'OFFICAL'
      };

      if (!fs.existsSync(join(TEMPLATES_DIR, `${tempName}-${defaultTag}`))) {
        log.info('! exist');
        console.log('! exist')
        obj.tags = tags.map((tag) => {
          const version = pkg['dist-tags'][tag];
          const name = `${tempName}-${tag}`;
          const curPkg = pkg.versions[version];

          setTemplateVersion(name, version);
          download(curPkg.dist.tarball, join(TEMPLATES_DIR, name), {
            extract: true,
            retries: 0,
            timeout: 10000
          });
          return { name: tag, version, update: false };
        });
      } else {
        obj.tags = tags.map((tag) => {
          const version = pkg['dist-tags'][tag];
          const name = `${tempName}-${tag}`;
          const oldVersion = getTemplateVersion(name);
          return { name: tag, version: oldVersion, update: semver.lt(oldVersion, version) };
        });
      }
      // log.info(obj);
      arr.push(obj);

      return obj;
    });

    templates = arr;

    fs.writeJsonSync(join(TEMPLATES_DIR, 'manifest.json'), arr);

    win.webContents.send('load-templates', templates);
  }).catch((err) => {
    console.log('fetchOfficalTemplates', err);
    log.infor(err);
    win.webContents.send('main-err', err.message);
  });
};

const getLocalTemplates = () => {
  try {
    const win = getWin();
    const manifestPath = join(TEMPLATES_DIR, 'manifest.json');

    if (fs.existsSync(manifestPath)) {
      templates = fs.readJsonSync(manifestPath);
    }
    win.webContents.send('load-templates', templates);
  } catch (e) {
    console.log('getLocalTemplates', e);
  }
};

const updateTemplate = co.wrap(function* (tempName, tag) {

  try {
    console.time('fetch events');
    const { data: pkg } = yield request(`https://registry.npm.taobao.org/${tempName}`);
    console.timeEnd('fetch events');

    const newVersion = pkg['dist-tags'][tag];
    const curPkg = pkg.versions[newVersion];
    const name = `${tempName}-${tag}`;

    setTemplateVersion(name, newVersion);

    templates = templates.map((item) => {
      if (item.name === tempName) {
        item.tags = item.tags.map((_t) => {
          if (_t.name === tag) {
            _t.update = false;
            _t.version = newVersion;
          }
          return _t;
        });
      }
      return item;
    });
    
    download(curPkg.dist.tarball, join(TEMPLATES_DIR, name), {
      extract: true,
      retries: 0,
      timeout: 10000
    });

  } catch (err) {
    const win = getWin();
    win.webContents.send('main-err', err.message);
  }
  return templates;
});*/

module.exports = {

  getOfficalTemplates,
  getOfflineTemplates,
  getMainifest,
  addCustomTemplates,
  editCustomTemplates,
  updateCustomTemplates,
  removeCustonTemplates,

  loadConfig(promptConfigPath) {
    try {
      return require(promptConfigPath);
    } catch (err) {
      return {};
    }
  },

  ejsRender(tpl, data) {
    return ejs.render(tpl, data);
  },

  getPackgeJson() {
    const json = fs.readJsonSync(join(APP_PATH, 'package.json'));
    return json;
  }
};

