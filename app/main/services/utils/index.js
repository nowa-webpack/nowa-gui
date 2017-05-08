const ejs = require('ejs');
const { join } = require('path');
const ansiHTML = require('ansi-html');
const fs = require('fs-extra');
const { homedir } = require('os');
const semver = require('semver');
const request = require('./request');
const checkRegistry = require('./checkRegistry');
const checkEncoding = require('./checkEncoding');

ansiHTML.setColors({
  // reset: ['555', '666'], // FOREGROUND-COLOR or [FOREGROUND-COLOR] or [, BACKGROUND-COLOR] or [FOREGROUND-COLOR, BACKGROUND-COLOR]
  // black: 'aaa', // String
  red: 'ea8484',
  green: '44a195',
  yellow: 'e6d483',
  blue: '8d9eb3',
  magenta: 'ce75ce',
  // cyan: '28c2e4',
  cyan: '8dd5e4',
  // lightgrey: '888',
  darkgrey: '8dd5e4'
});

const { constants: { APP_PATH, NOWA_INSTALL_JSON_FILE, LINK_NOWA_PATH } } = require('../is');

const delay = n => new Promise(resolve => setTimeout(resolve, n));

const getPercent = (str) => {
  const a = str.split('INSTALL_PROGRESS');
  const b = a[1].replace(/[\n\s]/g, '');
  const c = b.slice(1, b.length - 1).split(',').map(i => i.split(':'));
  return parseInt(c[1][1] / c[0][1] * 100);
};

const getMockPercent = (str, percent) => {
  // const p = getPercent(str) / 20;
  const p = getPercent(str) / 14;
  const s = parseInt(Math.random() * 7);
  // if (p < 1 && percent + s < 60) {
  if (p < 3 && percent + s < 60) {
    percent += s;
  } else {
    if (p === 5 && percent < 100) {
      percent += 5;
    } else {
      percent = p * 4 + 60;
    }
  }
  return percent > 100 ? 100 : parseInt(percent);
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

  if (!fs.existsSync(modulePath)) {
    return dependencies;
  }
  
  const pkgs = dependencies.map((item) => {
    // const pkg = loadConfig(join(modulePath, item.name, 'package.json'));
    const pkg = fs.readJsonSync(join(modulePath, item.name, 'package.json'));
    return Object.assign(item, { installedVersion: pkg.version });
  });
  return pkgs;
};

const nowaDiff = () => {
  if (!fs.existsSync(LINK_NOWA_PATH)) {
    return false;
  }

  const nowaJson = fs.readJsonSync(NOWA_INSTALL_JSON_FILE);
  const nowaGUIVer = nowaJson.nowa;
  const nowaServerGUIVer = nowaJson['nowa-server'];

  const nowaCliJson = fs.readJsonSync(join(homedir(), '.nowa', 'latest-versions.json'));
  const nowaCliVer = nowaCliJson.versions.nowa;
  const nowaServerCliVer = nowaCliJson.versions['nowa-server'];
  if (semver.lt(nowaCliVer, nowaGUIVer)) {
    return true;
  }

  if (semver.lt(nowaServerCliVer, nowaServerGUIVer)) {
    return true;
  }

  return false;
};

module.exports = {
  delay,
  request,
  checkRegistry,
  checkEncoding,
  getPercent,
  getMockPercent,
  newLog,
  loadConfig,

  nowaDiff,

  getMoudlesVersion,

  getPackgeJson: () => require(join(APP_PATH, 'package.json')),

  ejsRender(tpl, data) {
    return ejs.render(tpl, data);
  },
};
