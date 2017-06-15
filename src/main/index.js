import { app, ipcMain } from 'electron';
import cnr from 'check-npm-registry';

import { isDev, isMac } from 'shared-nowa';
import services from './services';
import config from './userConfig';

const { menu, mainWin, log, tray, commands, nowa, requests } = services;

// 初始化任务， 必须在有网的判断下进行
const initialTasks = async function (event, online) {
  console.log('network', online);
  config.setItem('ONLINE', online);

  let registry = config.getItem('REGISTRY');

  if (!registry) {
    if (online) {
      registry = await cnr();
      config.setItem('REGISTRY', registry);
    } else {
      mainWin.send('is-ready', {
        ready: false,
        msg: 'SYSTEM_OFFLINE',
      });

      return;
    }
  }
  mainWin.send('check-registry', registry);
  console.log('continue');

  if (online) {
    mainWin.send('is-ready', { ready: true });
    // 打点日志
    if (!isDev) {
      requests.sendPointLog();
      setInterval(() => {
        log.error('sendPointLog');
        requests.sendPointLog();
      }, 12 * 60 * 60 * 1000);
    }
  } else if (nowa.hasInstalledPkgs()) {
    mainWin.send('is-ready', { ready: true });
  } else {
    mainWin.send('is-ready', {
      ready: false,
      msg: 'SYSTEM_OFFLINE',
    });
  }
};

ipcMain
  .on('network-change-status', initialTasks)
  .on('tray-change-status', (event, { project, status, fromRenderer }) => {
    tray.updateTrayMenu(project, status, fromRenderer);
  });

app
  .on('ready', () => {
    mainWin.create();
    menu.init();
    tray.init();
    commands.encode();
    commands.setPath();
    log.error('app ready');
    log.error('app test update');
  })
  .on('activate', () => {
    if (mainWin.getWin() === null) {
      mainWin.create();
    }

    if (!mainWin.isVisible()) {
      mainWin.show();
    }
  })
  .on('window-all-closed', () => {
    console.log('window-all-closed');
    if (!isMac) {
      commands.clearNotMacTask(() => {
        app.quit();
      });
    }
  })
  .on('before-quit', () => {
    console.log('before quit');
    if (isMac) commands.clearMacTask();
    tray.destroy();
  });

global.services = services;
global.config = config;
