import { remote, ipcRenderer } from 'electron';
import fs from 'fs-extra';

const { application, upgrade } = remote.getGlobal('services');

const curVersion = application.getPackgeJson().version;

const isWin = process.platform === 'win32';
const VSCODE_BASE_PATH = isWin 
  ? 'C:/Program Files (x86)/Microsoft VS Code'
  : '/Applications/Visual Studio Code.app/';

const SUBLIME_BASE_PATH = isWin 
  ? 'C:/Program Files/Sublime Text 3/'
  : '/Applications/Sublime Text.app/';

export default {

  namespace: 'layout',

  state: {
    showPage: 0,  // 0 welcome ; 1 new page; 2 project 
    showNewProject: false,
    activeTab: '1',
    version: curVersion,
    newVersion: curVersion,
    shouldAppUpdate: false,
    defaultEditor: 'Sublime',
    editor: {
      Sublime: fs.existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : '',
      VScode: fs.existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : ''
    }
  },

  subscriptions: {
    setup({ dispatch }) {

      ipcRenderer.on('checkLatest', (event, newVersion) => {
        console.log(newVersion);
        dispatch({
          type: 'changeStatus',
          payload: {
            shouldAppUpdate: true,
            newVersion
          }
        });
      });
      
    },
  },

  effects: {
    * upgrade({}, { put, select }) {

      const { newVersion } = yield select(state => state.layout);

      if (process.platform === 'win32') {
        upgrade.downloadNewRelease('http://lab.onbing.com/nowa-gui.exe')
        // upgrade.downloadNewRelease('http://t.cn/RJQv8uj');
      } else {
        upgrade.downloadNewRelease('http://lab.onbing.com/nowa-gui.dmg')

        // upgrade.downloadNewRelease('http://t.cn/RJQPL3J');
      }
    },
    * changeLogTab({ payload: { activeTab } }, { put, select }){
      const { projects, current } = yield select(state => state.project);
      if (activeTab == '2') {
        projects.map(item => {
          if (item.path == current.path) {
            item.taskErr = false;
          }
        });
        yield put({
          type: 'project/changeStatus',
          payload: { projects }
        });
      }
      yield put({
        type: 'changeStatus',
        payload: { activeTab }
      });
    }  
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};


