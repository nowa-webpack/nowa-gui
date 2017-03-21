import dva from 'dva';
import { ipcRenderer, remote } from 'electron';
import Message from 'antd/lib/message';
import { hashHistory } from 'react-router';

import RouterConfig from './router';
import project from './models/project';
import layout from './models/layout';
import task from './models/task';
import init from './models/init';

import { IS_WIN } from './constants';

import 'antd/dist/antd.min.css';
import '../assets/styles/base.css';
import '../assets/styles/site.less';

if (IS_WIN) {
  import('../assets/styles/is-win.less');
} else {
  import('../assets/styles/is-mac.less');
}


window.AliMonitor = window.AliMonitor || [];

remote.require('getmac').getMac((err, macAddress) => {
    if (err) Message.error(err, 3);
    AliMonitor.push({
      url: 'log://uxdata/nowa/',
      msg: `{"MAC": ${macAddress}}`
    });
});


ipcRenderer.on('main-err', (event, msg) => {
  Message.error(msg, 6);
});


// 1. Initialize
const app = dva({
  onError(e) {
    console.error(e)
    Message.error(e.stack, 6);
  },
});

// 2. Plugins

// 3. Model

app.model(layout);
app.model(project);
app.model(task);
app.model(init);

// 4. Router
app.router(RouterConfig);

// 5. Start
app.start('#root');
