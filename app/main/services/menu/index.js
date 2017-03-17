const { Menu } = require('electron');
const log = require('electron-log');
const menuItem = require('./menuItem');

module.exports = {

  init() {
    log.info('(menu) init');

    const menu = Menu.buildFromTemplate(menuItem());
    Menu.setApplicationMenu(menu);
  },

  reload() {
    log.info('(menu) reload');
    this.init();
  },
};