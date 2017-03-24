const ejs = require('ejs');
const { join } = require('path');
const ansiHTML = require('ansi-html');
const request = require('./request');
const checkRegistry = require('./checkRegistry');


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

module.exports = {
  delay,
  request,
  checkRegistry,
  getPercent,
  getMockPercent,
  newLog,

  getPackgeJson: () => require(join(APP_PATH, 'package.json')),

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
};
