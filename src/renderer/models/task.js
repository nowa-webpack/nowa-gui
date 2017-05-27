import { ipcRenderer, remote } from 'electron';
import i18n from 'i18n-renderer-nowa';
import { msgError } from 'util-renderer-nowa';
import { delay } from 'shared-nowa';
import { SETTING_PAGE } from 'const-renderer-nowa';

const { commands } = remote.getGlobal('services');

const pickerCmd = (cmd) => {
  const scripts = {};
  Object.keys(cmd).forEach((item) => {
    scripts[item] = cmd[item].value;
  });
  return scripts;
};

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
    commandSet: {},
    taskType: 'start',
  },

  subscriptions: {
    setup({ dispatch }) {
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
        });
    },
  },

  effects: {
    * execCommand({ payload: { project, command } }, { put, select }) {
      console.log('execCommand', command);
    },
    * stop({ payload: { project } }, { put, select }) {
      console.log('stop', project.path);

      yield put({
        type: 'project/stoppedProject',
        payload: { projPath: project.path }
      });
    },
    * start({ payload: { project } }, { put, select }) {
      console.log('start', project.path);
      // const { projects, current } = yield select(state => state.project);

      yield put({
        type: 'project/startedProject',
        payload: { projPath: project.path }
      });
    },
    * editor({ payload: { project } }, { put, select }) {
      console.log('editor', project.path);
      const { defaultEditor, editor } = yield select(state => state.setting);
      const editorPath = editor[defaultEditor];

      if (!editorPath) {
        msgError(i18n('msg.editorNotExisted'));

        yield delay(1000);

        yield put({
          type: 'layout/changeStatus',
          payload: { showPage: 3 }
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
    * compass({ payload: { project } }, { put, select }) {
      console.log('compass', project.path);
    },
    terminal({ payload: { project } }) {
      console.log('terminal', project.path);
      commands.openTerminal(project.path);
    },
    * initCommands(o, { put, select }) {
      const { projects } = yield select(state => state.project);
      const commandSet = {}; 
      projects.forEach((item) => {
        const { scripts } = item.pkg;
        commandSet[item.path] = mapCmd(scripts);
      });

      yield put({
        type: 'changeStatus',
        payload: { commandSet }
      });
    },
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};