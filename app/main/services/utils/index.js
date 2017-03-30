const ejs = require('ejs');
const { join } = require('path');
const ansiHTML = require('ansi-html');
const fs = require('fs-extra');
const request = require('./request');
const checkRegistry = require('./checkRegistry');

ansiHTML.setColors({
  // reset: ['555', '666'], // FOREGROUND-COLOR or [FOREGROUND-COLOR] or [, BACKGROUND-COLOR] or [FOREGROUND-COLOR, BACKGROUND-COLOR]
  // black: 'aaa', // String
  red: 'ff6b6b',
  green: '68ce51',
  yellow: 'f7de6e',
  blue: '28c2e4',
  // magenta: 'fff',
  cyan: '28c2e4',
  // lightgrey: '888',
  // darkgrey: '777'
});

const { constants: { APP_PATH } } = require('../is');

const delay = n => new Promise(resolve => setTimeout(resolve, n));

const getPercent = (str) => {
  const a = str.split('INSTALL_PROGRESS');
  const b = a[1].replace(/[\n\s]/g, '');
  const c = b.slice(1, b.length - 1).split(',').map(i => i.split(':'));
  return (c[1][1] / c[0][1] * 100).toFixed(0);
};

const getMockPercent = (str, percent) => {
  const p = getPercent(str) / 25;
  const s = parseInt(Math.random() * 7);
  if (p === 0 && percent + s < 60) {
    percent += s;
  } else {
    percent = p * 10 + 60;
  }
  return percent;
};

const newLog = (oldLog, str) => oldLog + ansiHTML(str.replace(/\n/g, '<br>'));

const loadConfig = (promptConfigPath) => {
  try {
    delete require.cache[require.resolve(promptConfigPath)];
    return require(promptConfigPath);
  } catch (err) {
    return {};
  }
};


const getMoudlesVersion = (filepath, dependencies) => {
  // const curPkg = loadConfig(join(filepath, 'package.json'));
  const modulePath = join(filepath, 'node_modules');
  const pkgs = dependencies.map((item) => {
    // const pkg = loadConfig(join(modulePath, item.name, 'package.json'));
    const pkg = fs.readJsonSync(join(modulePath, item.name, 'package.json'));
    return Object.assign(item, { installedVersion: pkg.version });
  });

  return pkgs;
};

module.exports = {
  delay,
  request,
  checkRegistry,
  getPercent,
  getMockPercent,
  newLog,
  loadConfig,

  getMoudlesVersion,

  getPackgeJson: () => require(join(APP_PATH, 'package.json')),

  ejsRender(tpl, data) {
    return ejs.render(tpl, data);
  },
};
