import { remote, ipcRenderer } from 'electron';
import { existsSync } from 'fs-extra';

const config = remote.getGlobal('config');

import {
  SUBLIME, VSCODE, WEBSTORM,
  VSCODE_BASE_PATH, SUBLIME_BASE_PATH, WEBSTORM_BASE_PATH
} from 'const-renderer-nowa';
import { getLocalEditor, getLocalEditorPath, setLocalEditorPath } from 'store-renderer-nowa';


export default {

  namespace: 'setting',

  state: {
    defaultEditor: getLocalEditor() || SUBLIME,
    editor: {
      [SUBLIME]: getLocalEditorPath(SUBLIME),
      [VSCODE]: getLocalEditorPath(VSCODE),
      [WEBSTORM]: getLocalEditor(WEBSTORM),
    },
    registry: 'https://registry.npm.taobao.org',
    registryList: [],
  },

  subscriptions: {
    setup({ dispatch }) {
      if (!getLocalEditorPath(SUBLIME)) {
        setLocalEditorPath(SUBLIME, existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : '');
      }

      if (!getLocalEditorPath(VSCODE)) {
        setLocalEditorPath(VSCODE, existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : '');
      }

      if (!getLocalEditorPath(WEBSTORM)) {
        setLocalEditorPath(WEBSTORM, existsSync(WEBSTORM_BASE_PATH) ? WEBSTORM_BASE_PATH : '');
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
          payload: { registry, registryList: config.getItem('REGISTRY_LIST') }
        });
        // dispatch({
        //   type: 'init/fetchOnlineTemplates',
        // });
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

        config.setItem('REGISTRY_LIST', registryList);
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

