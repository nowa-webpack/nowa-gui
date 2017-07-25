import { app, ipcMain } from 'electron';
import cnr from 'check-npm-registry';

import { isDev, isMac } from 'shared-nowa';
import services from './services';
import config from './userConfig';



const {
  menu, mainWin, log, tray, commands, nowa, requests, tasklog, mainPlugin,
  initialize
} = services;


process.on('unhandledRejection', (reason, p) => {
    log.error(`Unhandled Rejection at:, ${p}, 'reason:', ${reason}`);
  })
  .on('uncaughtException', function(err) {
    log.error(`uncaughtException$-${err}`);
  });

/* 初始化任务：判断源，发送打点日志 
  必须在有网的判断下进行
*/
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
    initialize.setEncode();
    initialize.setGlobalPath();
    mainPlugin.start();
    log.error('app ready');
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
    mainPlugin.stop();
    if (isMac) commands.clearMacTask();
    tray.destroy();
  });

global.services = services;
global.config = config;
