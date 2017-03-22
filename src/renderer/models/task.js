import { ipcRenderer, remote } from 'electron';
import Message from 'antd/lib/message';

import i18n from 'i18n';
import { delay, writePkgJson } from 'gui-util';
import { IS_WIN } from 'gui-const';

const { command: remoteCommand } = remote.getGlobal('services');
const taskStart = remote.getGlobal('cmd').start;
// console.log(taskStart)

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

      ipcRenderer.on('task-finished', (event, { type, success }) => {
        if (success) {
          Message.success(`Exec ${type} successed!`);
        } else {
          Message.error(`Exec ${type} failed!`);
        }
      });

      window.onbeforeunload = (e) => {
        // dispatch({
        //   type: 'dispose'
        // });
        dispatch({
          type: 'project/saveCurrent'
        });
      };
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
        payload: { ...commands }
      });
    },
    * initRemoveCommand({ payload: { project } }, { put, select }) {
      const { commands } = yield select(state => state.task);

      delete commands[project.path];

      yield put({
        type: 'changeStatus',
        payload: { ...commands }
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
        payload: { ...commands }
      });
    },
    * removeSingleCommand({ payload: { cmd } }, { put, select }) {
      const { commands } = yield select(state => state.task);
      const { current } = yield select(state => state.project);
      delete commands[current.path][cmd];

      current.pkg.scripts = { ...commands[current.path] };

      writePkgJson(current.path, current.pkg);

      yield delay(500);
      yield put({
        type: 'changeStatus',
        payload: { ...commands }
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
        command.openEditor(project.path, defaultEditor, editorPath);
      }
    },
    * start({ payload: { project } }, { put }) {
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
          filePath: project.path
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
    // * build({ payload: { project } }, { put }) {

    //   yield put({
    //     type: 'execCustomCmd',
    //     payload: {
    //       type: 'build',
    //       name: project.path
    //     }
    //   });
    // },
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
    * stopCustomCmd({ payload: { type, name } }, { put, select }) {

      remoteCommand.stop({
        name,
        type,
      });
     
    },
    /** start({ payload: { project } }, { put, select }) {
      // const { start } = yield select(state => state.task);

      const { projects } = yield select(state => state.project);

      const uid = command.start(project.path);
      // console.log('start', obj.term.pid);
      
      // start[project.path] = uid;

      // yield put({
      //   type: 'changeStatus',
      //   payload: {
      //     start
      //   }
      // });

      projects.map((item) => {
        if (item.path === project.path) {
          item.start = true;
        }
        return item;
      });

      yield put({
        type: 'project/changeStatus',
        payload: {
          projects,
          current: {
            ...project,
            start: true
          }
        }
      });

      yield put({
        type: 'layout/changeLogTab',
        payload: {
          activeTab: '1'
        }
      });
    },
    * build({ payload: { project } }, { put, select }) {
      const { build } = yield select(state => state.task);

      // let term;

      const term = command.build(project.path);

      // if (project.isNowa) {
      //   term = command.buildNowa(project.path);
      // } else {
      //   term = command.build(project.path);
      // }

      // const term = command.build(project.path);

      console.log('build', term.pid);

      // build[project.path] = { term };
      build[project.path] = { term, log: '', err: false };

      yield put({
        type: 'layout/changeLogTab',
        payload: {
          activeTab: '2'
        }
      });
      yield put({
        type: 'changeStatus',
        payload: {
          build
        }
      });
    },
    * stop({ payload: { project } }, { put, select }) {
     
      const { projects, current } = yield select(state => state.project);
      const { start } = yield select(state => state.task);

      try {
        // start[project.path].term.kill();
        delete start[project.path];
        command.stop(project.path);
      } catch (e) {
        // console.log(start[project.path]);
      }

      projects.map((item) => {
        if (item.path === project.path) item.start = false;

        return item;
      });

      current.start = false;

      yield put({
        type: 'changeStatus',
        payload: {
          start,
          // build
        }
      });

      yield put({
        type: 'project/changeStatus',
        payload: {
          projects,
          current: {
            ...current,
          }
        }
      });
    },
    * exit({ payload: { type, name } }, { put, select }) {
      const { build, start } = yield select(state => state.task);
      const { projects, current } = yield select(state => state.project);
      console.log('exit', type);
      if (type === 'start') {
        // delete start[name];
        // start[name].term.removeAllListeners();
        console.log(start);
        start[name].term = null;

        projects.map((item) => {
          if (item.path === name) item.start = false;

          return item;
        });

        current.start = false;

        yield put({
          type: 'project/changeStatus',
          payload: {
            projects,
            current: {
              ...current,
            }
          }
        });
      }

      if (type === 'build') {
        const pj = projects.filter(item => item.path === name)[0];
        
        if (build[name].err) {
          Message.error(`${pj.name} Build Failed!`);
        } else {
          Message.success(`${pj.name} Build Finished!`);
        }
        build[name].term = null;
        build[name].err = false;
        // delete build[name];
        command.clear(name, 'build');
      }

      yield put({
        type: 'changeStatus',
        payload: {
          // start,
          build
        }
      });
    },
    * clearLog({ payload: { name, type } }, { put, select }) {
      const { build, start } = yield select(state => state.task);

      if (type === 'build') {
        // build[name].kill();
        // delete build[name];
        build[name].log = '';

        yield put({
          type: 'changeStatus',
          payload: {
            // build: { ...build }
            build
          }
        });
      }

      if (type === 'start') {
        start[name].log = '';
        yield put({
          type: 'changeStatus',
          payload: {
            start
            // start: { ...start }
          }
        });
      }
    },*/
   /* * taskErr({ payload: { type, filePath } }, { select, put }) {
      const { build } = yield select(state => state.task);
      if (type === 'build') {
        build[filePath].err = true;
        yield put({
          type: 'project/taskErr',
          payload: {
            type,
            filePath
          }
        });
      }
    },*/
   /* * addLog({ payload: { logs, type } }, { put, select }) {
      // const { start, build } = yield select(state => state.task);
      // if (type === 'start') {
      //   // start[name].log += log;
      //   Object.keys(start).forEach((name) => {
      //     if (start[name]) start[name].log = logs[name];
      //   });
      // }

      // if (type === 'build') {
      //   // build[name].log += log;
      //   Object.keys(build).forEach((name) => {
      //     if (build[name]) build[name].log = logs[name];
      //   });
      // }

      // yield put({
      //   type: 'changeStatus',
      //   payload: {
      //     start,
      //     build
      //   }
      // });
    },*/

  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
