import { remote } from 'electron';
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
    activeTab: '1',
    version: curVersion,
    newVersion: curVersion,
    defaultEditor: getLocalEditor() || 'VScode',
    editor: {
      Sublime: getLocalEditorPath(SUBLIME),
      VScode: getLocalEditorPath(VSCODE)
    },
    online: navigator.onLine,
    // online: false
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
          }
        }
      });

      dispatch({
        type: 'init/fetchAllTemplates',
      });

    },
  },

  effects: {
    * changeLogTab({ payload: { activeTab } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      if (activeTab === '2') {
        projects.map((item) => {
          if (item.path === current.path) {
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
    },
    
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};


