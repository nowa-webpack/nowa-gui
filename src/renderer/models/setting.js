import { remote, ipcRenderer } from 'electron';
import fs from 'fs-extra';

import { SUBLIME, VSCODE, WEBSTORM } from 'gui-const';
import { VSCODE_BASE_PATH, SUBLIME_BASE_PATH, WEBSTORM_BASE_PATH } from 'gui-const';
import { getLocalEditor, getLocalEditorPath, setLocalEditorPath } from 'gui-local';

const config = remote.getGlobal('config');

export default {

  namespace: 'setting',

  state: {
    defaultEditor: getLocalEditor() || SUBLIME,
    editor: {
      Sublime: getLocalEditorPath(SUBLIME),
      VScode: getLocalEditorPath(VSCODE),
      WebStorm: getLocalEditor(WEBSTORM),
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

      if (!getLocalEditorPath(WEBSTORM)) {
        setLocalEditorPath(WEBSTORM, fs.existsSync(WEBSTORM_BASE_PATH) ? WEBSTORM_BASE_PATH : '');
      }

      dispatch({
        type: 'changeStatus',
        payload: {
          editor: {
            Sublime: getLocalEditorPath(SUBLIME),
            VScode: getLocalEditorPath(VSCODE),
            WebStorm: getLocalEditorPath(WEBSTORM),
          },
        }
      });

      ipcRenderer.on('check-registry', (event, registry) => {
        dispatch({
          type: 'changeStatus',
          payload: { registry, registryList: config.registryList() }
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

        config.registryList(registryList);
        yield put({
          type: 'changeStatus',
          payload: { registry, registryList }
        });
      }
    }
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};

