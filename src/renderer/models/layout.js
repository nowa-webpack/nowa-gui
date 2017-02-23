import { remote, ipcRenderer } from 'electron';
import semver from 'semver';
import Modal from 'antd/lib/modal';
import React from 'react';

import request from '../services/request';
import { getLocalProjects } from '../services/localStorage';

const { application, upgrade } = remote.getGlobal('services');
const confirm = Modal.confirm;

const curVersion = application.getPackgeJson().version;

export default {

  namespace: 'layout',

  state: {
    /*showConfig: false,  // show project detail page
    showCreateForm: false,  // show init form
    showInstallLog: false,  // show InstallLog
    activeTab: '1',*/
    showNewProject: true,
    activeTab: '1',
    version: curVersion,
    newVersion: curVersion,
    shouldAppUpdate: false
  },

  subscriptions: {
    setup({ dispatch }) {

      const projects = getLocalProjects();

      if (projects.length) {
        dispatch({
          type: 'changeStatus',
          payload: {
            showNewProject: false
          }
        });
      } else {
        dispatch({
          type: 'changeStatus',
          payload: {
            showNewProject: true
          }
        });
      }

      request('https://registry.npm.taobao.org/nowa-gui-version/latest')
        .then(({ data }) => {
          const newVersion = data.version;
          if (semver.lt(curVersion, newVersion)) {
            dispatch({
              type: 'changeStatus',
              payload: {
                shouldAppUpdate: true,
                newVersion
              }
            });
            confirm({
              title: 'Want to update to new release?',
              content: <div><p>Current Version {curVersion}</p>
                    <p>Next Version {newVersion}</p></div>,
              onOk() {
                dispatch({
                  type: 'upgrade',
                });
              },
              onCancel() {},
            });
          }
        });
    },
  },

  effects: {
    * upgrade({}, { put, select }) {

      const { newVersion } = yield select(state => state.layout);

      // yield put({
      //   type: 'changeStatus',
      //   payload: {
      //     shouldAppUpdate: false,
      //     // version: newVersion
      //   }
      // });

      if (process.platform === 'win32') {
        upgrade.downloadNewRelease('http://t.cn/RJQv8uj');
      } else {
        upgrade.downloadNewRelease('http://t.cn/RJQPL3J');
      }

    }    
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};

