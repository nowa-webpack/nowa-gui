const fs = require('fs-extra');
const ejs = require('ejs');
const co = require('co');
const semver = require('semver');
const download = require('download');
const { join } = require('path');

const request = require('./request');
const { getWin } = require('./window');
const { setTemplateVersion, getTemplateVersion } = require('../config');
const { APP_PATH, TEMPLATES_DIR } = require('../constants');

let templates = [];

const fetchTemplates = (log) => {
  const win = getWin();

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
        homepage: homepage.slice(4, homepage.length - 4)
      };

      if (!fs.existsSync(join(TEMPLATES_DIR, `${tempName}-${defaultTag}`))) {
        log.info('! exist');
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
      templates.push(obj);
      return obj;
    });
    // yield parallel(tempv);
    win.webContents.send('loadingTemplates', templates);
  }).catch((err) => {
    console.log(err);
    log.infor(err);
    win.webContents.send('MAIN_ERR', err.message);
  });
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
    win.webContents.send('MAIN_ERR', err.message);
  }
  return templates;
});

module.exports = {

  fetchTemplates,

  updateTemplate,

  getTemplates() {
    return templates;
  },

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

