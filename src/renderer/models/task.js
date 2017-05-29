import { ipcRenderer, remote } from 'electron';
import i18n from 'i18n-renderer-nowa';
import { msgError, writePkgJson } from 'util-renderer-nowa';
import { delay } from 'shared-nowa';
import { SETTING_PAGE } from 'const-renderer-nowa';
import { getLocalCommands, setLocalCommands } from 'store-renderer-nowa';

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
    globalCommandSet: getLocalCommands(),
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
      // const { globalCommandSet } = yield select(state => state.task);
      // const otherCmdKey = globalCommandSet.filter(item => item.apply);
      const commandSet = {};

      const newProjects = projects.map((item) => {
        const scripts = item.pkg.scripts ? item.pkg.scripts : {};
        commandSet[item.path] = mapCmd(scripts);

        /*if (otherCmdKey.length) {
          otherCmdKey.forEach(({ name, value }) => {
            if (!scripts[name]) {
              scripts[name] = value;
              commandSet[item.path][name] = {
                value,
                running: false
              };
            }
          });

          item.pkg.scripts = scripts;

          writePkgJson(item.path, item.pkg);
        }*/

        return item;
      });

      /*if (otherCmdKey.length) {
        const newCurrent = newProjects.filter(item => item.path === current.path)[0];
        yield put({
          type: 'project/changeStatus',
          payload: {
            current: newCurrent,
            projects: newProjects,
          }
        });
      }*/

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
      // let value = '';

      const newSet = globalCommandSet.map((item) => {
        if (item.name === cmd) {
          item.apply = true;
          // value = item.value;
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
      // let value = '';
      const newSet = globalCommandSet.map((item) => {
        if (item.name === cmd) {
          item.apply = false;
          // value = item.value;
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

        console.log(item.pkg.scripts);

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