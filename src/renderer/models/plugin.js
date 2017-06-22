import { lt } from 'semver';
import { join } from 'path';
import { remote } from 'electron';

import i18n from 'i18n-renderer-nowa';
import { request, delay } from 'shared-nowa';
import { msgError } from 'util-renderer-nowa';
import { REGISTRY_MAP } from 'const-renderer-nowa';
import { getLocalPlugins, setLocalPlugins } from 'store-renderer-nowa';

const { commands, paths, tasklog } = remote.getGlobal('services');
const target = name => join(paths.NODE_MODULES_PATH, name, 'index.js');


async function checkPluginLatest(item, registry) {
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
    UIPluginList: [],
    loading: false,
    showPromtsModal: false,
    pluginPromts: [],
    selectPlugin: '',
  },

  subscriptions: {
    setup({ dispatch }) {
      const pluginList = getLocalPlugins();

      dispatch({
        type: 'changeStatus',
        payload: {
          pluginList,
          // uiPluginList: pluginList.filter(item => item.type === 'ui')
        },
      });
      dispatch({
        type: 'initUIPluginList'
      });
    },
  },

  effects: {
    * fetch(o, { put, select }) {
      console.log('fetch plugins');
      const { atAli } = yield select(state => state.layout);
      const { registry } = yield select(state => state.setting);
      const { pluginList } = yield select(state => state.plugin);

      const { data } = yield request(`${registry}/nowa-gui-plugins-test/latest`);
      let npmPluginList = data.plugins;

      if (!atAli) {
        npmPluginList = npmPluginList.filter(item => item.origin === 'common');
      }

      const newList = npmPluginList.map((item) => {
        const filter = pluginList.filter(n => n.name === item.name);
        if (filter.length > 0) {
          return filter[0];
        }

        return {
          ...item,
          installed: false,
          apply: false,
          needUpdate: false,
        };
      });

      const filter = pluginList.filter(
        item => !npmPluginList.some(n => n.name === item.name)
      );

      const npm = atAli ? REGISTRY_MAP.tnpm : registry;

      const res = yield Promise.all(
        newList.concat(filter).map(item => checkPluginLatest(item, npm))
      );

      yield put({
        type: 'changeStatus',
        payload: { pluginList: res, loading: false },
      });
    },
    * install({ payload: { reinstall, ...others } }, { put, select }) {
      console.log('installPlugin', others);
      const { atAli } = yield select(state => state.layout);
      const { registry } = yield select(state => state.setting);

      yield put({
        type: 'changeStatus',
        payload: { loading: true },
      });

      const opt = {
        root: paths.NOWA_INSTALL_DIR,
        pkgs: [{
          name: others.name,
          version: others.newest === 'null' ? 'latest' : others.newest
        }],
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
        others.version = others.newest;
        others.installed = true;

        if (!reinstall) {

          const storePlugin = getLocalPlugins();

          storePlugin.push(others);
          setLocalPlugins(storePlugin);

          if (others.type === 'ui') {
            const newItem = {
              name: others.name,
              file: remote.require(target(others.name)),
            };
            const { UIPluginList } = yield select(state => state.plugin);
            UIPluginList.push(newItem);
            yield put({
              type: 'changeStatus',
              payload: { UIPluginList: [...UIPluginList] }
            });
          }
        }

        yield put({
          type: 'changePluginList',
          payload: others,
        });
      }
    },
    * reinstall({ payload }, { put }) {
      console.log('reinstallPlugin', payload);
      const opt = {
        root: paths.NOWA_INSTALL_DIR,
        pkgs: [{ name: payload.name, version: payload.version }]
      };

      yield commands.uninstall(opt);
      yield delay(1000);
      yield put({
        type: 'install',
        payload: {...payload, reinstall: true }
      });
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
    * initUIPluginList(o, { put, select }) {
      const pluginList = getLocalPlugins().filter(item => item.type === 'ui');

      const UIPluginList = pluginList.map(({ name }) => ({
          name,
          file: remote.require(target(name)),
        })
      );
      yield put({
        type: 'changeStatus',
        payload: { UIPluginList }
      });
    },
    /** exec({ payload: { answers, file }}, { put, select }) {
      const { current } = yield select(state => state.project);
      yield commands.execPlugin({
        projPath: current.path,
        answers,
        tasks: file.tasks,
        command: file.name.en,
      });
    },*/
    * execPretask({ payload }, { put, select }) {
      const { UIPluginList } = yield select(state => state.plugin);
      const { current } = yield select(state => state.project);
      const file = UIPluginList.filter(item => item.name === payload)[0].file;
      const command = file.name.en;
      const cwd = current.path;
      let preData;

      yield put({
        type: 'changeStatus',
        payload: {
          selectPlugin: payload
        }
      });

      yield put({
        type: 'task/changeStatus',
        payload: { taskType: file.name.en }
      });

      if (!tasklog.getTask(command, cwd)) {
        tasklog.setTask(command, cwd, { term: {} });
      }
      
      try {
        if (file.pretask) {
          console.log('do pretask');
          
          const logger = (data) => {
            console.log(data);
            tasklog.writeLog(command, cwd, data);
          };
          const { err, data } = yield new Promise(function(resolve){
            file.pretask({ cwd, logger, next: resolve });
          });

          if (err) return;

          preData = data;
        }

        if (file.promts) {
          yield put({
            type: 'showPromts',
            payload: {
              file,
              preData
            }
          });
        } else if (file.tasks) {
          yield put({
            type: 'execPluginTask',
            payload: {
              answers: null
            }
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
    * showPromts({ payload: { file, cwd, preData} }, { put, select }) {
      console.log('do showPromts', file.name.en);

      // const pluginPromts = file.promts(preData);
      yield put({
        type: 'changeStatus',
        payload: {
          showPromtsModal: true,
          pluginPromts: file.promts instanceof Array ? file.promts : file.promts(preData)
        }
      });
    },
    * execPluginTask({ payload: { answers } }, { put, select }) {
      const { UIPluginList, selectPlugin } = yield select(state => state.plugin);
      const { current } = yield select(state => state.project);
      const file = UIPluginList.filter(item => item.name === selectPlugin)[0].file;
      const command = file.name.en;
      const cwd = current.path;
      console.log('do execPluginTask', file.name.en);

      const logger = (data) => {
        console.log(data);
        tasklog.writeLog(command, cwd, data);
      };

      for (let i = 0; i < file.tasks.length; i++) {
        const { err } = yield new Promise(function(resolve){
          file.tasks[i].run({ cwd, answers, logger, next: resolve });
        });
        if (err) break;
      }
      console.log('done plugin tasks');
    }
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
