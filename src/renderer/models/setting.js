import { remote, ipcRenderer } from 'electron';
<<<<<<< HEAD
import { existsSync } from 'fs-extra';

const config = remote.getGlobal('config');

import {
  SUBLIME, VSCODE, WEBSTORM,
  VSCODE_BASE_PATH, SUBLIME_BASE_PATH, WEBSTORM_BASE_PATH
} from 'const-renderer-nowa';
import {
  setLocalLanguage, getLocalLanguage,
  getLocalEditor, getLocalEditorPath, setLocalEditorPath, setLocalEditor
} from 'store-renderer-nowa';
import { msgSuccess } from 'util-renderer-nowa';
import i18n from 'i18n-renderer-nowa';

=======
import fs from 'fs-extra';

import { SUBLIME, VSCODE, WEBSTORM } from 'gui-const';
import { VSCODE_BASE_PATH, SUBLIME_BASE_PATH, WEBSTORM_BASE_PATH } from 'gui-const';
import { getLocalEditor, getLocalEditorPath, setLocalEditorPath } from 'gui-local';

const config = remote.getGlobal('config');
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

export default {

  namespace: 'setting',

  state: {
    defaultEditor: getLocalEditor() || SUBLIME,
    editor: {
<<<<<<< HEAD
      [SUBLIME]: getLocalEditorPath(SUBLIME),
      [VSCODE]: getLocalEditorPath(VSCODE),
      [WEBSTORM]: getLocalEditor(WEBSTORM),
=======
      Sublime: getLocalEditorPath(SUBLIME),
      VScode: getLocalEditorPath(VSCODE),
      WebStorm: getLocalEditor(WEBSTORM),
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    },
    registry: 'https://registry.npm.taobao.org',
    registryList: [],
  },

  subscriptions: {
    setup({ dispatch }) {
      if (!getLocalEditorPath(SUBLIME)) {
<<<<<<< HEAD
        setLocalEditorPath(SUBLIME, existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : '');
      }

      if (!getLocalEditorPath(VSCODE)) {
        setLocalEditorPath(VSCODE, existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : '');
      }

      if (!getLocalEditorPath(WEBSTORM)) {
        setLocalEditorPath(WEBSTORM, existsSync(WEBSTORM_BASE_PATH) ? WEBSTORM_BASE_PATH : '');
=======
        setLocalEditorPath(SUBLIME, fs.existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : '');
      }

      if (!getLocalEditorPath(VSCODE)) {
        setLocalEditorPath(VSCODE, fs.existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : '');
      }

      if (!getLocalEditorPath(WEBSTORM)) {
        setLocalEditorPath(WEBSTORM, fs.existsSync(WEBSTORM_BASE_PATH) ? WEBSTORM_BASE_PATH : '');
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
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
<<<<<<< HEAD
          payload: { registry, registryList: config.getItem('REGISTRY_LIST') }
        });
        // dispatch({
        //   type: 'init/fetchOnlineTemplates',
        // });
=======
          payload: { registry, registryList: config.registryList() }
        });
        dispatch({
          type: 'init/fetchOnlineTemplates',
        });
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
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

<<<<<<< HEAD
        config.setItem('REGISTRY_LIST', registryList);
=======
        config.registryList(registryList);
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
        yield put({
          type: 'changeStatus',
          payload: { registry, registryList }
        });
      }
<<<<<<< HEAD
    },
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
        yield put({
          type: 'changeRegistry',
          payload: { registry }
        });
      }
      if (language !== getLocalLanguage()) {
        setLocalLanguage(language);
        window.location.reload();
      } else {
        msgSuccess(i18n('msg.updateSuccess'));
      }
=======
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    }
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};

