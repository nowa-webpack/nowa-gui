const { app, ipcMain } = require('electron');
const log = require('electron-log');
const services = require('./services');
const config = require('./config');
const os = require('os');

const { menu, windowManager, nowa, utils, command, is } = services;
const { checkRegistry, checkEncoding } = utils;

log.info('start nowa gui');
// config.clear();
// config.setTemplateUpdate('nowa-template-salt-v_1', '0.0.1');
// console.log(config.getTemplateVersion('dingyou-dingtalk-mobile-v_1'));

ipcMain.on('network-change-status', (event, online) => {
  config.online(online);
  console.log('online', online);
  // if (online && !config.registry()) {
  if (online) {
    checkRegistry().then((registry) => {
      const win = windowManager.getWin();
      win.webContents.send('check-registry', registry);
      nowa();
    });
  } else {
    nowa();
  }
});


app.on('ready', () => {
  menu.init();
  windowManager.create();
  checkEncoding();
});

app.on('activate', () => {
  if (windowManager.getWin() === null) {
    windowManager.create();
  }

  if (!windowManager.isVisible()) {
    windowManager.show();
  }
});

app.on('window-all-closed', () => {
  console.log('window-all-closed');
  if (!is.isMac) {
    command.clearNotMacTask(() => {
      app.quit();
    });
  }
});

app.on('before-quit', () => {
  console.log('before quit');
  if (is.isMac) command.clearMacTask();
});

global.services = services;
global.config = config;
