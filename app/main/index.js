const { app, ipcMain } = require('electron');
const log = require('electron-log');
const services = require('./services');
const config = require('./config');


const { menu, windowManager, nowa, utils } = services;
const { isMac, checkRegistry } = utils;
log.info('start nowa gui');

// config.clear();
// config.setTemplateUpdate('nowa-template-salt-v_1', '0.0.1');

ipcMain.on('network-change-status', (event, online) => {
  config.online(online);
});

app.on('ready', () => {
  menu.init();
  checkRegistry().then(() => {
    windowManager.create();
    nowa();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (windowManager.getWin() === null) {
    windowManager.create();
  }

  if (!windowManager.isVisible()) {
    windowManager.show();
  }
});

global.services = services;
global.config = config;
