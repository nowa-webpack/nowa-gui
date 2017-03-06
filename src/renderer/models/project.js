import { remote } from 'electron';
// import { hashHistory } from 'react-router';
import fs from 'fs-extra';
import { join } from 'path';
import Message from 'antd/lib/message';
import i18n from 'i18n';

import { getLocalProjects, setLocalProjects } from '../services/localStorage';
const { application } = remote.getGlobal('services');

const isNowaProject = filePath => fs.existsSync(join(filePath, 'abc.json'));

const getProjectInfoByPath = (filePath) => {
  let port = '';
  let abc = {};
  const isNowa = isNowaProject(filePath);

  if (isNowa) {
    abc = application.loadConfig(join(filePath, 'abc.json'));
    port = abc.options.port || '3000';
  }

  return {
    isNowa,
    port,
    abc,
    pkg: application.loadConfig(join(filePath, 'package.json')),
  };
};

const getProjects = () => {
  const projects = getLocalProjects();

  return projects.map((project) => {
    /*let port = 3000;
    const isNowa = isNowaProject(project.path);
    if (isNowa) {
      const abc = fs.readJsonSync(join(project.path, 'abc.json'));
      port = abc.options.port || 3000;
    }*/
    const info = getProjectInfoByPath(project.path);

    return {
      ...project,
      start: false,
      taskErr: false,
      port: info.port,
      isNowa: info.isNowa,
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
    setup({ dispatch }) {
      const projects = getProjects();

      dispatch({
        type: 'layout/changeStatus',
        payload: {
          showPage: projects.length === 0 ? 0 : 2
        }
      });

      const current = projects.filter(item => item.current);

      dispatch({
        type: 'changeStatus',
        payload: {
          projects,
          current: current.length > 0 ? current[0] : (projects[0] || {})
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
    * importProj({ payload: { filePath } }, { put, select }) {
      try {
        if (!filePath) {
          const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

          filePath = importPath[0];
        }

        const projectInfo = getProjectInfoByPath(filePath);

        const projectName = projectInfo.pkg.name;

        const storeProjects = getLocalProjects();
        
        const filter = storeProjects.filter(item => item.path === filePath);

        if (filter.length) {
          Message.info(i18n('msg.existed'));
        } else {
          storeProjects.push({
            name: projectName,
            path: filePath,
            port: projectInfo.port
          });

          setLocalProjects(storeProjects);

          const current = {
            start: false,
            taskErr: false,
            name: projectName,
            path: filePath,
            port: projectInfo.port,
            isNowa: projectInfo.isNowa,
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
              showPage: 2
            }
          });

          Message.success(i18n('msg.importSuccess'));
        }

        /* const isNowa = isNowaProject(filePath);
        const isExisted = fs.existsSync(join(filePath, 'abc.json'));

        if (!isExisted) {
          Message.error(i18n('msg.invalidProject'));
          return false;
        }
        const pkg = application.loadConfig(join(filePath, 'package.json'));
        // const abc = fs.readJsonSync(join(filePath, 'abc.json'));
        const projectName = abc.name;

        const storeProjects = getLocalProjects();

        const filter = storeProjects.filter(item => item.path === filePath);

        if (filter.length) {
          Message.info(i18n('msg.existed'));
        } else {
          storeProjects.push({
            name: projectName,
            path: filePath,
            isNowa
          });

          setLocalProjects(storeProjects);

          const current = {
            start: false,
            taskErr: false,
            name: projectName,
            path: filePath,
            port: abc.options.port || 3000,
            isNowa,
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
              showPage: 2
            }
          });

          Message.success(i18n('msg.importSuccess'));
        }*/
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
            showPage: 0
          }
        });
      }
    },
    * update({ payload: { old, project } }, { put, select }) {
      if (old.name !== project.name || old.port !== project.port) {
        const { projects, current } = yield select(state => state.project);

        const projectInfo = getProjectInfoByPath(old.path);

        if (old.isNowa) {
          projectInfo.abc.name = project.name;
          projectInfo.abc.options.port = project.port;

          fs.writeJSONSync(join(old.path, 'abc.json'), projectInfo.abc);
        }

        projectInfo.pkg.name = project.name;

        fs.writeJSONSync(join(old.path, 'package.json'), projectInfo.pkg);


        /*const abcPath = join(old.path, 'abc.json');

        const abc = fs.readJsonSync(abcPath);

        abc.name = project.name;

        abc.options.port = project.port;

        fs.writeJSONSync(abcPath, abc);
        */

        if (old.name !== project.name || old.port !== project.port) {
          const storeProjects = getLocalProjects();

          storeProjects.map((item) => {
            if (item.path === old.path) {
              item.name = project.name;
              item.port = project.port;
            }
            return item;
          });

          setLocalProjects(storeProjects);

          projects.map((item) => {
            if (item.path === old.path) item.name = project.name;
            return item;
          });
        }

        const payload = { projects };

        payload.current = current.path === old.path ? { ...current, ...project } : current;

        yield put({
          type: 'changeStatus',
          payload
        });

        Message.success(i18n('msg.updateSuccess'), 1.5);
      }
    },
    * refresh({ payload: { projects: storeProjects } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      const { showPage } = yield select(state => state.layout);
      if (storeProjects.length) {
        if (storeProjects.length < projects.length) {
          const newProjects = storeProjects.map(item =>
            projects.filter(_item => _item.path === item.path)[0]
          );
          const changeCur = newProjects.filter(item => item.path === current.path);
          yield put({
            type: 'changeStatus',
            payload: {
              projects: newProjects,
              current: changeCur.length ? current : newProjects[0]
            }
          });
        }
      } else {
        yield put({
          type: 'layout/changeStatus',
          payload: {
            showPage: showPage === 1 ? 1 : 0,
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
    },
    * taskErr({ payload: { type, filePath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      const { activeTab } = yield select(state => state.layout); 

      if (current.path !== filePath || 
        (current.path === filePath && activeTab !== '2')) {
        projects.map((item) => {
          if (item.path === filePath) {
            item.taskErr = true;
          }
          return item;
        });
        yield put({
          type: 'changeStatus',
          payload: { projects }
        });
      }
    },
    * saveCurrent(o, { select }) {
      const { current } = yield select(state => state.project);

      const projects = getProjects().map((item) => {
        if (item.path === current.path) {
          item.current = true;
        }
        return item;
      });

      setLocalProjects(projects);
    }
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};

