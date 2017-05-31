import { ipcRenderer, remote } from 'electron';
<<<<<<< HEAD

import i18n from 'i18n-renderer-nowa';
import { delay } from 'shared-nowa';
import { SETTING_PAGE } from 'const-renderer-nowa';
import { getLocalCommands, setLocalCommands } from 'store-renderer-nowa';
import { msgError, msgInfo, writePkgJson, openUrl, getUrlByUID } from 'util-renderer-nowa';

const { commands, tasklog } = remote.getGlobal('services');

/*const pickerCmd = (cmd) => {
  const scripts = {};
  Object.keys(cmd).forEach((item) => {
    scripts[item] = cmd[item].value;
  });
  return scripts;
};*/
=======
import Message from 'antd/lib/message';
import i18n from 'i18n';
import { delay, writePkgJson } from 'gui-util';
// import { IS_WIN } from 'gui-const';

const { command: remoteCommand } = remote.getGlobal('services');
const taskStart = remote.require('./services/task').getCmd('start');

const pickerCmd = (cmd) => {
  const scripts = {};
  Object.keys(cmd).forEach((item) => {
    scripts[item] = cmd[item].cnt;
  });
  return scripts;
};
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

const mapCmd = (scripts) => {
  const cmds = {};
  Object.keys(scripts).forEach((item) => {
    cmds[item] = {
<<<<<<< HEAD
      value: scripts[item],
=======
      cnt: scripts[item],
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      running: false,
    };
  });
  return cmds;
};

