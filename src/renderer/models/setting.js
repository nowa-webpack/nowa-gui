import { remote, ipcRenderer } from 'electron';
import fs from 'fs-extra';

import { SUBLIME, VSCODE } from 'gui-const';
import { VSCODE_BASE_PATH, SUBLIME_BASE_PATH } from 'gui-const';
import { getLocalEditor, getLocalEditorPath, setLocalEditorPath } from 'gui-local';

const config = remote.getGlobal('config');
// const curVersion = utils.getPackgeJson().version;

export default {

  namespace: 'setting',

  state: {
    // showPage: -1,  // 0 welcome ; 1 new page; 2 project; -1: preinit; 3 setting
    // version: curVersion,
    // newVersion: curVersion,
    defaultEditor: getLocalEditor() || 'VScode',
    editor: {
      Sublime: getLocalEditorPath(SUBLIME),
      VScode: getLocalEditorPath(VSCODE)
    },
    registry: 'https://registry.npm.taobao.org',
    registryList: [],
  },

  subscriptions: {
    setup({ dispatch }) {

      if (!getLocalEditorPath(SUBLIME)) {
        setLocalEditorPath(SUBLIME, fs.existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : '');
      }

      if (!getLocalEditorPath(VSCODE)) {
        setLocalEditorPath(VSCODE, fs.existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : '');
      }

      dispatch({
        type: 'changeStatus',
        payload: {
          editor: {
            Sublime: getLocalEditorPath(SUBLIME),
            VScode: getLocalEditorPath(VSCODE),
          },
        }
      });

      ipcRenderer.on('check-registry', (event, registry) => {
        dispatch({
          type: 'changeStatus',
          payload: { registry, registryList: config.registryList().split(',') }
        });
        dispatch({
          type: 'init/fetchOnlineTemplates',
        });
      });

    },
  },

  effects: {
    * changeRegistry({ payload: { registry } }, { put, select }) {
      const { registryList } = yield select(state => state.setting);
      if (registryList.includes(registry)) {
        yield put({
          type: 'changeStatus',
          payload: { registry }
        });
      } else {
        registryList.push(registry);

        config.registryList(registryList.join(','));
        yield put({
          type: 'changeStatus',
          payload: { registry, registryList }
        });
      }
    }
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

