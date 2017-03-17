const ejs = require('ejs');
const request = require('./request');
const checkRegistry = require('./checkRegistry');
const { join } = require('path');

const { constants: { APP_PATH } } = require('../is');

const delay = n => new Promise(resolve => setTimeout(resolve, n));

module.exports = {
  delay,
  request,
  checkRegistry,

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
