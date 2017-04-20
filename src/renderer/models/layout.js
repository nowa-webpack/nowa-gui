import { remote, ipcRenderer } from 'electron';
import fs from 'fs-extra';

import { SUBLIME, VSCODE } from 'gui-const';
import { VSCODE_BASE_PATH, SUBLIME_BASE_PATH } from 'gui-const';
import { getLocalEditor, getLocalEditorPath, setLocalEditorPath } from 'gui-local';

const { utils } = remote.getGlobal('services');
const curVersion = utils.getPackgeJson().version;

export default {

  namespace: 'layout',

  state: {
    showPage: -1,  // 0 welcome ; 1 new page; 2 project; -1: preinit; 3 setting
    backPage: -1,
    showSideMask: false,
    // showModModal: false,
    version: curVersion,
    newVersion: curVersion,
    upgradeUrl: '',
    online: false,
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

      // if (!getLocalEditorPath(SUBLIME)) {
      //   setLocalEditorPath(SUBLIME, fs.existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : '');
      // }

      // if (!getLocalEditorPath(VSCODE)) {
      //   setLocalEditorPath(VSCODE, fs.existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : '');
      // }

      window.addEventListener('online', onNetworkChange);
      window.addEventListener('offline', onNetworkChange);

      // dispatch({
      //   type: 'changeStatus',
      //   payload: {
      //     editor: {
      //       Sublime: getLocalEditorPath(SUBLIME),
      //       VScode: getLocalEditorPath(VSCODE),
      //     },
      //   }
      // });

      dispatch({
        type: 'init/fetchAllTemplates',
      });

      onNetworkChange();

      // ipcRenderer.on('check-registry', (event, registry) => {
      //   dispatch({
      //     type: 'changeStatus',
      //     payload: { registry }
      //   });
      //   dispatch({
      //     type: 'init/fetchOnlineTemplates',
      //   });
      // });

      ipcRenderer.on('nowa-need-install', (event, nowaPreFlag) => {
        dispatch({
          type: 'changeStatus',
          payload: { nowaPreFlag }
        });
      });

      

    },
  },

  effects: {
    * showPage({ payload: { toPage } }, { put, select }) {
      const { showPage } = yield select(state => state.layout);

      yield put({
        type: 'changeStatus',
        payload: {
          backPage: showPage,
          showPage: toPage,
        }
      });
    },
    * goBack(o, { put, select }) {
      const { backPage, showPage } = yield select(state => state.layout);

      yield put({
        type: 'changeStatus',
        payload: {
          backPage: showPage,
          showPage: backPage,
        }
      });
    }
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};