export default {

  namespace: 'task',

  state: {
<<<<<<< HEAD
    commandSet: {},
    globalCommandSet: getLocalCommands(),
    taskType: 'start',
=======
    commands: {},
    logType: 'start'
    
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  },

  subscriptions: {
    setup({ dispatch }) {

<<<<<<< HEAD
      ipcRenderer
        .on('task-start', (event, { project }) => {
          dispatch({
            type: 'start',
            payload: { project }
          });
        })
        .on('task-stop', (event, { project }) => {
          dispatch({
            type: 'stop',
            payload: { project }
          });
        })
        .on('task-end', (event, { command, projPath, finished }) => {
          msgInfo(`Exec ${command} command ${finished ? 'finished' : 'stopped'}.`);

          if (command === 'start') {
            dispatch({
              type: 'project/stoppedProject',
              payload: { projPath }
            });
          }

          dispatch({
            type: 'changeCommandStatus',
            payload: {
              taskType: command,
              projPath,
              running: false
            }
          });
        });
=======
      if (taskStart && Object.keys(taskStart).length > 0) {
        Object.keys(taskStart).forEach((item) => {
          if (taskStart[item].term) {
            dispatch({
              type: 'project/startedProject',
              payload: { filePath: item }
            });
          }
        });
      }

      ipcRenderer.on('task-end', (event, { type, name, finished }) => {
        Message.info(`${type} command ${finished ? 'finished' : 'stopped'}.`);
        if (type === 'start') {
          dispatch({
            type: 'project/stoppedProject',
            payload: {
              filePath: name
            }
          });
        }
        dispatch({
          type: 'changeCommandStatus',
          payload: {
            type,
            name,
            running: false
          }
        });
      });

      ipcRenderer.on('task-start', (event, { project }) => {
        dispatch({
          type: 'start',
          payload: { project }
        });
      });

      ipcRenderer.on('task-stop', (event, { project }) => {
        dispatch({
          type: 'stop',
          payload: { project }
        });
      });

      /*ipcRenderer.on('task-finished', (event, { type }) => {
        if (success) {
          Message.success(`Exec ${type} successed!`);
        } else {
          Message.error(`Exec ${type} failed!`);
        }
      });

      ipcRenderer.on('task-stopped', (event, { type }) => {
        Message.info(`${type} command stopped.`);
      });*/
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    },
  },

  effects: {
<<<<<<< HEAD
    * execCommand({ payload: { projPath, command } }, { put }) {
      console.log('execCommand', command, projPath);

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
    * stopExecCommand({ payload }) {
      console.log('stopExecCommand', payload.command);
      yield commands.stopCmd(payload);
    },
    * stop({ payload: { project } }, { put }) {
      console.log('stop', project.path);

      yield put({
        type: 'project/stoppedProject',
        payload: { projPath: project.path }
      });

      yield put({
        type: 'stopExecCommand',
        payload: { projPath: project.path, command: 'start' }
      });
    },
    * start({ payload: { project } }, { put, select }) {
      console.log('start', project.path);
      const { commandSet } = yield select(state => state.task);
      if (!project.start && commandSet[project.path].start) {
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
    * editor({ payload: { project } }, { put, select }) {
      console.log('editor', project.path);
=======
    * initCommands({ payload: { projects } }, { put }) {
      const commands = {}; 
      projects.forEach((item) => {
        const { scripts } = item.pkg;
        commands[item.path] = mapCmd(scripts);
      });

      yield put({
        type: 'changeStatus',
        payload: { commands }
      });
    },
    * initAddCommands({ payload: { project } }, { put, select }) {
      const { commands } = yield select(state => state.task);
      // commands[project.path] = project.pkg.scripts;
      
      commands[project.path] = mapCmd(project.pkg.scripts);

      yield put({
        type: 'changeStatus',
        payload: { commands: { ...commands } }
      });
    },
    * initRemoveCommand({ payload: { project } }, { put, select }) {
      const { commands } = yield select(state => state.task);

      // command.clearLog({ name, type: logType });
      // remoteCommand

      Object.keys(commands[project.path]).forEach(type => {
        remoteCommand.clearLog({ name: project.path, type });
      });

      delete commands[project.path];

      yield put({
        type: 'changeStatus',
        payload: { commands: { ...commands } }
      });
    },
    * addSingleCommand({ payload: { cmd } }, { put, select }) {
      const { commands } = yield select(state => state.task);
      const { current } = yield select(state => state.project);

      // commands[current.path][cmd.name] = cmd.value;

      commands[current.path][cmd.name] = {
        cnt: cmd.cnt,
        running: false,
      };

      current.pkg.scripts = pickerCmd(commands[current.path]);
      // current.pkg.scripts = { ...commands[current.path] };
      console.log(current.pkg.scripts)

      writePkgJson(current.path, current.pkg);

      yield put({
        type: 'changeStatus',
        payload: { commands: { ...commands } }
      });
    },
    * removeSingleCommand({ payload: { cmd } }, { put, select }) {
      const { commands } = yield select(state => state.task);
      const { current } = yield select(state => state.project);

      if (commands[current.path][cmd].running) {
        Message.error(i18n('cmd.stop.tip'));
      } else {
        delete commands[current.path][cmd];

        current.pkg.scripts = pickerCmd(commands[current.path]);

        writePkgJson(current.path, current.pkg);

        // yield delay(500);
        yield put({
          type: 'changeStatus',
          payload: { commands: { ...commands } }
        });
      }
    },
    * openEditor({ payload: { project } }, { put, select }) {
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      const { defaultEditor, editor } = yield select(state => state.setting);
      const editorPath = editor[defaultEditor];

      if (!editorPath) {
<<<<<<< HEAD
        msgError(i18n('msg.editorNotExisted'));
=======
        Message.error(i18n('msg.editorNotExisted'));
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

        yield delay(1000);

        yield put({
<<<<<<< HEAD
          type: 'layout/showPage',
          payload: { toPage: SETTING_PAGE }
        });
      } else {
        const { success } = yield commands.openEditor(project.path, defaultEditor, editorPath);
        if (!success) {
          msgError('Open editor failed, please check the editor path.');
=======
          type: 'layout/changeStatus',
          payload: { showPage: 3 }
        });
      } else {
        const { success } = yield remoteCommand.openEditor(project.path, defaultEditor, editorPath);
        if (!success) {
          Message.error('Open editor failed, please check the editor path.');
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
          yield delay(500);

          yield put({
            type: 'layout/showPage',
<<<<<<< HEAD
            payload: { toPage: SETTING_PAGE }
=======
            payload: { toPage: 3 }
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
          });
        }
      }
    },
<<<<<<< HEAD
    * compass({ payload: { projPath } }) {
      console.log('compass', projPath);
      const { uid } = tasklog.getTask('start', projPath);
      yield delay(1000);
      openUrl(getUrlByUID(uid));
    },
    terminal({ payload: { project } }) {
      console.log('terminal', project.path);
      commands.openTerminal(project.path);
    },
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
    * initAddCommands(o, { put, select }) {
      const { current } = yield select(state => state.project);
      const { globalCommandSet, commandSet } = yield select(state => state.task);
      const otherCmdKey = globalCommandSet.filter(item => item.apply);
      const { pkg, path } = current;

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

        current.pkg = pkg;

        yield put({
          type: 'project/changeProjects',
          payload: current
        });
      }

      yield put({
        type: 'changeStatus',
        payload: { commandSet }
      });
    },
    * initRemoveCommands({ payload: { project } }, { put, select }) {
      const { commandSet } = yield select(state => state.task);
      if (commandSet[project.path]) {
        delete commandSet[project.path];
      }
      console.log(commandSet);

      yield put({
        type: 'changeStatus',
        payload: {
          commandSet: { ...commandSet }
        }
      });
    },
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
    * deleteCommand({ payload: { cmd } }, { put, select }) {
      const { current } = yield select(state => state.project);
      const { commandSet } = yield select(state => state.task);
      const { path, pkg } = current;
      if (commandSet[path][cmd]) {
        delete commandSet[path][cmd];
      }

      delete pkg.scripts[cmd];

      writePkgJson(path, pkg);

      yield put({
        type: 'project/changeProjects',
        payload: current
      });
    },
    * addGlobalCommand({ payload }, { put, select }) {
      const { globalCommandSet } = yield select(state => state.task);
      globalCommandSet.push({ ...payload, apply: false });

      setLocalCommands(globalCommandSet);

      yield put({
        type: 'changeStatus',
        payload: { globalCommandSet: [...globalCommandSet] }
      });
    },
    * deleteGlobalCommand({ payload: { cmd } }, { put, select }) {
      yield put({
        type: 'unapplyGlobalCommand',
        payload: { cmd }
      });
      const { globalCommandSet } = yield select(state => state.task);
      const filter = globalCommandSet.filter(item => item.name !== cmd);

      yield put({
        type: 'changeStatus',
        payload: { globalCommandSet: filter }
      });

      setLocalCommands(filter);

      yield put({
        type: 'changePackageJsonCommand',
        payload: { cmd, type: 'delete' }
      });
    },
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

=======
    * start({ payload: { project } }, { put, select }) {
      const { commands } = yield select(state => state.task);
      if (!project.start && commands[project.path].start) {
        yield put({
          type: 'execCustomCmd',
          payload: {
            type: 'start',
            name: project.path
          }
        });

        yield put({
          type: 'project/startedProject',
          payload: {
            filePath: project.path,
          }
        });
      }
    },
    * stop({ payload: { project } }, { put }) {
      yield put({
        type: 'stopCustomCmd',
        payload: {
          type: 'start',
          name: project.path
        }
      });

      yield put({
        type: 'project/stoppedProject',
        payload: {
          filePath: project.path
        }
      });
    },
    * execCustomCmd({ payload: { type, name } }, { put }) {
      remoteCommand.exec({
        name,
        type,
      });

      yield put({
        type: 'changeCommandStatus',
        payload: {
          type,
          name,
          running: true,
        }
      });

      // const { commands } = yield select(state => state.task);

      // commands[name][type].running = true;

      // yield put({
      //   type: 'changeStatus',
      //   payload: {
      //     commands: { ...commands },
      //     logType: type
      //   }
      // });
    },
    stopCustomCmd({ payload: { type, name } }) {
      remoteCommand.stop({
        name,
        type,
      });
    },
    * changeCommandStatus({ payload: { type, name, running } }, { select, put }) {
      const { commands } = yield select(state => state.task);

      if (commands[name]) {
        commands[name][type].running = running;
        yield put({
          type: 'changeStatus',
          payload: {
            commands: { ...commands },
            logType: type
          }
        });
      }
    }
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
<<<<<<< HEAD
};
=======

};
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
