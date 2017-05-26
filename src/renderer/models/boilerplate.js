import { remote } from 'electron';
// import Message from 'antd/lib/message';
import uuidV4 from 'uuid/v4';

import i18n from 'i18n-renderer-nowa';
import { msgError, msgInfo, msgSuccess } from 'util-renderer-nowa';
const { boilerplate } = remote.getGlobal('services');
const preManifest = boilerplate.getMainifest();


export default {

  namespace: 'boilerplate',

  state: {
    officialBoilerplates: preManifest.official || [],
    localBoilerplates: preManifest.local || [],
    remoteBoilerplates: preManifest.remote || [],

    showAddBoilerplateModal: false, // 显示新建脚手架模态框
    addOrEditBoilerplateType: 'new', // new 需要新建，local 需要修改本地，remote 需要修改远程
    editLocalBoilplateData: {}, // 需要修改的本地脚手架数据
    editRemoteBoilplateData: {}, // 需要修改的远程脚手架数据
    
  },

  effects: {
    * fetchOfficial(o, { put }) {
      const officialBoilerplates = yield boilerplate.official.get();
      yield put({
        type: 'changeStatus',
        payload: { officialBoilerplates }
      });
    },
    * fetchCustom(o, { put }) {
      const custom = yield boilerplate.custom.get();
      const localBoilerplates = custom.local || [];
      const remoteBoilerplates = custom.remote || [];
      yield put({
        type: 'changeStatus',
        payload: { localBoilerplates, remoteBoilerplates }
      });
    },
    * updateOffical({ payload: { tempName, tag } }, { select, put }) {
      const { officialBoilerplates } = yield select(state => state.boilerplate);
      officialBoilerplates.map((item) => {
        if (item.name === tempName) {
          item.loading = true;
        }
        return item;
      });

      yield put({
        type: 'changeStatus',
        payload: {
          officialBoilerplates: [...officialBoilerplates]
        }
      });

      const { success, data } = yield boilerplate.official.update(tempName, tag);

      if (success) {
        msgSuccess(i18n('msg.updateSuccess'));
        yield put({
          type: 'changeStatus',
          payload: {
            officialBoilerplates: data
          }
        });
      }
    },
    * updateRemote({ payload }, { select, put }) {
      const { remoteBoilerplates } = yield select(state => state.boilerplate);
      payload.loading = true;
      remoteBoilerplates.map((item) => item.id === payload.id ? payload : item);

      yield put({
        type: 'changeStatus',
        payload: {
          remoteBoilerplates: [...remoteBoilerplates]
        }
      });

      const { success, data } = yield boilerplate.custom.updateRemote(payload);

      if (success) {
        msgSuccess(i18n('msg.updateSuccess'));
        yield put({
          type: 'changeStatus',
          payload: {
            remoteBoilerplates: data
          }
        });
      }
    },
    * newRemote({ payload }, { select, put }) {
      const { remoteBoilerplates } = yield select(state => state.boilerplate);
      const filter = remoteBoilerplates
        .filter(n => n.remote === payload.remote || n.name === payload.name);
      
      if (filter.length > 0) {
        msgError('Remote Url or Name is already existed!');
        return;
      }

      payload.id = uuidV4();
      payload.loading = true;

      remoteBoilerplates.push(payload);

      yield put({
        type: 'changeStatus',
        payload: {
          remoteBoilerplates: [...remoteBoilerplates]
        }
      });

      const { success, data } = yield boilerplate.custom.newRemote(payload);

      if (success) {
        yield put({
          type: 'changeStatus',
          payload: {
            remoteBoilerplates: data
          }
        });
      }
    },
    * newLocal({ payload }, { select, put }) {
      const { localBoilerplates } = yield select(state => state.boilerplate);
      const filter = localBoilerplates
        .filter(item => item.path === payload.path || item.name === payload.name);

      if (filter.length > 0) {
        msgError('Local Url or Name is already existed!');
        return;
      }

      payload.id = uuidV4();
      payload.disable = false;

      localBoilerplates.push(payload);

      yield boilerplate.custom.changeLocal(localBoilerplates);

      yield put({
        type: 'changeStatus',
        payload: {
          localBoilerplates: [...localBoilerplates]
        }
      });
    },
    * editRemote({ payload }, { select, put }) {
      const { remoteBoilerplates } = yield select(state => state.boilerplate);
      const old = remoteBoilerplates.filter(item => item.id === payload.id)[0];

      if (payload.remote !== old.remote) {
        payload.loading = true;
      }

      const newBoilerplates = remoteBoilerplates.map((item) => item.id === payload.id ? payload : item);

      yield put({
        type: 'changeStatus',
        payload: {
          remoteBoilerplates: [...newBoilerplates]
        }
      });

      const { success, data } = yield boilerplate.custom.editRemote(payload);

      if (success) {
        msgSuccess(i18n('msg.updateSuccess'));
        yield put({
          type: 'changeStatus',
          payload: {
            remoteBoilerplates: data
          }
        });
      }
    },
    * editLocal({ payload }, { select, put }) {
      const { localBoilerplates } = yield select(state => state.boilerplate);
      const newBoilerplates = localBoilerplates.map((item) => item.id === payload.id ? payload : item);

      yield boilerplate.custom.changeLocal(newBoilerplates);

      yield put({
        type: 'changeStatus',
        payload: {
          localBoilerplates: [...newBoilerplates]
        }
      });
    },
    * remove({ payload: { item, type } }, { select, put }) {
      const { localBoilerplates, remoteBoilerplates } = yield select(state => state.boilerplate);

      if (type === 'remote') {
        const temps = remoteBoilerplates.filter(n => n.id !== item.id);

        yield boilerplate.custom.removeRemote(item);
        yield put({
          type: 'changeStatus',
          payload: {
            remoteBoilerplates: [...temps]
          }
        });
      }

      if (type === 'local') {
        const temps = localBoilerplates.filter(n => n.id !== item.id);
        yield boilerplate.custom.changeLocal(temps);

        yield put({
          type: 'changeStatus',
          payload: {
            localBoilerplates: [...temps]
          }
        });
      }
    },
    

  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};