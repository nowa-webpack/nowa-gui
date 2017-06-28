import React from 'react';
import { join } from 'path';
import { readFileSync, removeSync } from 'fs-extra';
import { info } from 'antd/lib/modal';
import { remote, ipcRenderer } from 'electron';


import i18n from 'i18n-renderer-nowa';
import { request, delay } from 'shared-nowa';
import { openUrl, msgError, msgSuccess } from 'util-renderer-nowa';
import {
  getLocalUpdateFlag,
  setLocalUpdateFlag,
  getLocalLanguage,
} from 'store-renderer-nowa';
import {
  PREINIT_PAGE,
  SHUTDOWN_PAGE,
  WELCOME_PAGE,
  PROJECT_PAGE,
  REGISTRY_MAP
} from 'const-renderer-nowa';

const { paths, nowa, requests, updator } = remote.getGlobal('services');


export default {
  namespace: 'layout',

  state: {
    online: navigator.onLine,
    showPage: PREINIT_PAGE, // 当前页面
    version: paths.APP_VERSION,
    newVersion: paths.APP_VERSION,
    upgradeUrl: '', // app 更新地址
    innerUpdate: '', // 应用内自更新
    showSideMask: false, // 遮住项目列表防止误操作
    backPage: '', // 上一个页面,
    windowHeight: 552, // 窗口高度
    atAli: false, // 在阿里内网
    loading: false,
  },

  subscriptions: {
    setup({ dispatch }) {
      const onNetworkChange = () => {
        const online = navigator.onLine;
        console.log(online ? 'online' : 'offline');
        ipcRenderer.send('network-change-status', online);
      };

      window.addEventListener('online', onNetworkChange);
      window.addEventListener('offline', onNetworkChange);

      onNetworkChange();

      ipcRenderer.on('is-ready', (event, payload) => {
        dispatch({
          type: 'handleChangeNet',
          payload,
        });
      });
    },
  },

  effects: {
    * handleChangeNet({ payload: { ready, msg } }, { put, select }) {
      if (!ready) {
        yield put({
          type: 'changeStatus',
          showPage: SHUTDOWN_PAGE,
        });
      } else {
        const { online } = yield select(state => state.layout);
        if (!online && navigator.onLine) {
          window.location.reload();
        }

        yield put({
          type: 'changeStatus',
          payload: { online: navigator.onLine },
        });

        if (online && navigator.onLine) {
          yield put({
            type: 'boilerplate/fetchCustom',
          });
          yield put({
            type: 'boilerplate/fetchOfficial',
          });
          yield put({
            type: 'boilerplate/fetchAnt',
          });
          yield put({
            type: 'checkAli',
          });
        }
      }
    },
    // nowa 安装结束后
    * afterInit(o, { put, select }) {
      console.log('afterInit');

      const { projects } = yield select(state => state.project);
      const toPage = projects.length > 0 ? PROJECT_PAGE : WELCOME_PAGE;
      // const toPage = SETTING_PAGE;
      yield put({
        type: 'showPage',
        payload: { toPage },
      });

      const showNowaTip = nowa.checkNowaCliVer();
      if (showNowaTip) {
        msgError(i18n('msg.nowaVersionTip'), 5);
        yield delay(2000);
      }
      yield put({
        type: 'checkAppUpdate',
      });
    },
    * showPage({ payload: { toPage } }, { put, select }) {
      const { showPage } = yield select(state => state.layout);

      yield put({
        type: 'changeStatus',
        payload: {
          backPage: showPage,
          showPage: toPage,
        },
      });

      yield put({
        type: 'project/changeStatus',
        payload: {
          startWacthProject: toPage === PROJECT_PAGE,
        },
      });
    },
    * goBack(o, { put, select }) {
      const { backPage, showPage } = yield select(state => state.layout);

      yield put({
        type: 'changeStatus',
        payload: {
          backPage: showPage,
          showPage: backPage,
        },
      });

      yield put({
        type: 'project/changeStatus',
        payload: {
          startWacthProject: backPage === PROJECT_PAGE,
        },
      });
    },
    // 检查更新
    * checkAppUpdate(o, { put, select }) {
      const { update, ...others } = yield updator.check();
      const { version } = yield select(state => state.layout);

      if (update) {
        // 显示更新提示
        yield put({
          type: 'changeStatus',
          payload: {
            ...others
          }
        });
      }
      // 展示更新公告
      if (getLocalUpdateFlag(version)) {
        const readme = readFileSync(join(paths.APP_PATH, 'readme.md'), 'utf-8');
        const arr = readme.split('#').filter(i => !!i).map(i => i.split('*').slice(1));
        const tip = getLocalLanguage() === 'zh' ? arr[0] : arr[1];

        info({
          width: 450,
          title: i18n('msg.updateTip'),
          content: (
            <ul className="update-tip">
              {tip.map(item => <li key={item}>{item}</li>)}
            </ul>
          ),
          onOk() {
            setLocalUpdateFlag(version);
          },
          okText: i18n('form.ok'),
        });
      }
    },
    * updateAPP(o, { select, put }) {
      const { innerUpdate, upgradeUrl } = yield select(state => state.layout);
      // 应用内自更新
      if (innerUpdate) {
        console.log('copy update files');
        yield put({
          type: 'changeStatus',
          payload: { loading: true }
        });
        const { err, msg } = yield updator.override();
        yield put({
          type: 'changeStatus',
          payload: { loading: false }
        });
        if (err) {
          msgError(msg);
        } else {
          msgSuccess(i18n('msg.relaunch'));
          yield delay(2000);
          remote.app.relaunch();
          remote.app.exit(0);
        }
      } else {
        openUrl(upgradeUrl);
      }
    },
    * resetAPP(o, { put }) {
      yield put({
        type: 'changeStatus',
        payload: { loading: true }
      });
      yield delay(500);
      removeSync(paths.DOT_NOWA_PATH);
      removeSync(paths.DOT_NOWA_CLI_PATH);
      yield put({
        type: 'changeStatus',
        payload: { loading: false }
      });
      remote.app.relaunch();
      remote.app.exit(0);
    },
    // 发送反馈
    * sendFeedback({ payload }, { put }) {
      const { data, err } = yield requests.feedback(payload);

      if (err) return;

      if (data.errcode === 0) {
        msgSuccess(i18n('feedback.success'));
        yield delay(1000);
        yield put({ type: 'goBack' });
      } else {
        msgError(data.errmsg);
      }
    },
    * checkAli(o, { put }) {
      console.log('checkAli');
      yield put({
        type: 'plugin/changeStatus',
        payload: { loading: true },
      });
      const { err } = yield request(REGISTRY_MAP.tnpm, {
        timeout: 10000
      });
      const atAli = !err;
      yield put({
        type: 'changeStatus',
        payload: { atAli },
      });

      if (atAli) {
        yield put({
          type: 'boilerplate/fetchAli',
        });
      }

      yield put({
        type: 'plugin/fetch',
      });
    },
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};