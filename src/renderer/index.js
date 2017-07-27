/*
  renderer 入口文件
*/
import dva from 'dva';
import React from 'react';
import log from 'electron-log';
import ansiHTML from 'ansi-html';
import { ipcRenderer } from 'electron';

import { isWin } from 'shared-nowa';
// import RouterConfig from './router';
import layout from './models/layout';
import setting from './models/setting';
import project from './models/project';
import plugin from './models/plugin';
import projectCreate from './models/projectCreate';
import task from './models/task';
import boilerplate from './models/boilerplate';

import IndexPage from './routes/IndexPage';

import 'antd/dist/antd.min.css';
import './assets/styles/base.css';
import './assets/styles/app.less';

if (isWin) {
  import('./assets/styles/is-win.less');
} else {
  import('./assets/styles/is-mac.less');
}

ansiHTML.setColors({
  reset: ['fff', '22354c'], // FOREGROUND-COLOR or [FOREGROUND-COLOR] or [, BACKGROUND-COLOR] or [FOREGROUND-COLOR, BACKGROUND-COLOR]
  black: '22354c', // String
  red: 'ea8484',
  green: '44a195',
  yellow: 'e6d483',
  blue: '8d9eb3',
  magenta: 'ce75ce',
  // cyan: '28c2e4',
  cyan: '8dd5e4',
  // lightgrey: '888',
  darkgrey: 'ccc',
});

ipcRenderer.on('main-err', (event, msg) => {
  console.log(msg);
  log.error(msg);
});

// 1. Initialize
const app = dva({
  onError(e) {
    console.error(e);
    log.error(e.message);
  },
});

// app.router(RouterConfig);
app.router(() => <IndexPage />);

app.model(layout);
app.model(setting);
app.model(project);
app.model(projectCreate);
app.model(task);
app.model(boilerplate);
app.model(plugin);

app.start('#root');