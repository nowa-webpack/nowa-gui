/*
  main 端入口文件
*/
import { app, ipcMain } from 'electron';
import cnr from 'check-npm-registry';

import { isDev, isMac } from 'shared-nowa';
import services from './services';
import config from './userConfig';


const {
  menu,
  mainWin,
  log,
  tray,
  commands,
  nowa,
  requests,
  tasklog,
  mainPlugin,
  initialize
} = services;


process.on('unhandledRejection', (reason, p) => {
    log.error(`Unhandled Rejection at:, ${p}, 'reason:', ${reason}`);
  })
  .on('uncaughtException', function(err) {
    log.error(`uncaughtException$-${err}`);
  });

/*
  初始化任务：判断源，发送打点日志
  必须在有网的判断下进行
*/
const initialTasks = async function (event, online) {
  console.log('network', online);
  config.setItem('ONLINE', online);

  let registry = config.getItem('REGISTRY');

  // 获取当前源地址
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
  // 通知 renderer 端源地址确定
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

  //  如果断网但是nowa依赖安装完整，依然认为准备就绪
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
    // 生产窗口
    mainWin.create();
    // 初始化菜单， win端不可见
    menu.init();
    // 初始化任务托盘
    tray.init();
    // 确定编码
    initialize.setEncode();
    // 写全局路径
    initialize.setGlobalPath();
    // nowa-gui 插件初始化
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
    // 清理任务
    if (!isMac) {
      commands.clearNotMacTask(() => {
        app.quit();
      });
    }
  })
  .on('before-quit', () => {
    console.log('before quit');
    // 清理任务
    mainPlugin.stop();
    if (isMac) commands.clearMacTask();
    tray.destroy();
  });

// 暴露main端服务给renderer
global.services = services;
global.config = config;
