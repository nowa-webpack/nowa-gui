import { remote, ipcRenderer } from 'electron';
import fs from 'fs-extra';

import { SUBLIME, VSCODE } from 'gui-const';
import { VSCODE_BASE_PATH, SUBLIME_BASE_PATH } from 'gui-const';
import { getLocalEditor, getLocalEditorPath, setLocalEditorPath } from 'gui-local';

const { utils } = remote.getGlobal('services');
// const curVersion = application.getPackgeJson().version;
const curVersion = utils.getPackgeJson().version;

export default {

  namespace: 'layout',

  state: {
    showPage: -1,  // 0 welcome ; 1 new page; 2 project; -1: preinit
    showSetModal: false,
    // showModModal: false,
    // activeTab: '1',
    version: curVersion,
    newVersion: curVersion,
    defaultEditor: getLocalEditor() || 'VScode',
    editor: {
      Sublime: getLocalEditorPath(SUBLIME),
      VScode: getLocalEditorPath(VSCODE)
    },
    upgradeUrl: '',
    online: false,
    registry: 'https://registry.npm.taobao.org',
    nowaPreFlag: -1, // -1 no-op, 0 close, 1: update, 2: no update
  },

  subscriptions: {
    setup({ dispatch }) {

      const onNetworkChange = () => {
        const online = navigator.onLine;
        console.log(online ? 'online' : 'offline');

        dispatch({
          type: 'changeStatus',
          payload: { online }
        });

        ipcRenderer.send('network-change-status', online);
      };

      if (!getLocalEditorPath(SUBLIME)) {
        setLocalEditorPath(SUBLIME, fs.existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : '');
      }

      if (!getLocalEditorPath(VSCODE)) {
        setLocalEditorPath(VSCODE, fs.existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : '');
      }

      window.addEventListener('online', onNetworkChange);
      window.addEventListener('offline', onNetworkChange);

      dispatch({
        type: 'changeStatus',
        payload: {
          editor: {
            Sublime: getLocalEditorPath(SUBLIME),
            VScode: getLocalEditorPath(VSCODE),
          },
        }
      });

      dispatch({
        type: 'init/fetchAllTemplates',
      });

      onNetworkChange();

      ipcRenderer.on('check-registry', (event, registry) => {
        dispatch({
          type: 'changeStatus',
          payload: { registry }
        });
        dispatch({
          type: 'init/fetchOnlineTemplates',
        });
      });

      ipcRenderer.on('nowa-need-install', (event, nowaPreFlag) => {
        dispatch({
          type: 'changeStatus',
          payload: { nowaPreFlag }
        });
      });

    },
  },

  effects: {
    // * changeLogTab({ payload: { activeTab } }, { put, select }) {
    //   const { projects, current } = yield select(state => state.project);
    //   if (activeTab === '2') {
    //     projects.map((item) => {
    //       if (item.path === current.path) {
    //         item.taskErr = false;
    //       }
    //     });
    //     yield put({
    //       type: 'project/changeStatus',
    //       payload: { projects }
    //     });
    //   }
    //   yield put({
    //     type: 'changeStatus',
    //     payload: { activeTab }
    //   });
    // },
    
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};


