/*
  工具设置 model
*/
import { remote, ipcRenderer } from 'electron';
import { existsSync } from 'fs-extra';
// import { lt } from 'semver';

import {
  SUBLIME,
  VSCODE,
  WEBSTORM,
  VSCODE_BASE_PATH,
  SUBLIME_BASE_PATH,
  WEBSTORM_BASE_PATH,
} from 'const-renderer-nowa';
import {
  setLocalLanguage,
  getLocalLanguage,
  getLocalEditor,
  getLocalEditorPath,
  setLocalEditorPath,
  setLocalEditor,
} from 'store-renderer-nowa';
import { msgSuccess, msgError } from 'util-renderer-nowa';
import i18n from 'i18n-renderer-nowa';
import { request } from 'shared-nowa';

const config = remote.getGlobal('config');

export default {
  namespace: 'setting',

  state: {
    defaultEditor: getLocalEditor() || SUBLIME,   // 默认编辑器
    editor: {       // 编辑器列表
      [SUBLIME]: getLocalEditorPath(SUBLIME),
      [VSCODE]: getLocalEditorPath(VSCODE),
      [WEBSTORM]: getLocalEditor(WEBSTORM),
    },
    registry: 'https://registry.npm.taobao.org',  //全局源地址
    registryList: [],     //所有源地址列表
    lang: getLocalLanguage(), //当前语言
  },

  subscriptions: {
    setup({ dispatch }) {
      // 初始化编辑器路径
      if (!getLocalEditorPath(SUBLIME)) {
        setLocalEditorPath(
          SUBLIME,
          existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : ''
        );
      }

      if (!getLocalEditorPath(VSCODE)) {
        setLocalEditorPath(
          VSCODE,
          existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : ''
        );
      }

      if (!getLocalEditorPath(WEBSTORM)) {
        setLocalEditorPath(
          WEBSTORM,
          existsSync(WEBSTORM_BASE_PATH) ? WEBSTORM_BASE_PATH : ''
        );
      }

      dispatch({
        type: 'changeStatus',
        payload: {
          editor: {
            Sublime: getLocalEditorPath(SUBLIME),
            VScode: getLocalEditorPath(VSCODE),
            WebStorm: getLocalEditorPath(WEBSTORM),
          },
        },
      });

      ipcRenderer.on('check-registry', (event, registry) => {
        dispatch({
          type: 'changeStatus',
          payload: { registry, registryList: config.getItem('REGISTRY_LIST') },
        });
      });
    },
  },

  effects: {
    // 保存设置表单页
    * setValues({ payload }, { put, select }) {
      const setting = yield select(state => state.setting);

      const { defaultEditor, editor, language, registry } = payload;

      yield put({
        type: 'changeStatus',
        payload: {
          defaultEditor,
          editor,
        },
      });
      
      setLocalEditorPath(defaultEditor, editor[defaultEditor]);

      if (defaultEditor !== setting.defaultEditor) {
        setLocalEditor(defaultEditor);
      }

      if (registry !== setting.registry) {
        if (!setting.registryList.includes(registry)) {
          const { err } = yield request(registry, { timeout: 10000 });
          if (err) {
            msgError(i18n('msg.invalidRegistry'));
            return false;
          }
          setting.registryList.push(registry);
          config.setItem('REGISTRY_LIST', setting.registryList);
          yield put({
            type: 'changeStatus',
            payload: { registryList: [...setting.registryList] },
          });
        }
        config.setItem('REGISTRY', registry);
        yield put({
          type: 'changeStatus',
          payload: { registry },
        });
      }

      // 语言要放在最后判断，当前需要刷新页面才能切换语言
      if (language !== getLocalLanguage()) {
        setLocalLanguage(language);
        window.location.reload();
      } else {
        msgSuccess(i18n('msg.updateSuccess'));
      }

      return true;
    },
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};