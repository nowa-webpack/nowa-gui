/*
  插件 model
*/
import co from 'co';
import { lt } from 'semver';
import { join } from 'path';
import { merge } from 'lodash-es';
import { remote, ipcRenderer } from 'electron';
import React from 'react';
import Modal from 'antd/lib/modal';

import i18n from 'i18n-renderer-nowa';
import { request, delay } from 'shared-nowa';
import { REGISTRY_MAP, GUI_PLUGIN_NPM } from 'const-renderer-nowa';
import { getLocalPlugins, setLocalPlugins } from 'store-renderer-nowa';
import { msgError, readPluginConfig, writePluginConfig } from 'util-renderer-nowa';

const confirm = Modal.confirm;
const { commands, paths, tasklog, mainPlugin } = remote.getGlobal('services');
const target = name => join(paths.NODE_MODULES_PATH, name);

/*

  插件在用户配置中保存格式



  "APPLYED_PLUGINS": [
    {
      "name": "@ali/nw-checkout",
      "type": "ui" || "cli", // ui 代表 nowa-gui 插件，cli代表命令行插件
      "origin": "ali" || "common",  //ali仅内网可见，common都可见
      "installed": true,
      "apply": false,
      "needUpdate": false,
      "newest": "2.0.1-beta.0",
      "version": "2.0.1-beta.0"
    }, {...}
  ],
*/

async function checkPluginLatest(item, registry) {
  const { err, data } = await request(`${registry}/${item.name}/latest`);
  if (!err) {
    item.newest = data.version;
    if (item.installed) {
      item.needUpdate = lt(item.version, data.version);
    } else {
      item.version = 'Not Installed';
    }
  } else {
    item.needUpdate = false;
    item.newest = 'Net Error';
    item.version = item.version || 'Not Installed';
  }

  return item;
}

export default {
  namespace: 'plugin',

  state: {
    pluginList: [], // 插件列表
    UIPluginList: [], // nowa-gui 插件列表
    loading: false, // 插件加载状态
    showPromtsModal: false, // 显示提问框
    pluginPromts: [],   // nowa-gui插件提问模板
    selectPlugin: '', // 当前选择的插件
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
    // 加载插件列表
    * fetch(o, { put, select }) {
      console.log('fetch plugins');
      const { atAli } = yield select(state => state.layout);
      const { registry } = yield select(state => state.setting);
      const { pluginList } = yield select(state => state.plugin);

      // 根据不同环境加载不同的插件列表，内网外网区别对待
      const { data } = yield request(`${registry}/${GUI_PLUGIN_NPM}/latest`);
      let npmPluginList = data.plugins;

      // 不在内网就筛选common组件
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
    // 插件安装， reinstall 代表是否是更新插件
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
          version: others.newest === 'Net Error' ? 'latest' : others.newest
        }],
        registry: atAli ? REGISTRY_MAP.tnpm : registry,
      };

      
      // 安装插件不需要安装日志
      const { err } = yield commands.noLoggingInstall(opt);

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
              plugin: remote.require(target(others.name)),
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

        // 如果是ui插件，需要重启才能生效
        if (others.type === 'ui') {
          confirm({
            title: i18n('setting.plugin.restart.title'),
            content: i18n('setting.plugin.restart.tip'),
            okText: i18n('form.ok'),
            cancelText: i18n('form.cancel'),
            onOk() {
              remote.app.relaunch();
              remote.app.exit(0);
            },
          });
        }
      }
    },
   /* * reinstall({ payload }, { put }) {
      console.log('reinstallPlugin', payload);
      const opt = {
        root: paths.NOWA_INSTALL_DIR,
        pkgs: [{ name: payload.name, version: payload.version }]
      };

      // yield commands.uninstall(opt);
      // yield delay(1000);
      yield put({
        type: 'install',
        payload: {...payload, reinstall: true }
      });
    },*/
    // 卸载插件
    * uninstall({ payload }, { put, select }) {
      console.log('uninstall plugin', payload);
      yield put({
        type: 'changeStatus',
        payload: { loading: true },
      });

      const opt = {
        root: paths.NOWA_INSTALL_DIR,
        pkg: payload.name,
      };

      const { err } = yield commands.uninstall(opt);
      console.log('after uninstall plugin', err);

      if (!err) {
        const storePlugin = getLocalPlugins();

        const filter = storePlugin.filter(item => item.name !== payload.name)

        setLocalPlugins(filter);

        payload.installed = false;

        const { pluginList, UIPluginList } = yield select(state => state.plugin);
        const newList = pluginList.map((item) => {
          if (item.name === payload.name) {
            return payload;
          }
          return item;
        });
        yield put({
          type: 'changeStatus',
          payload: {
            pluginList: newList,
            payload: UIPluginList.filter(item => item.name !== payload.name),
            loading: false
          }
        });
      }
    },
    // 更新插件
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
    // 功能无用
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
    // 修改插件列表
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
            plugin: remote.require(target(name)),
          })
        );
        yield put({
          type: 'changeStatus',
          payload: { UIPluginList: [...newUIList] }
        });
      }
    },
    // 加载ui插件内容
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
    // 执行ui插件任务
    * execPretask({ payload: { name } }, { put, select }) {
      const { UIPluginList } = yield select(state => state.plugin);
      const { current } = yield select(state => state.project);
      const defaultPluginConfig = readPluginConfig(target(name));
      const cwd = current.path;
      let preData;

      // 插件会在项目目录下生成.nowa 文件，这个是插件的配置文件
      // 合并配置文件
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

      // 捕获插件内部输出内容
      const logger = (data) => {
        console.log(data);
        tasklog.writeLog(command, cwd, data);
      };
      const plugin = UIPluginList.filter(item => item.name === name)[0].plugin;
      // 选取插件名字作为命令名字
      const command = plugin.name.en;

      yield put({
        type: 'task/changeStatus',
        payload: { taskType: command }
      });
      // 初始化插件到tasklog
      if (!tasklog.getTask(command, cwd)) {
        tasklog.setTask(command, cwd, { term: {} });
      }
      // 获取main端为插件分配的端口号
      const port = mainPlugin.getPort();
      console.log('port', port);
      try {
        // 执行插件
        yield plugin.run({ cwd, logger, config: config.pluginConfig || {} }, port);
      } catch (e) {
        console.log(e);
      }
    },
    // 获取用户输入的答案传递给插件
    * saveAnswers({ payload }, { put }) {
      yield put({
        type: 'changeStatus',
        payload: {
          showPromtsModal: false
        }
      });
      mainPlugin.sendPromtsAnswer(payload);
    },
  },
  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
