import { ipcRenderer, remote } from 'electron';
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

const mapCmd = (scripts) => {
  const cmds = {};
  Object.keys(scripts).forEach((item) => {
    cmds[item] = {
      cnt: scripts[item],
      running: false,
    };
  });
  return cmds;
};

export default {

  namespace: 'task',

  state: {
    commands: {},
    logType: 'start'
    
  },

  subscriptions: {
    setup({ dispatch }) {

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
    },
  },

  effects: {
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
      delete commands[current.path][cmd];

      current.pkg.scripts = pickerCmd(commands[current.path]);

      // current.pkg.scripts = { ...commands[current.path] };

      writePkgJson(current.path, current.pkg);

      // yield delay(500);
      yield put({
        type: 'changeStatus',
        payload: { commands: { ...commands } }
      });
    },
    * openEditor({ payload: { project } }, { put, select }) {
      const { defaultEditor, editor } = yield select(state => state.setting);
      const editorPath = editor[defaultEditor];

      if (!editorPath) {
        Message.error(i18n('msg.editorNotExisted'));

        yield delay(1000);

        yield put({
          type: 'layout/changeStatus',
          payload: { showPage: 3 }
        });
      } else {
        const { success } = yield remoteCommand.openEditor(project.path, defaultEditor, editorPath);
        if (!success) {
          Message.error('Open editor failed, please check the editor path.');
          yield delay(500);

          yield put({
            type: 'layout/showPage',
            payload: { toPage: 3 }
          });
        }
      }
    },
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
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
