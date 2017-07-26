/*
  命令集任务 model
*/
import { ipcRenderer, remote } from 'electron';
import { existsSync } from 'fs-extra';

import i18n from 'i18n-renderer-nowa';
import { delay } from 'shared-nowa';
import { SETTING_PAGE } from 'const-renderer-nowa';
import { getLocalCommands, setLocalCommands } from 'store-renderer-nowa';
import { msgError, msgInfo, writePkgJson, openUrl, getUrlByUID } from 'util-renderer-nowa';

const { commands, tasklog } = remote.getGlobal('services');


const mapCmd = (scripts) => {
  const cmds = {};
  Object.keys(scripts).forEach((item) => {
    cmds[item] = {
      value: scripts[item],
      running: false,
    };
  });
  return cmds;
};

export default {

  namespace: 'task',

  state: {
    commandSet: {},   // 所有项目的scripts字段的命令，命令集集合
    globalCommandSet: getLocalCommands(), // 全局命令
    taskType: 'start',  // 当前显示的命令
  },

  subscriptions: {
    setup({ dispatch }) {

      ipcRenderer
        // 监听任务启动
        .on('task-start', (event, { project }) => {
          dispatch({
            type: 'start',
            payload: { project }
          });
        })
        // 监听任务停止
        .on('task-stop', (event, { project }) => {
          dispatch({
            type: 'stop',
            payload: { project }
          });
        })
        // 监听任务退出
        .on('task-end', (event, payload) => {
          dispatch({
            type: 'onTaskEnd',
            payload
          });
        });
    },
  },

  effects: {
    // 执行命令
    * execCommand({ payload: { projPath, command } }, { put }) {
      console.log('execCommand', command, projPath);
      // 调用main端的 npm run xxx
      yield commands.execCmd({
        projPath,
        command,
      });

      yield put({
        type: 'changeCommandStatus',
        payload: {
          taskType: command,
          projPath,
          running: true,
        }
      });
    },
    // 停止命令
    * stopExecCommand({ payload }) {
      console.log('stopExecCommand', payload.command);
      yield commands.stopCmd(payload);
    },
    // 点击停止按钮
    * stop({ payload: { project } }, { put }) {
      console.log('stop', project.path);
      // 项目处于停止态
      yield put({
        type: 'project/stoppedProject',
        payload: { projPath: project.path }
      });
      // 停止命令
      yield put({
        type: 'stopExecCommand',
        payload: { projPath: project.path, command: 'start' }
      });
    },
    // 点击启动按钮
    * start({ payload: { project } }, { put, select }) {
      console.log('start', project.path);
      const { commandSet } = yield select(state => state.task);
      if (!project.start && commandSet[project.path].start) {
        // 项目处于启动态
        yield put({
          type: 'project/startedProject',
          payload: { projPath: project.path }
        });

        yield put({
          type: 'execCommand',
          payload: { projPath: project.path, command: 'start' }
        });
      }
    },
    // 更改命令状态
    * changeCommandStatus({ payload: { taskType, projPath, running } }, { put, select }) {
      const { commandSet } = yield select(state => state.task);

      if (commandSet[projPath]) {
        commandSet[projPath][taskType].running = running;
        yield put({
          type: 'changeStatus',
          payload: {
            commandSet: { ...commandSet },
            taskType
          }
        });
      }
    },
    // 打开编辑器
    * editor({ payload: { project } }, { put, select }) {
      console.log('editor', project.path);

      const { defaultEditor, editor } = yield select(state => state.setting);
      const editorPath = editor[defaultEditor];

      if (!editorPath) {
        msgError(i18n('msg.editorNotExisted'));

        yield delay(1000);

        yield put({
          type: 'layout/showPage',
          payload: { toPage: SETTING_PAGE }
        });
      } else {
        const { success } = yield commands.openEditor(project.path, defaultEditor, editorPath);
        if (!success) {
          msgError('Open editor failed, please check the editor path.');

          yield delay(500);

          yield put({
            type: 'layout/showPage',
            payload: { toPage: SETTING_PAGE }
          });
        }
      }
    },
    // 打开浏览器
    * compass({ payload: { projPath } }) {
      console.log('compass', projPath);
      const { uid } = tasklog.getTask('start', projPath);
      yield delay(1000);
      openUrl(getUrlByUID(uid));
    },
    // 命令终止后，弹出提示窗
    * onTaskEnd({ payload: { command, projPath, finished } }, { put, select }) {
      if (existsSync(projPath)) {
        msgInfo(`Exec ${command} command ${finished ? 'finished' : 'stopped'}.`);

        const { projects } = yield select(state => state.project);

        if (projects.some(item => item.path === projPath)) {
          if (command === 'start') {
            yield put({
              type: 'project/stoppedProject',
              payload: { projPath }
            });
          }
          
          yield put({
            type: 'changeCommandStatus',
            payload: {
              taskType: command,
              projPath,
              running: false
            }
          });
        }
      }
    },
    // 唤起终端
    terminal({ payload: { project } }) {
      console.log('terminal', project.path);
      commands.openTerminal(project.path);
    },
    // 对项目列表中的所有项目初始化命令集集合
    * initCommands(o, { put, select }) {
      const { projects } = yield select(state => state.project);
      const commandSet = {};

      projects.forEach((item) => {
        const scripts = item.pkg.scripts ? item.pkg.scripts : {};
        commandSet[item.path] = mapCmd(scripts);
      });

      yield put({
        type: 'changeStatus',
        payload: { commandSet }
      });
    },
    // 新增项目后，更新命令集集合
    * initAddCommands({ payload }, { put, select }) {
      // const { current } = yield select(state => state.project);
      const { globalCommandSet, commandSet } = yield select(state => state.task);
      const otherCmdKey = globalCommandSet.filter(item => item.apply);
      const { pkg, path } = payload;

      commandSet[path] = mapCmd(pkg.scripts || {});

      if (otherCmdKey.length) {
        otherCmdKey.forEach(({ name, value }) => {
          if (!pkg.scripts[name]) {
            pkg.scripts[name] = value;
            commandSet[path][name] = {
              value,
              running: false
            };
          }
        });

        writePkgJson(path, pkg);

        payload.pkg = pkg;

        yield put({
          type: 'project/changeProjects',
          payload
        });
      }

      yield put({
        type: 'changeStatus',
        payload: { commandSet }
      });
    },
    // 移除项目后，更新命令集集合
    * initRemoveCommands({ payload }, { put, select }) {
      const { commandSet } = yield select(state => state.task);

      payload.forEach(({ path }) => {
        if (commandSet[path]) {
          Object.keys(commandSet[path]).forEach(cmd => tasklog.clearLog(cmd, path));
          delete commandSet[path];
        }
      });

      yield put({
        type: 'changeStatus',
        payload: {
          commandSet: { ...commandSet }
        }
      });
    },
    // 添加单个项目的单个命令
    * addCommand({ payload: { name, value } }, { put, select }) {
      const { current } = yield select(state => state.project);
      const { commandSet } = yield select(state => state.task);

      const { path, pkg } = current;

      commandSet[path][name] = { value, running: false };

      yield put({
        type: 'changeStatus',
        payload: {
          commandSet: { ...commandSet }
        }
      });

      pkg.scripts = pkg.scripts || {};

      pkg.scripts[name] = value;

      writePkgJson(path, pkg);

      yield put({
        type: 'project/changeProjects',
        payload: current
      });
    },
    // 删除单个项目的单个命令
    * deleteCommand({ payload: { cmd } }, { put, select }) {
      const { current } = yield select(state => state.project);
      const { commandSet, taskType } = yield select(state => state.task);
      const { path, pkg } = current;
      if (commandSet[path][cmd]) {
        delete commandSet[path][cmd];
        tasklog.clearLog(cmd, current.path);
      }

      delete pkg.scripts[cmd];

      writePkgJson(path, pkg);

      if (taskType === cmd) {
        yield put({
          type: 'changeStatus',
          payload: { taskType: 'start' }
        });
      }

      yield put({
        type: 'project/changeProjects',
        payload: current
      });
    },
    // 添加全局命令
    * addGlobalCommand({ payload }, { put, select }) {
      const { globalCommandSet } = yield select(state => state.task);
      globalCommandSet.push({ ...payload, apply: false });

      setLocalCommands(globalCommandSet);

      yield put({
        type: 'changeStatus',
        payload: { globalCommandSet: [...globalCommandSet] }
      });
    },
    // 删除全局命令
    * deleteGlobalCommand({ payload: { cmd } }, { put, select }) {
      yield put({
        type: 'changePackageJsonCommand',
        payload: { cmd, type: 'delete' }
      });
      const { globalCommandSet } = yield select(state => state.task);
      const filter = globalCommandSet.filter(item => item.name !== cmd);
      

      yield put({
        type: 'changeStatus',
        payload: { globalCommandSet: filter }
      });

      setLocalCommands(filter);
    },
    // 应用全局命令到全部的项目
    * applyGlobalCommand({ payload: { cmd } }, { put, select }) {
      const { globalCommandSet } = yield select(state => state.task);

      const newSet = globalCommandSet.map((item) => {
        if (item.name === cmd) {
          item.apply = true;
        }
        return item;
      });

      setLocalCommands(newSet);

      yield put({
        type: 'changeStatus',
        payload: { globalCommandSet: newSet }
      });
      yield put({
        type: 'changePackageJsonCommand',
        payload: { cmd, type: 'new' }
      });
    },
    // 取消应用全局命令
    * unapplyGlobalCommand({ payload: { cmd } }, { put, select }) {
      const { globalCommandSet } = yield select(state => state.task);
      const newSet = globalCommandSet.map((item) => {
        if (item.name === cmd) {
          item.apply = false;
        }
        return item;
      });

      setLocalCommands(newSet);

      yield put({
        type: 'changeStatus',
        payload: { globalCommandSet: newSet }
      });

      yield put({
        type: 'changePackageJsonCommand',
        payload: { cmd, type: 'delete' }
      });
    },
    // 更改项目的package.json 的 scripts 字段
    * changePackageJsonCommand({ payload: { cmd, type } }, { put, select }) {
      console.log('changePackageJsonCommand', cmd, type);
      const { projects, current } = yield select(state => state.project);
      const { commandSet, globalCommandSet } = yield select(state => state.task);
      const globalCmdValue = globalCommandSet.filter(item => item.name === cmd)[0].value;
      let newCurrent = {};

      const newProjects = projects.map((item) => {
        if (type === 'delete' && item.pkg.scripts[cmd] === globalCmdValue) {
          delete item.pkg.scripts[cmd];
          delete commandSet[item.path][cmd];
        } else if (type === 'new' && !item.pkg.scripts[cmd]) {
          console.log('added global cmd');
          item.pkg.scripts[cmd] = globalCmdValue;
          commandSet[item.path][cmd] = { globalCmdValue, running: false };
        }

        writePkgJson(item.path, item.pkg);

        if (item.path === current.path) {
          newCurrent = item;
        }

        return item;
      });

      yield put({
        type: 'project/changeStatus',
        payload: {
          projects: [...newProjects],
          current: newCurrent
        }
      });

      yield put({
        type: 'changeStatus',
        payload: {
          commandSet: { ...commandSet }
        }
      });
    },
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};

