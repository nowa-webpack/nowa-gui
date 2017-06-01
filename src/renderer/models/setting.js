import { remote, ipcRenderer } from 'electron';
import { existsSync } from 'fs-extra';


import {
  SUBLIME, VSCODE, WEBSTORM,
  VSCODE_BASE_PATH, SUBLIME_BASE_PATH, WEBSTORM_BASE_PATH
} from 'const-renderer-nowa';
import {
  setLocalLanguage, getLocalLanguage,
  getLocalEditor, getLocalEditorPath, setLocalEditorPath, setLocalEditor
} from 'store-renderer-nowa';
import { msgSuccess, msgError } from 'util-renderer-nowa';
import i18n from 'i18n-renderer-nowa';
import { request } from 'shared-nowa';

const config = remote.getGlobal('config');

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
    * setValues({ payload }, { put, select }) {
      const setting = yield select(state => state.setting);

      const { defaultEditor, editor, language, registry } = payload;

      yield put({
        type: 'changeStatus',
        payload: {
          defaultEditor,
          editor
        }
      });

      setLocalEditorPath(defaultEditor, editor[defaultEditor]);

      if (defaultEditor !== setting.defaultEditor) {
        setLocalEditor(defaultEditor);
      }

      if (registry !== setting.registry) {
        if (!setting.registryList.includes(registry)) {
          const { err } = yield request(registry);
          if (err) {
            msgError(i18n('msg.invalidRegistry'));
            return false;
          }
          setting.registryList.push(registry);
          config.setItem('REGISTRY_LIST', setting.registryList);
          yield put({
            type: 'changeStatus',
            payload: { registryList: [...setting.registryList] }
          });
        }
        config.setItem('REGISTRY', registry);
        yield put({
          type: 'changeStatus',
          payload: { registry }
        });
      }
      
      if (language !== getLocalLanguage()) {
        setLocalLanguage(language);
        window.location.reload();
      } else {
        msgSuccess(i18n('msg.updateSuccess'));
      }

    }
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};

