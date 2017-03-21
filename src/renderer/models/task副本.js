import { remote } from 'electron';
import Message from 'antd/lib/message';

import i18n from 'i18n';
import { delay } from 'gui-util';
import { IS_WIN } from 'gui-const';

const { command } = remote.getGlobal('services');
const taskStart = remote.getGlobal('start');
const taskBuild = remote.getGlobal('build');
const taskStartLog = remote.getGlobal('startLog');

export default {

  namespace: 'task',

  state: {
    // start: taskStart,
    // startLog: taskStartLog,
    // build: taskBuild,
  },

  subscriptions: {
    setup({ dispatch }) {

      // if (Object.keys(taskStart).length > 0) {
      //   const start = Object.keys(taskStart).map(item => ({
      //     ...taskStart[item],
      //     log: taskStartLog[item],
      //   }));

      //   dispatch({
      //     type: 'changeStatus',
      //     payload: { start }
      //   });
      // }

      window.onbeforeunload = (e) => {
        dispatch({
          type: 'dispose'
        });
        dispatch({
          type: 'project/saveCurrent'
        });
      };
    },
  },

  effects: {
    * start({ payload: { project } }, { put, select }) {
      const { start } = yield select(state => state.task);

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

      /*if (project.isNowa) {
        term = command.buildNowa(project.path);
      } else {
        term = command.build(project.path);
      }*/

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
      /*if (type === 'start') {
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
      }*/

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
    },
    * dispose(o, { select }) {
      const { start, build } = yield select(state => state.task);
      // remote.getCurrentWindow().removeAllListeners();
       Object.keys(start).map((item) => {
        // start[item].kill();
        // if (start[item].term) {
        //   start[item].term.removeAllListeners();
        // }
        
      });
      // Object.keys(start).map((item) => {
      //   // start[item].kill();
      //   if (start[item].term) start[item].term.kill();
        
      // });
      // Object.keys(build).map((item) => {
      //   // build[item].kill();
      //   if (build[item].term) build[item].term.kill();
      // });
    },
    * openEditor({ payload: { project } }, { put, select}) {
      const { defaultEditor, editor } = yield select(state => state.layout);
      // console.log(defaultEditor)
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
    * taskErr({ payload: { type, filePath } }, { select, put }) {
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
    },
    * addLog({ payload: { logs, type } }, { put, select }) {
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
    },

  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
