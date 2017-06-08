import { remote } from 'electron';
// import { existsSync } from 'fs-extra';
import { lt } from 'semver';
// import { join } from 'path';

import { REGISTRY_MAP } from 'const-renderer-nowa';
import { getLocalPlugins, setLocalPlugins } from 'store-renderer-nowa';
import { msgError } from 'util-renderer-nowa';
import i18n from 'i18n-renderer-nowa';
import { request } from 'shared-nowa';

const { commands, paths } = remote.getGlobal('services');

async function checkNpmLatest(item, registry) {
  const { err, data } = await request(`${registry}/${item.name}/latest`);
  if (!err) {
    item.newest = data.version;
    if (item.installed) {
      item.needUpdate = lt(item.version, data.version);
    } else {
      item.version = 'null';
    }
  } else {
    item.needUpdate = false;
    item.newest = 'null';
    item.version = item.version || 'null';
  }

  return item;
}

export default {
  namespace: 'plugin',

  state: {
    pluginList: [],
    loading: false,
    atAli: false,
  },

  subscriptions: {
    setup({ dispatch }) {
      const pluginList = getLocalPlugins();

      dispatch({
        type: 'changeStatus',
        payload: {
          pluginList,
        },
      });
    },
  },

  effects: {
    * checkAli(o, { put, select }) {
      console.log('checkAli');
      yield put({
        type: 'changeStatus',
        payload: { loading: true },
      });
      const { err } = yield request(REGISTRY_MAP.tnpm, {
        timeout: 10000
      });
      console.log(err);
      const atAli = !err;

      const { registry } = yield select(state => state.setting);

      const { data } = yield request(`${registry}/nowa-gui-plugins/latest`);
      let npmPluginList = data.plugins;

      yield put({
        type: 'changeStatus',
        payload: { atAli },
      });

      if (!atAli) {
        npmPluginList = npmPluginList.filter(item => item.origin === 'common');
      }

      yield put({
        type: 'fetch',
        payload: {
          npmPluginList,
          registry: atAli ? REGISTRY_MAP.tnpm : registry,
        },
      });
    },
    * fetch({ payload: { npmPluginList, registry } }, { put, select }) {
      const { pluginList } = yield select(state => state.plugin);
      const newList = npmPluginList.map(({ name, type }) => {
        const filter = pluginList.filter(n => n.name === name);
        if (filter.length > 0) {
          return filter[0];
        }

        return {
          name,
          type,
          installed: false,
          apply: false,
          needUpdate: false,
        };
      });

      const filter = pluginList.filter(
        item => !npmPluginList.some(n => n.name === item.name)
      );


      const res = yield Promise.all(
        newList.concat(filter).map(item => checkNpmLatest(item, registry))
      );

      yield put({
        type: 'changeStatus',
        payload: { pluginList: res, loading: false },
      });
    },
    * install({ payload }, { put, select }) {
      console.log('installPlugin', payload);
      const { atAli } = yield select(state => state.plugin);
      const { registry } = yield select(state => state.setting);

      yield put({
        type: 'changeStatus',
        payload: { loading: true },
      });

      // if (payload.type === 'cli') {

      const opt = {
        root: paths.NOWA_INSTALL_DIR,
        pkgs: [{ name: payload.name, version: payload.newest }],
        registry: atAli ? REGISTRY_MAP.tnpm : registry,
      };

      const { err } = yield commands.install({ opt });

      if (err) {
        msgError(i18n('msg.installFail'));
        yield put({
          type: 'changeStatus',
          payload: { loading: false },
        });
      } else {
        payload.version = payload.newest;
        payload.installed = true;

        const storePlugin = getLocalPlugins();

        storePlugin.push(payload);
        setLocalPlugins(storePlugin);

        yield put({
          type: 'changePluginList',
          payload,
        });
      }
      // }
    },
    * update({ payload }, { put }) {
      console.log('updateplugin', payload);

      payload.version = payload.newest;
      payload.needUpdate = false;

      yield put({
        type: 'changePluginList',
        payload,
      });

      const storePlugin = getLocalPlugins();
      setLocalPlugins(
        storePlugin.map(item => (item.name === payload.name ? payload : item))
      );
    },
    * apply({ payload: { record, checked } }, { put }) {
      console.log('applyPlugin', record);

      record.apply = checked;

      yield put({
        type: 'changePluginList',
        payload: record,
      });

      const storePlugin = getLocalPlugins();

      setLocalPlugins(
        storePlugin.map(item => (item.name === record.name ? record : item))
      );
    },
    * changePluginList({ payload }, { put, select }) {
      const { pluginList } = yield select(state => state.plugin);
      const newList = pluginList.map((item) => {
        if (item.name === payload.name) {
          return payload;
        }
        return item;
      });
      yield put({
        type: 'changeStatus',
        payload: { pluginList: [...newList], loading: false },
      });
    },
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
