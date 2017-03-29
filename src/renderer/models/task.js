import { ipcRenderer, remote } from 'electron';
import Message from 'antd/lib/message';
// import pubsub from 'electron-pubsub';
import i18n from 'i18n';
import { delay, writePkgJson } from 'gui-util';
import { IS_WIN } from 'gui-const';

// const pubsub = remote.require('electron-pubsub');
const { command: remoteCommand } = remote.getGlobal('services');
const taskStart = remote.require('./services/task').getCmd('start');

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

      // pubsub.subscribe('install-finished', (event, { type, success }) => {
      ipcRenderer.on('task-finished', (event, { type, success }) => {
        if (success) {
          Message.success(`Exec ${type} successed!`);
        } else {
          Message.error(`Exec ${type} failed!`);
        }
      });

      // pubsub.subscribe('install-stopped', (event, { type }) => {
      ipcRenderer.on('task-stopped', (event, { type }) => {
        Message.info(`${type} command stopped.`);
      });

      
    },
  },

  effects: {
    * initCommands({ payload: { projects } }, { put }) {
      const commands = {}; 
      projects.forEach((item) => {
        const { scripts } = item.pkg;
        commands[item.path] = scripts;
      });

      yield put({
        type: 'changeStatus',
        payload: { commands }
      });
    },
    * initAddCommands({ payload: { project } }, { put, select }) {
      const { commands } = yield select(state => state.task);
      commands[project.path] = project.pkg.scripts;

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

      commands[current.path][cmd.name] = cmd.value;

      current.pkg.scripts = { ...commands[current.path] };

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

      current.pkg.scripts = { ...commands[current.path] };

      writePkgJson(current.path, current.pkg);

      // yield delay(500);
      yield put({
        type: 'changeStatus',
        payload: { commands: { ...commands } }
      });
    },
    * openEditor({ payload: { project } }, { put, select }) {
      const { defaultEditor, editor } = yield select(state => state.layout);
      const editorPath = editor[defaultEditor];

      if (!editorPath) {
        Message.error(i18n('msg.editorNotExisted'));

        yield delay(1000);

        yield put({
          type: 'layout/changeStatus',
          payload: { showSetModal: true }
        });
      } else {
        remoteCommand.openEditor(project.path, defaultEditor, editorPath);
      }
    },
    * start({ payload: { project } }, { put }) {

      // const uid = yield remoteCommand.exec({
      //   name: project.path,
      //   type: 'start',
      // });

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
        type: 'changeStatus',
        payload: {
          logType: type
        }
      });
    },
    stopCustomCmd({ payload: { type, name } }, { put, select }) {
      remoteCommand.stop({
        name,
        type,
      });
    },

  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
