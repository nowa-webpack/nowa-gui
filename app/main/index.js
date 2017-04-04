const { app, ipcMain } = require('electron');
const log = require('electron-log');
const services = require('./services');
const config = require('./config');
const os = require('os');

const { menu, windowManager, nowa, utils, command } = services;
const { isMac, checkRegistry } = utils;
log.info('start nowa gui');
// config.clear();
// config.setTemplateUpdate('nowa-template-salt-v_1', '0.0.1');

ipcMain.on('network-change-status', (event, online) => {
  config.online(online);
  console.log('online', online);
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

app.on('before-quit', () => {
  console.log('quit');
  // const task = global.cmd.start;
  const { getCmd } = require('./services/task');
  const task = getCmd('start');
  // if (task) {
    Object.keys(task).forEach((item) => {
      console.log(item);
      if (task[item].term) {
        task[item].term.kill();
      }
    });
  // }
});

global.services = services;
global.config = config;
