import { remote, ipcRenderer } from 'electron';
import fs from 'fs-extra';

import { VSCODE_BASE_PATH, SUBLIME_BASE_PATH } from '../constants';

import { getLocalEditor, getLocalSublimePath, setLocalSublimePath,
  getLocalVScodePath, setLocalVScodePath } from '../services/localStorage';

const { application, upgrade } = remote.getGlobal('services');

const curVersion = application.getPackgeJson().version;

export default {

  namespace: 'layout',

  state: {
    showPage: 0,  // 0 welcome ; 1 new page; 2 project
    showSetModal: false,
    activeTab: '1',
    // activeSetTab: '1',
    version: curVersion,
    newVersion: curVersion,
    // defaultEditor: 'Sublime',
    defaultEditor: getLocalEditor() || 'VScode',
    editor: {
      Sublime: getLocalSublimePath(),
      VScode: getLocalVScodePath()
    }
  },

  subscriptions: {
    setup({ dispatch }) {

      ipcRenderer.on('checkLatest', (event, newVersion) => {
        console.log(newVersion);
        dispatch({
          type: 'changeStatus',
          payload: {
            // shouldAppUpdate: true,
            newVersion
          }
        });
      });

      if (!getLocalSublimePath()) {
        setLocalSublimePath(fs.existsSync(SUBLIME_BASE_PATH) ? SUBLIME_BASE_PATH : '');
      }

      if (!getLocalVScodePath()) {
        setLocalVScodePath(fs.existsSync(VSCODE_BASE_PATH) ? VSCODE_BASE_PATH : '');
      }

      dispatch({
        type: 'changeStatus',
        payload: {
          editor: {
            Sublime: getLocalSublimePath(),
            VScode: getLocalVScodePath(),
          }
        }
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
    * selectEditorPath(o, { select, put }) {
      const { defaultEditor, editor } = yield select(state => state.layout);
      
      try {
        const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

        editor[defaultEditor] = importPath[0];

        yield put({
          type: 'changeStatus',
          payload: {
            editor
          }
        });
      } catch (e) {
        console.log(e);
      }
    },
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};


