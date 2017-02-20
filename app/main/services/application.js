const fs = require('fs-extra');
const ejs = require('ejs');
const co = require('co');
const parallel = require('co-parallel');
const semver = require('semver');
const download = require('download');
const { join } = require('path');
// const log = require('electron-log');

const request = require('./request');
const { getWin } = require('./window');
const { setTemplateVersion, getTemplateVersion, clear } = require('../config');
const { APP_PATH, TEMPLATES_DIR } = require('../constants');


let templates = [];
// clear();
// npm_config_cache

const fetchTemplates = (log) => {
  const win = getWin();
  co(function* () {
    const { data: repo } = yield request('https://registry.npm.taobao.org/nowa-gui-templates/latest');
    log.info(repo.templates);
    yield repo.templates.map(function* (tempName) {
    // const tempv = repo.templates.map(function* (tempName) {
      const { data: pkg } = yield request(`https://registry.npm.taobao.org/${tempName}`);
      const tags = Object.keys(pkg['dist-tags']).filter(tag => tag !== 'latest');
      const defaultTag = tags[tags.length - 1];
      const { description, image } = pkg.versions[pkg['dist-tags'][defaultTag]];

      const obj = {
        name: tempName,
        defaultTag,
        description,
        image,
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

    // return templates;
  } catch (err) {
    const win = getWin();
    win.webContents.send('MAIN_ERR', err.message);
    // return { err };
  }
  return templates;
});

module.exports = {

  fetchTemplates,

  updateTemplate,
  getTemplates() {
    return templates;
  },

  getTemplatesManifest() {
    return manifest;
  },

  loadConfig(promptConfigPath) {
    try {
      return require(promptConfigPath);
    } catch (err) {
      // const win = getWin();
      // win.webContents.send('MAIN_ERR', err.message);
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
const fetchTemplates = () => {
  const win = getWin();
  const manifestPath = join(BASE_DIR, 'manifest.json');

  const isExisted = fs.existsSync(manifestPath);

  if (isExisted) {
    manifest = fs.readJsonSync(manifestPath);
  }

  co(function* () {
    const { data } = yield request('http://g.alicdn.com/alinw-utils/nowa-init-templates/manifest.json?');
    const urls = data.map(item => `${item.events}?access_token=e6636013dd0ac9657a95710a5bbdb63449785cea`);
    const values = yield urls.map(function* (url) {
      const ev = yield request(url);
      if (ev.err) {
        console.log(ev.err);
        win.webContents.send('MAIN_ERR', ev.err.message);
        return [];
      }
      return new Date(ev.data[0].created_at).getTime();
    });

    templates = data.map((item, i) => {
      const newDate = values[i];
      const oldDate = getTemplateUpdate(item.name);

      item.isNew = false;
      // item.isNew = true;

      if (oldDate) {
        if (oldDate < newDate) {
          item.update = true;
        }
      } else {
        item.isNew = true;

        setTemplateUpdate(item.name, newDate);
      }

      return item;
    });

    win.webContents.send('loadingTemplates', templates);

    return templates;
  }).then((temp) => {
    co(function* () {
      yield temp.map(function* (item) {
        if (item.isNew) {
          yield item.branch.map(function* (branch) {
            try {
              const files = yield download(branch.zipfile,
              // const files = yield download(branch,
                BASE_DIR,
                {
                  extract: true,
                  retries: 0,
                  timeout: 10000
                });
              console.log('download!', files[0].path);

              manifest[`${item.name}-${branch.name}`] = files[0].path;
            } catch (e) {
              yield Promise.reject(e);
            }
          });
          fs.writeJsonSync(manifestPath, manifest);
        }
      });
    }).catch(err => win.webContents.send('MAIN_ERR', err.message));
  }).catch(err => win.webContents.send('MAIN_ERR', err.message));
};*/

 /*console.time('fetch events');
    const ev = yield request(`${item.events}?access_token=e6636013dd0ac9657a95710a5bbdb63449785cea`);
    console.timeEnd('fetch events');

    const newDate = new Date(ev.data[0].created_at).getTime();

    setTemplateUpdate(item.name, newDate);

    item.update = false;

    templates = templates.map(temp => (temp.name === item.name ? item : temp));

    item.branch.map(branch =>
      download(branch.zipfile, BASE_DIR, {
        extract: true,
        retries: 0,
        timeout: 10000
      })
    );*/
