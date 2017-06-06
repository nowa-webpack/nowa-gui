import React from 'react';
import { remote, ipcRenderer } from 'electron';
import notification from 'antd/lib/notification';
import { info } from 'antd/lib/modal';
import Icon from 'antd/lib/icon';
import { lt } from 'semver';

import i18n from 'i18n-renderer-nowa';
import { request, delay } from 'shared-nowa';
import { openUrl, msgError, msgSuccess } from 'util-renderer-nowa';
import { getLocalUpdateFlag, setLocalUpdateFlag, getLocalLanguage } from 'store-renderer-nowa';
import {
  PREINIT_PAGE, SHUTDOWN_PAGE, WELCOME_PAGE, BOILERPLATE_PAGE, PROJECT_PAGE,
  EXTENSION_MAP, IMPORT_STEP1_PAGE, IMPORT_STEP2_PAGE, SETTING_PAGE, FEEDBACK_PAGE,
} from 'const-renderer-nowa';

const { paths, nowa, requests } = remote.getGlobal('services');

const getUpdateArgs = (newVersion, url) => ({
  message: i18n('msg.updateTitle'),
  description:
    (
      <div>
        {i18n('msg.updateCnt1', newVersion, paths.APP_VERSION)}
        <a onClick={() => openUrl(url)}>{i18n('msg.updateCnt2')}</a>
      </div>
    ),
  duration: 0,
  placement: 'bottomRight',
  icon: <Icon type="download" style={{ color: '#108ee9' }} />,
});

export default {

  namespace: 'layout',

  state: {
    online: navigator.onLine,
    // globalMsg: '',
    showPage: PREINIT_PAGE, // 当前页面
    version: paths.APP_VERSION,
    newVersion: paths.APP_VERSION,
    showSideMask: false, // 遮住项目列表防止误操作
    upgradeUrl: '',  // app 更新地址
    backPage: '', // 上一个页面,
    windowHeight: 552, // 窗口高度
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
          showPage: SHUTDOWN_PAGE
        });
      } else {
        const { online } = yield select(state => state.layout);
        if (!online && navigator.onLine) {
          window.location.reload();
        } else {
          yield put({
            type: 'boilerplate/fetchCustom'
          });
          yield put({
            type: 'boilerplate/fetchOfficial'
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
        payload: { toPage }
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
        }
      });

      yield put({
        type: 'project/changeStatus',
        payload: {
          startWacthProject: toPage === PROJECT_PAGE,
        }
      });
    },
    * goBack(o, { put, select }) {
      const { backPage, showPage } = yield select(state => state.layout);

      yield put({
        type: 'changeStatus',
        payload: {
          backPage: showPage,
          showPage: backPage,
        }
      });

      yield put({
        type: 'project/changeStatus',
        payload: {
          startWacthProject: backPage === PROJECT_PAGE,
        }
      });
    },
    // 检查更新
    * checkAppUpdate(o, { put, select }) {
      const { registry } = yield select(state => state.setting);
      const { data, err } = yield request(`${registry}/nowa-gui-version`);
      const version = paths.APP_VERSION;

      if (err) return;

      const newVersion = data['dist-tags'].latest;
      const newPkg = data.versions[newVersion];
      const upgradeUrl = `${newPkg.downloadDomain}/${newVersion}/NowaGUI.${EXTENSION_MAP[process.platform]}`;

      if (newPkg.downloadDomain) {
        yield put({
          type: 'changeStatus',
          payload: {
            upgradeUrl,
          }
        });
      }

      // 显示更新提示
      if (lt(version, newVersion)) {
        yield put({
          type: 'changeStatus',
          payload: { newVersion }
        });
        const args = getUpdateArgs(newVersion, upgradeUrl);

        notification.open(args);
      }

      // 展示更新公告
      if (getLocalUpdateFlag(version) != 1) {
        const arr = data.readme.split('#').filter(i => !!i).map(i => i.split('*').slice(1));
        const tip = getLocalLanguage() === 'zh' ? arr[0] : arr[1];

        info({
          width: 450,
          title: i18n('msg.updateTip'),
          content: (
            <ul className="update-tip">
              {tip.map(item => <li key={item}>{item}</li>)}
            </ul>),
          onOk() {
            setLocalUpdateFlag(version);
          },
          okText: i18n('form.ok'),
        });
      }
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
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
