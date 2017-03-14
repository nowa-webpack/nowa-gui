const fs = require('fs-extra');
const ejs = require('ejs');
const co = require('co');
const semver = require('semver');
const download = require('download');
const { join, dirname } = require('path');
const mkdirp = require('mkdirp');

const request = require('./request');
const { getWin } = require('./window');
const { setTemplateVersion, getTemplateVersion, clear } = require('../config');
const { APP_PATH, TEMPLATES_DIR } = require('../constants');
const manifestPath = join(TEMPLATES_DIR, 'manifest.json');

/* 
  * TEPLATE TYPE: OFFICAL, CUSTOM_REMOTE, CUSTOM_LOCAL

*/

// clear();
// setTemplateVersion('nowa-template-salt-v_1', '0.0.1');


const delay = n => new Promise(resolve => setTimeout(resolve, n));

const getMainifest = () => {
  let manifest = {};

  try {
    manifest = fs.readJsonSync(manifestPath);
  } catch (e) {
    console.log(e);
  }

  return manifest;
};

const setMainifest = (newManifest) => {
  fs.writeJsonSync(manifestPath, newManifest);
};

if (!fs.existsSync(TEMPLATES_DIR)) {
  mkdirp.sync(TEMPLATES_DIR);
  fs.writeJsonSync(manifestPath, {});
} else {
  const manifest = getMainifest();
  // manifest.
  // console.log( typeof manifest)
  if (!manifest.offical) {
    fs.removeSync(TEMPLATES_DIR);
    mkdirp.sync(TEMPLATES_DIR);
    fs.writeJsonSync(manifestPath, {});
  }
}


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
          return { name: tag, version, update: false, path: folder };
        });
      } else {
        obj.tags = tags.map((tag) => {
          const version = pkg['dist-tags'][tag];
          const name = `${tempName}-${tag}`;
          const oldVersion = getTemplateVersion(name);
          return { 
            name: tag,
            version: oldVersion,
            update: semver.lt(oldVersion, version),
            path: join(TEMPLATES_DIR, name),
          };
        });
      }
      arr.push(obj);
      return obj;
    });

    let manifest = getMainifest();

    manifest.offical = arr;
    fs.writeJsonSync(manifestPath, manifest);
    // yield delay(15000);
    win.webContents.send('load-offical-templates', arr);
  }).catch((err) => {
    console.log('getOfficalTemplates', err);
    win.webContents.send('main-err', err.message);
  });
};

const updateOfficalTemplate = co.wrap(function* (tempName, tag) {
  let arr = [];
  const manifest = getMainifest();

  try {
    console.time('fetch events');
    const { data: pkg } = yield request(`https://registry.npm.taobao.org/${tempName}/${tag}`);
    console.timeEnd('fetch events');

    // const newVersion = pkg['dist-tags'][tag];
    const newVersion = pkg.version;
    // const curPkg = pkg.versions[newVersion];
    const name = `${tempName}-${tag}`;

    setTemplateVersion(name, newVersion);

    // arr = manifest.offical.map((item) => {
    manifest.offical.map((item) => {
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
    // manifest.offical = arr;
    fs.writeJsonSync(manifestPath, manifest);
    const folder = join(TEMPLATES_DIR, name);
    download(pkg.dist.tarball, folder, {
      extract: true,
      retries: 0,
      timeout: 10000
    }).then((files) => {
      const dir = dirname(files[1].path);
      fs.copySync(join(folder, dir), folder);
      fs.removeSync(join(folder, dir));
    });
  } catch (err) {
    const win = getWin();
    win.webContents.send('main-err', err.message);
  }
  // return arr;
  return manifest.offical;
});

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

const addCustomTemplates = ({ type, item }) => {
  console.log('addCustomTemplates', type);
  const win = getWin();
  const manifest = getMainifest();

  if (type === 'local') {
    const arr = manifest.local || [];

    arr.push(item);

    manifest.local = arr;
    fs.writeJsonSync(manifestPath, manifest);

    win.webContents.send('load-local-templates', arr);
  } else {
    co(function* () {
      const tempPath = join(TEMPLATES_DIR, `remote-${item.name}`);
      const { err } = yield downloadRemoteTemplate(item.remote, tempPath);

      if (err) {
        win.webContents.send('main-err', err.message);
        yield delay(1000);
        item.disable = true;
      } else {
        item.disable = false;
        item.path = tempPath;
      }

      item.loading = false;

      const arr = manifest.remote || [];
      arr.push(item);
      manifest.remote = arr;
      fs.writeJsonSync(manifestPath, manifest);

      win.webContents.send('load-remote-templates', arr);
    }).catch((err) => {
      console.log('addCustomTemplates', type, err);
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
  } else {
    manifest.local.map((_t) => {
      if (_t.id === item.id) {
        return Object.assign(_t, item);
      }
      return _t;
    });
    fs.writeJsonSync(manifestPath, manifest);

    win.webContents.send('load-local-templates', manifest.local);
  }
};

const updateCustomTemplates = (item) => {
  console.log('updateCustomTemplates');
  const win = getWin();

  co(function* () {
    const { err } = yield downloadRemoteTemplate(item.remote, item.path);

    if (err) {
      win.webContents.send('main-err', err.message);
      yield delay(1000);
      item.disable = true;
    } else {
      item.disable = false;
    }

    item.loading = false;

    const manifest = getMainifest();

    manifest.remote.map((_t) => _t.id === item.id ? item : _t);

    fs.writeJsonSync(manifestPath, manifest);

    win.webContents.send('load-remote-templates', manifest.remote);
    // downloadRemoteTemplate(item.remote, item.path)
    //   .then(({ err }) => {
    //     if (err) {
    //       win.webContents.send('main-err', err.message);
    //     }
    //   });
  }).catch((err) => {
    console.log('updateCustomTemplates', err);
    win.webContents.send('main-err', err.message);
  });
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


module.exports = {

  getOfficalTemplates,
  updateOfficalTemplate,

  getMainifest,
  setMainifest,

  addCustomTemplates,
  editCustomTemplates,
  updateCustomTemplates,
  removeCustonTemplates,

  loadConfig(promptConfigPath) {
    try {
      delete require.cache[require.resolve(promptConfigPath)];
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

