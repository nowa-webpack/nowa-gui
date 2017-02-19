import { remote } from 'electron';
// import { hashHistory } from 'react-router';
import fs from 'fs-extra';
import path from 'path';
import Message from 'antd/lib/message';

import { getLocalProjects, setLocalProjects } from '../services/localStorage';


const getProjects = () => {
  const projects = getLocalProjects();

  return projects.map((project) => {
    const abc = fs.readJsonSync(path.join(project.path, 'abc.json'));

    return {
      ...project,
      start: false,
      port: abc.options.port || 3000
    };
  });
};


export default {

  namespace: 'project',

  state: {
    projects: [],
    current: {},
  },

  subscriptions: {
    setup({ dispatch, history }) {
      const projects = getProjects();

      dispatch({
        type: 'changeStatus',
        payload: {
          projects,
          current: projects[0] || {}
        }
      });

      setInterval(() => {
        const curProjects = getProjects();
        dispatch({
          type: 'refresh',
          payload: {
            projects: curProjects,
          }
        });
      }, 5000);
    },
  },

  effects: {
    * importProj({ payload: { filePath } }, { put, call, select }) {
      try {
        if (!filePath) {
          const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

          filePath = importPath[0];
        }

        const isExisted = fs.existsSync(path.join(filePath, 'abc.json'));

        if (!isExisted) {
          Message.error('Invalied Project!');
          return false;
        }

        const abc = fs.readJsonSync(path.join(filePath, 'abc.json'));
        const projectName = abc.name;

        const storeProjects = getLocalProjects();

        const filter = storeProjects.filter(item => item.path === filePath);
        console.log(filter);

        if (filter.length) {
          Message.info('Already existed!');
        } else {
          storeProjects.push({
            name: projectName,
            path: filePath
          });

          setLocalProjects(storeProjects);

          const current = {
            start: false,
            name: projectName,
            path: filePath,
            port: abc.options.port || 3000
          };

          const { projects } = yield select(state => state.project);

          projects.push(current);

          yield put({
            type: 'changeStatus',
            payload: {
              projects,
              current
            }
          });


          yield put({
            type: 'layout/changeStatus',
            payload: {
              showConfig: true
            }
          });

          Message.success('Import Success!');
        }
      } catch (e) {
        console.log(e);
      }
    },
    * remove({ payload: { project } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      const filter = projects.filter(item => item.path !== project.path);

      if (project.start) {
        // const { start, build } = yield select(state => state.task);
        yield put({
          type: 'task/stop',
          payload: {
            project,
          }
        });
      }

      const storeProjects = getLocalProjects();

      setLocalProjects(storeProjects.filter(item => item.path !== project.path));

      if (filter.length) {
        yield put({
          type: 'changeStatus',
          payload: {
            projects: filter,
            current: project.path === current.path ? filter[0] : current
          }
        });
      } else {
        yield put({
          type: 'changeStatus',
          payload: {
            projects: [],
            current: {}
          }
        });

        yield put({
          type: 'layout/changeStatus',
          payload: {
            showConfig: false,
            showCreateForm: false,
            showInstallLog: false,
          }
        });
      }
    },
    * update({ payload: { old, project } }, { put, select }) {
      if (old.name !== project.name || old.port !== project.port) {
        const { projects, current } = yield select(state => state.project);

        const abcPath = path.join(old.path, 'abc.json');

        const abc = fs.readJsonSync(abcPath);

        abc.name = project.name;

        abc.options.port = project.port;

        fs.writeJSONSync(abcPath, abc);

        if (old.name !== project.name) {
          const storeProjects = getLocalProjects();

          storeProjects.map((item) => {
            if (item.name === old.name) item.name = project.name;
            return item;
          });

          setLocalProjects(storeProjects);

          projects.map((item) => {
            if (item.name === old.name) item.name = project.name;
            return item;
          });
        }

        const payload = { projects };

        payload.current = current.path === old.path ? { ...current, ...project } : current;

        yield put({
          type: 'changeStatus',
          payload
        });

        Message.success('Update success!', 1.5);
      }
    },

    * refresh({ payload: { projects: storeProjects } }, { put, select }) {
      const { projects } = yield select(state => state.project);
      if (storeProjects.length) {
        if (storeProjects.length < projects.length) {
          const newProjects = storeProjects.map(item =>
            projects.filter(_item => _item.path === item.path)[0]
            );
          yield put({
            type: 'changeStatus',
            payload: {
              projects: newProjects
            }
          });
        }
      } else {
        yield put({
          type: 'layout/changeStatus',
          payload: {
            showConfig: false,
            activeTab: '1'
          }
        });

        yield put({
          type: 'changeStatus',
          payload: {
            projects: [],
            current: {},
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

