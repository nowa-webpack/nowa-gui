import dva from 'dva';
<<<<<<< HEAD
import ansiHTML from 'ansi-html';
import { ipcRenderer } from 'electron';

import { isWin } from 'shared-nowa';
import RouterConfig from './router';
import layout from './models/layout';
import setting from './models/setting';
import project from './models/project';
import projectCreate from './models/projectCreate';
import task from './models/task';
import boilerplate from './models/boilerplate';
import log from 'electron-log';

import 'antd/dist/antd.min.css';
import './assets/styles/base.css';
import './assets/styles/app.less';


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


ipcRenderer.on('main-err', (event, msg) => {
  console.log(msg);
  log.error(msg);
});

=======
import { ipcRenderer, remote } from 'electron';
import Message from 'antd/lib/message';
import log from 'electron-log';

// import { hashHistory } from 'react-router';

import RouterConfig from './router';
import project from './models/project';
import layout from './models/layout';
import task from './models/task';
import init from './models/init';
import setting from './models/setting';

import { IS_WIN } from './constants';

import 'antd/dist/antd.min.css';
import '../assets/styles/base.css';
import '../assets/styles/site.less';

if (IS_WIN) {
  import('../assets/styles/is-win.less');
} else {
  import('../assets/styles/is-mac.less');
}

const { utils } = remote.getGlobal('services');
// const curVersion = application.getPackgeJson().version;
const version = utils.getPackgeJson().version;


window.AliMonitor = window.AliMonitor || [];

remote.require('getmac').getMac((err, macAddress) => {
    if (err) Message.error(err, 3);
    AliMonitor.push({
      url: 'log://uxdata/nowa/',
      msg: `{"MAC": ${macAddress},"version": ${version}}`
    });
});


ipcRenderer.on('main-err', (event, msg) => {
  Message.error(msg, 6);
});


>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
// 1. Initialize
const app = dva({
  onError(e) {
    console.error(e);
<<<<<<< HEAD
    log.error(e.message);
  },
});

app.router(RouterConfig);

app.model(layout);
app.model(setting);
app.model(project);
app.model(projectCreate);
app.model(task);
app.model(boilerplate);

=======
    log.error(e);
    Message.error(e.stack, 6);
  },
});

// 2. Plugins

// 3. Model

app.model(layout);
app.model(project);
app.model(task);
app.model(init);
app.model(setting);

// 4. Router
app.router(RouterConfig);

// 5. Start
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
app.start('#root');
