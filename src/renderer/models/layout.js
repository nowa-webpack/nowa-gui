import { remote, ipcRenderer } from 'electron';
// import request from '../services/request';

const { application, upgrade } = remote.getGlobal('services');

const curVersion = application.getPackgeJson().version;

export default {

  namespace: 'layout',

  state: {
    showNewProject: true,
    activeTab: '1',
    version: curVersion,
    newVersion: curVersion,
    shouldAppUpdate: false
  },

  subscriptions: {
    setup({ dispatch }) {

      ipcRenderer.on('checkLatest', (event, newVersion) => {
        console.log(newVersion)
        dispatch({
          type: 'changeStatus',
          payload: {
            shouldAppUpdate: true,
            newVersion
          }
        });
      });
      
    },
  },

  effects: {
    * upgrade({}, { put, select }) {

      const { newVersion } = yield select(state => state.layout);

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

/*request('https://registry.npm.taobao.org/nowa-gui-version/latest')
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
  });*/

