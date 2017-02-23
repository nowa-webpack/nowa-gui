import { remote, ipcRenderer } from 'electron';
import semver from 'semver';
import request from '../services/request';

const { application, command } = remote.getGlobal('services');

const curVersion = application.getPackgeJson().version;

export default {

  namespace: 'upgrade',

  state: {
    version: curVersion,
    shouldUpdate: false
  },

  subscriptions: {
    setup({ dispatch }) {
      request('https://registry.npm.taobao.org/nowa-gui-version/latest')
        .then(({ data }) => {
          const newVersion = data.version;
          let newRealse = '';
          if (semver.lt(curVersion, newVersion)) {
            dispatch({
              type: 'changeStatus',
              payload: {
                shouldUpdate: true
              }
            });
          }
            /*if (process.platform === 'win32') {
              newRealse = 'http://t.cn/RJQv8uj';
            } else {
              newRealse = 'http://t.cn/RJQPL3J';
            }*/


          // getLatest(visible, window, newVersion);
        });

    },
  },

  effects: {
    
   
    
  },

  reducers: {
    changeStatus(state, action){
      return { ...state, ...action.payload};
    },
  },

};

