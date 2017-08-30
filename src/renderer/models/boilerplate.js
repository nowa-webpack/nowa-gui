/*
  模板信息 model
*/
import { remote } from 'electron';
import { join } from 'path';
import uuidV4 from 'uuid/v4';

import i18n from 'i18n-renderer-nowa';
import { msgError, msgSuccess } from 'util-renderer-nowa';
import { REGISTRY_MAP } from 'const-renderer-nowa';
import { delay } from 'shared-nowa';

const { boilerplate, paths } = remote.getGlobal('services');
const preManifest = boilerplate.getMainifest();


export default {

  namespace: 'boilerplate',

  state: {
    officialBoilerplates: preManifest.official || [], //官方模板
    localBoilerplates: preManifest.local || [], //本地模板
    remoteBoilerplates: preManifest.remote || [],   //远程模板
    aliBoilerplates: [],  //ali模板
    antBoilerplates: [],  //蚂蚁模板

    showAddBoilerplateModal: false, // 显示新建脚手架模态框
    addOrEditBoilerplateType: 'new', // new 需要新建，local 需要修改本地，remote 需要修改远程
    editLocalBoilplateData: {}, // 需要修改的本地脚手架数据
    editRemoteBoilplateData: {}, // 需要修改的远程脚手架数据
  },

  effects: {
    // 获取官方模板
    * fetchOfficial(o, { put }) {
      const officialBoilerplates = yield boilerplate.official.get({ type: 'official' });
      yield put({
        type: 'changeStatus',
        payload: { officialBoilerplates }
      });
    },
    // 获取本地模板
    * fetchCustom(o, { put }) {
      const custom = yield boilerplate.custom.get();
      const localBoilerplates = custom.local || [];
      const remoteBoilerplates = custom.remote || [];
      yield put({
        type: 'changeStatus',
        payload: { localBoilerplates, remoteBoilerplates }
      });
    },
    // 获取ali模板
    * fetchAli(o, { put }) {
      const aliBoilerplates = yield boilerplate.official.get({
        type: 'ali',
        registry: REGISTRY_MAP.tnpm
      });
      yield put({
        type: 'changeStatus',
        payload: { aliBoilerplates }
      });
    },
    // 获取ant模板
    * fetchAnt(o, { put }) {
      const antBoilerplates = yield boilerplate.ant.get();
      yield put({
        type: 'changeStatus',
        payload: { antBoilerplates }
      });
    },
    // 更新官方模板
    * updateOffical({ payload: { name, item, type } }, { select, put }) {
      console.log('updateOffical');
      const { officialBoilerplates, aliBoilerplates } = yield select(state => state.boilerplate);
      const { registry } = yield select(state => state.setting);
      let newItems = [];

      if (type === 'official') {
        newItems = officialBoilerplates.map((n) => {
          if (n.name === name) {
            n.loading = true;
          }
          return n;
        });
      } else {
        newItems = aliBoilerplates.map((n) => {
          if (n.name === name) {
            n.loading = true;
          }
          return n;
        });
      }

      yield put({
        type: 'changeStatus',
        payload: {
          [`${type}Boilerplates`]: newItems
        }
      });

      const { err, data } = yield boilerplate.official.update({
        name,
        item,
        type,
        registry: type === 'ali' ? REGISTRY_MAP.tnpm : registry
      });
      if (!err) {
        msgSuccess(i18n('msg.updateSuccess'));
        yield put({
          type: 'changeStatus',
          payload: {
            [`${type}Boilerplates`]: data
          }
        });
      }
    },
    // 更新远程模板
    * updateRemote({ payload }, { select, put }) {
      const { remoteBoilerplates } = yield select(state => state.boilerplate);
      let newItems = remoteBoilerplates.map((item) => {
        if (item.id === payload.id) {
          item.loading = true;
        }
        return item;
      });


      yield put({
        type: 'changeStatus',
        payload: {
          remoteBoilerplates: [...newItems],
        }
      });

      const { err, data } = yield boilerplate.custom.load(payload);

      if (!err) {
        msgSuccess(i18n('msg.updateSuccess'));
      }

      console.log(data);

      // newItems = remoteBoilerplates.map((item) => {
      //   if (item.id === payload.id) {
      //     return res.item;
      //   }
      //   return item;
      // });
      yield put({
        type: 'changeStatus',
        payload: {
          remoteBoilerplates: data
        }
      });
    },
    // 更新ant模板
    * updateAnt({ payload }, { select, put }) {
      const { antBoilerplates } = yield select(state => state.boilerplate);
      // payload.loading = true;
      let newItems = antBoilerplates.map((item) => {
        if (item.name === payload.name) {
          item.loading = true;
        }
        return item;
      });

      yield put({
        type: 'changeStatus',
        payload: {
          antBoilerplates: [...newItems],
        }
      });

      const { err, data } = yield boilerplate.ant.load(payload);

      if (!err) {
        msgSuccess(i18n('msg.updateSuccess'));
        // newItems = antBoilerplates.map((item) => {
        //   if (item.name === payload.name) {
        //     item.loading = false;
        //   }
        //   return item;
        // });
        yield put({
          type: 'changeStatus',
          payload: {
            antBoilerplates: data
          }
        });
      }
    },
    // 新建远程模板
    * newRemote({ payload }, { select, put }) {
      const { remoteBoilerplates } = yield select(state => state.boilerplate);
      const filter = remoteBoilerplates
        .filter(n => n.remote === payload.remote || n.name === payload.name);
      if (filter.length > 0) {
        msgError('Remote Url or Name is already existed!');
        return;
      }

      payload.id = uuidV4();
      payload.disable = false;
      payload.loading = false;
      payload.downloaded = false;
      payload.path = join(paths.TEMPLATES_DIR, `@remote/${payload.name}`);

      remoteBoilerplates.push(payload);

      yield boilerplate.custom.changeRemote(remoteBoilerplates);

      yield put({
        type: 'changeStatus',
        payload: {
          remoteBoilerplates: [...remoteBoilerplates]
        }
      });
    },
    // 新建本地模板
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
    // 修改远程模板
    * editRemote({ payload }, { select, put }) {
      const { remoteBoilerplates } = yield select(state => state.boilerplate);
      
      let changedRemote = false;

      let newItems = remoteBoilerplates.map((item) => {
        if (item.id === payload.id) {
          changedRemote = item.remote !== payload.remote;
          return payload;
        }
        return item;
      });

      yield boilerplate.custom.changeRemote(newItems);

      if (changedRemote) {
        yield put({
          type: 'updateRemote',
          payload
        });
      } else {
        msgSuccess(i18n('msg.updateSuccess'));
        yield put({
          type: 'changeStatus',
          payload: {
            remoteBoilerplates: newItems
          }
        });
      }
    },
    // 修改本地模板
    * editLocal({ payload }, { select, put }) {
      const { localBoilerplates } = yield select(state => state.boilerplate);
      const newBoilerplates = localBoilerplates.map((item) => {
        if (item.id === payload.id) return payload;
        return item;
      });

      yield boilerplate.custom.changeLocal(newBoilerplates);

      yield put({
        type: 'changeStatus',
        payload: {
          localBoilerplates: [...newBoilerplates]
        }
      });
    },
    // 移除模板
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
    // 下载模板
    * download({ payload: { type, item, name }}, { select, put }) {
      console.log('download', type, item, name);
      const templates = yield select(state => state.boilerplate);
      
      if (!item.downloaded) {
        if (type !== 'official' && type !== 'ali') {
          // item.loading = true;
          let res;

          let newItems = templates[`${type}Boilerplates`].map(n => {
            if (n.name === item.name) {
              n.loading = true;
            }
            return n;
          });

          yield put({
            type: 'changeStatus',
            payload: {
              [`${type}Boilerplates`]: newItems
            }
          });

          if (type === 'ant') {
            res = yield boilerplate.ant.load(item);
          } else {
            res = yield boilerplate.custom.load(item);
          }

          yield put({
            type: 'changeStatus',
            payload: {
              [`${type}Boilerplates`]: res.data
            }
          });

          if (res.err) {
            return false;
          }

        } else {
          let newItems = templates[`${type}Boilerplates`].map(n => {
            if (n.name === name) {
              n.loading = true;
            }
            return n;
          });
          yield put({
            type: 'changeStatus',
            payload: {
              [`${type}Boilerplates`]: newItems
            }
          });

          const { registry } = yield select(state => state.setting);

          const { err, data } = yield boilerplate.official.load({
            type,
            item,
            name,
            registry: type === 'ali' ? REGISTRY_MAP.tnpm : registry
          });
          
          yield put({
            type: 'changeStatus',
            payload: {
              [`${type}Boilerplates`]: data
            }
          });

          if (err) return false;
        }
      }

      yield put({
        type: 'projectCreate/selectBoilerplate',
        payload: { item, type }
      });
    },
    /*// 搜索模板
    * search({ payload }, { select, put }) {
      console.log(payload);
      if (payload) {
        const {
          officialBoilerplates,
          aliBoilerplates,
          localBoilerplates,
          remoteBoilerplates,
          antBoilerplates
        } = yield select(state => state.boilerplate);

        const newOfficial = officialBoilerplates.filter(item => item.name.indexOf(payload) > -1);
        const newAli = aliBoilerplates.filter(item => item.name.indexOf(payload) > -1);
        const newLocal = localBoilerplates.filter(item => item.name.indexOf(payload) > -1);
        const newRemote = remoteBoilerplates.filter(item => item.name.indexOf(payload) > -1);
        const newAnt = antBoilerplates.filter(item => item.name.indexOf(payload) > -1);

        yield put({
          type: 'changeStatus',
          payload: {
            officialBoilerplates: newOfficial,
            aliBoilerplates: newAli,
            localBoilerplates: newLocal,
            remoteBoilerplates: newRemote,
            antBoilerplates: newAnt,
          }
        });
      }
    }*/
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
