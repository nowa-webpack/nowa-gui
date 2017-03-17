const fs = require('fs-extra');
const co = require('co');
const semver = require('semver');
const download = require('download');
const { join, dirname } = require('path');
const log = require('electron-log');

const { getWin } = require('../windowManager');
const { request } = require('../utils');
const { registry, setTemplateVersion, getTemplateVersion } = require('../../config');
const { constants: { TEMPLATES_DIR } } = require('../is');
const { getMainifest, setMainifest } = require('./manifest');

const get = () => {
  console.log('getOfficialTemplates');
  const win = getWin();
  // const arr = [];

  co(function* () {
    const { data: repo } = yield request(`${registry()}/nowa-gui-templates/latest`);

    const official = yield repo.templates.map(function* (tempName) {
      const { data: pkg } = yield request(`${registry()}/${tempName}`);
      const tags = Object.keys(pkg['dist-tags']).filter(tag => tag !== 'latest');
      const defaultTag = tags[tags.length - 1];
      const { description } = pkg.versions[pkg['dist-tags'][defaultTag]];
      const homepage = pkg.repository.url;
      const obj = {
        name: tempName,
        defaultTag,
        description,
        // image,
        homepage: homepage.slice(4, homepage.length - 4),
        type: 'OFFICIAL'
      };

      if (!fs.existsSync(join(TEMPLATES_DIR, `${tempName}-${defaultTag}`))) {
        console.log('! exist');
        obj.tags = tags.map((tag) => {
          const version = pkg['dist-tags'][tag];
          const name = `${tempName}-${tag}`;
          const curPkg = pkg.versions[version];
          const folder = join(TEMPLATES_DIR, name);

          setTemplateVersion(name, version);
          download(curPkg.dist.tarball, folder, {
            extract: true,
            retries: 0,
            timeout: 10000
          }).then((files) => {
            const dir = dirname(files[1].path);
            fs.copySync(join(folder, dir), folder);
            fs.removeSync(join(folder, dir));
          });
          return {
            name: tag,
            version,
            update: false,
            path: folder
          };
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
      // arr.push(obj);
      return obj;
    });

    const manifest = getMainifest();

    manifest.official = official;
    setMainifest(manifest);
    // yield delay(15000);
    win.webContents.send('load-official-templates', official);
  }).catch((err) => {
    console.log('getOfficialTemplates', err);
    log.error(err);
    win.webContents.send('main-err', err.message);
  });
};

const update = (tempName, tag) => co(function* () {
  // const arr = [];
  const manifest = getMainifest();

  try {
    console.time('fetch official templates');
    const { data: pkg } = yield request(`${registry()}/${tempName}/${tag}`);
    console.timeEnd('fetch official templates');

    const newVersion = pkg.version;
    const name = `${tempName}-${tag}`;
    const folder = join(TEMPLATES_DIR, name);

    setTemplateVersion(name, newVersion);

    manifest.official.map((item) => {
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
    // fs.writeJsonSync(manifestPath, manifest);
    setMainifest(manifest);
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
    log.error(err);
    win.webContents.send('main-err', err.message);
  }
  // return arr;
  return manifest.official;
});

module.exports = {
  get,
  update,
};
