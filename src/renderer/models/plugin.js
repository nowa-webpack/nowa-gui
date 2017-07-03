import co from 'co';
import { lt } from 'semver';
import { join } from 'path';
import { merge } from 'lodash-es';
import { remote, ipcRenderer } from 'electron';

import i18n from 'i18n-renderer-nowa';
import { request, delay } from 'shared-nowa';
import { REGISTRY_MAP, GUI_PLUGIN_NPM } from 'const-renderer-nowa';
import { getLocalPlugins, setLocalPlugins } from 'store-renderer-nowa';
import { msgError, readPluginConfig, writePluginConfig } from 'util-renderer-nowa';

const { commands, paths, tasklog, mainPlugin } = remote.getGlobal('services');
const target = name => join(paths.NODE_MODULES_PATH, name);


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

      ipcRenderer.on('plugin-render-promts', (event, payload) => {
        dispatch({
          type: 'changeStatus',
          payload: {
            showPromtsModal: true,
            pluginPromts: payload
          }
        });
        // mainPlugin.sendPromtsAnswer({ uuid: payload.uuid, answers: {a:1} })
      });
    },
  },

  effects: {
    * fetch(o, { put, select }) {
      console.log('fetch plugins');
      const { atAli } = yield select(state => state.layout);
      const { registry } = yield select(state => state.setting);
      const { pluginList } = yield select(state => state.plugin);

      const { data } = yield request(`${registry}/${GUI_PLUGIN_NPM}/latest`);
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
        type: 'install',
        payload: { reinstall: true, ...payload }
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
      const { pluginList, UIPluginList } = yield select(state => state.plugin);
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

      if (payload.type === 'ui') {
        const newUIList = UIPluginList.map(({ name }) => ({
            name,
            file: remote.require(target(name)),
          })
        );
        yield put({
          type: 'changeStatus',
          payload: { UIPluginList: [...newUIList] }
        });
      }
    },
    * initUIPluginList(o, { put, select }) {
      const pluginList = getLocalPlugins().filter(item => item.type === 'ui');

      const UIPluginList = pluginList.map(({ name }) => ({
          name,
          plugin: remote.require(target(name)),
        })
      );
      yield put({
        type: 'changeStatus',
        payload: { UIPluginList }
      });
    },
    * execPretask({ payload: { name } }, { put, select }) {
      const { UIPluginList } = yield select(state => state.plugin);
      const { current } = yield select(state => state.project);
      const defaultPluginConfig = readPluginConfig(target(name));
      const cwd = current.path;
      let preData;

      const config = merge(defaultPluginConfig, current.config);
      writePluginConfig(cwd, config);

      current.config = config;

      yield put({
        type: 'project/changeProjects',
        payload: current
      });

      yield put({
        type: 'changeStatus',
        payload: {
          selectPlugin: name
        }
      });

      const logger = (data) => {
        console.log(data);
        tasklog.writeLog(command, cwd, data);
      };
      const plugin = UIPluginList.filter(item => item.name === name)[0].plugin;
      const command = plugin.name.en;

      yield put({
        type: 'task/changeStatus',
        payload: { taskType: command }
      });

      if (!tasklog.getTask(command, cwd)) {
        tasklog.setTask(command, cwd, { term: {} });
      }

      const port = mainPlugin.port;
      
      try {
        yield plugin.run({ cwd, logger, config: config.pluginConfig || {} }, port);
      } catch (e) {
        console.log(e);
      }
    },
    saveAnswers({ payload }) {
      mainPlugin.sendPromtsAnswer(payload);
    },
    // * saveAnswers({ payload }, { put, select }) {
    //   const { UIPluginList, selectPlugin } = yield select(state => state.plugin);
    //   const plugin = UIPluginList.filter(item => item.name === selectPlugin)[0].plugin;

    //   plugin.setAnswer(payload);

    // },
    // * showPromts({ payload: { file, cwd, preData} }, { put, select }) {
    //   console.log('do showPromts', file.name.en);

    //   // const pluginPromts = file.promts(preData);
    //   yield put({
    //     type: 'changeStatus',
    //     payload: {
    //       showPromtsModal: true,
    //       pluginPromts: file.promts instanceof Array ? file.promts : file.promts(preData)
    //     }
    //   });
    // },
    // * execPluginTask({ payload: { answers } }, { put, select }) {
    //   const { UIPluginList, selectPlugin } = yield select(state => state.plugin);
    //   const { current } = yield select(state => state.project);
    //   const file = UIPluginList.filter(item => item.name === selectPlugin)[0].file;
    //   const command = file.name.en;
    //   const cwd = current.path;
    //   console.log('do execPluginTask', file.name.en);

    //   yield put({
    //     type: 'changeStatus',
    //     payload: {
    //       showPromtsModal: false,
    //     }
    //   });

    //   const logger = (data) => {
    //     console.log(data);
    //     tasklog.writeLog(command, cwd, data);
    //   };

    //   for (let i = 0; i < file.tasks.length; i++) {
    //     const { err } = yield new Promise(function(resolve){
    //       file.tasks[i].run({
    //         cwd,
    //         answers,
    //         logger,
    //         next: resolve,
    //         config: { ...current.config.pluginConfig }
    //       });
    //     });
    //     if (err) break;
    //   }
    //   console.log('done plugin tasks');
    // }
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
