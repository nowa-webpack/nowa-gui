import { ipcRenderer, remote } from 'electron';
import i18n from 'i18n-renderer-nowa';
import { msgError, writePkgJson } from 'util-renderer-nowa';
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
    defaultCommandSet: {},
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
    * compass({ payload: { project } }, { put, select }) {
      console.log('compass', project.path);
    },
    terminal({ payload: { project } }) {
      console.log('terminal', project.path);
      commands.openTerminal(project.path);
    },
    * initCommands(o, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      const { defaultCommandSet } = yield select(state => state.task);
      const commandSet = {};
      const otherCmdKey = Object.keys(defaultCommandSet);

      const newProjects = projects.map((item) => {
        const scripts = item.pkg.scripts ? item.pkg.scripts : {};
        commandSet[item.path] = mapCmd(scripts);

        if (otherCmdKey.length) {
          otherCmdKey.forEach((cmd) => {
            scripts[cmd] = defaultCommandSet[cmd];
            commandSet[item.path][cmd] = {
              value: defaultCommandSet[cmd],
              running: false
            };
          });

          item.pkg.scripts = scripts;

          writePkgJson(item.path, item.pkg);
        }

        return item;
      });

      if (otherCmdKey.length) {
        const newCurrent = newProjects.filter(item => item.path === current.path)[0];
        yield put({
          type: 'project/changeStatus',
          payload: {
            current: newCurrent,
            projects: newProjects,
          }
        });
      }

      yield put({
        type: 'changeStatus',
        payload: { commandSet }
      });
    },
    * initAddCommands(o, { put, select }) {
      const { current } = yield select(state => state.project);
      const { defaultCommandSet, commandSet } = yield select(state => state.task);
      const otherCmdKey = Object.keys(defaultCommandSet);
      const { pkg, path } = current;

      commandSet[path] = mapCmd(pkg.scripts || {});

      if (otherCmdKey.length) {
        otherCmdKey.forEach((cmd) => {
          pkg.scripts[cmd] = defaultCommandSet[cmd];
          commandSet[path][cmd] = {
            value: defaultCommandSet[cmd],
            running: false
          };
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

  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};