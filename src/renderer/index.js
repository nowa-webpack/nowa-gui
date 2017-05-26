import dva from 'dva';
import ansiHTML from 'ansi-html';
import Message from 'antd/lib/message';
import { remote, ipcRenderer } from 'electron';

import { isWin } from 'shared-nowa';
import RouterConfig from './router';
import layout from './models/layout';
import setting from './models/setting';
import project from './models/project';
import projectCreate from './models/projectCreate';
import task from './models/task';
import boilerplate from './models/boilerplate';
import 'antd/dist/antd.min.css';
import './assets/styles/base.css';
import './assets/styles/app.less';

const { log } = remote.getGlobal('services');

if (isWin) {
  import('./assets/styles/is-win.less');
} else {
  import('./assets/styles/is-mac.less');
}


ansiHTML.setColors({
  reset: ['254463'], // FOREGROUND-COLOR or [FOREGROUND-COLOR] or [, BACKGROUND-COLOR] or [FOREGROUND-COLOR, BACKGROUND-COLOR]
  // black: 'aaa', // String
  red: 'ea8484',
  green: '44a195',
  yellow: 'e6d483',
  blue: '8d9eb3',
  magenta: 'ce75ce',
  // cyan: '28c2e4',
  cyan: '8dd5e4',
  // lightgrey: '888',
  darkgrey: 'ccc'
});


log.clearLog('renderer');


ipcRenderer.on('main-err', (event, msg) => {
  // Message.error(msg, 6);
  console.log(msg);
  log.error(msg);
});

// 1. Initialize
const app = dva({
  onError(e) {
    console.error(e);
    log.error(e.message);
    Message.error(e.message);
  },
});

app.router(RouterConfig);

app.model(layout);
app.model(setting);
app.model(project);
app.model(projectCreate);
app.model(task);
app.model(boilerplate);

app.start('#root');
