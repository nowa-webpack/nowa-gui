import { remote } from 'electron';
import fs from 'fs-extra';
import { join } from 'path';

import Message from 'antd/lib/message';
import i18n from 'i18n';

import { getLocalProjects, setLocalProjects } from 'gui-local';
import { readABCJson, readPkgJson, isNowaProject } from 'gui-util';
const taskStart = remote.getGlobal('start') || {};


const getProjectInfoByPath = (filePath) => {
  let port = '';
  let abc = {};
  const isNowa = isNowaProject(filePath);

  if (isNowa) {
    abc = readABCJson(filePath);
    port = abc.options.port || '3000';
  }

  return {
    isNowa,
    port,
    abc,
    pkg: readPkgJson(filePath),
  };
};

const getProjects = () => {
  const projects = getLocalProjects();

  return projects.map((project) => {
    const info = getProjectInfoByPath(project.path);

    return {
      ...project,
      ...info,
      start: false,
      taskErr: false,
    };
  });
};


export default {

  namespace: 'project',

  state: {
    projects: [],
    current: {},
    startWacthProject: false,
  },

  subscriptions: {
    setup({ dispatch }) {
      const projects = getProjects();

      if (Object.keys(taskStart).length > 0) {
        projects.map((item) => {
          const task = taskStart[item.path];
          if (task && task.term) {
            item.start = true;
            // item.port = getPortByUID(task.uid);
          }

          return item;
        });
      }

      const current = projects.filter(item => item.current);

      dispatch({
        type: 'changeStatus',
        payload: {
          projects,
          current: current.length > 0 ? current[0] : (projects[0] || {})
        }
      });

      dispatch({
        type: 'task/initCommands',
        payload: {
          projects,
        }
      });
    },
  },

  effects: {
    * importProj({ payload: { filePath, needInstall } }, { put, select }) {
      try {
        if (!filePath) {
          const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

          filePath = importPath[0];
        }

        const projectInfo = getProjectInfoByPath(filePath);

        if (!projectInfo.isNowa) {
          Message.error(i18n('msg.invalidProject'));
          return false;
        }

        const projectName = projectInfo.pkg.name || 'UNTITLED';

        const storeProjects = getLocalProjects();
        
        const filter = storeProjects.filter(item => item.path === filePath);

        if (filter.length) {
          Message.info(i18n('msg.existed'));
        } else {
          const current = {
            ...projectInfo,
            start: false,
            taskErr: false,
            name: projectName,
            path: filePath,
            loading: needInstall
          };

          const { projects } = yield select(state => state.project);

          projects.push(current);

          yield put({
            type: 'changeStatus',
            payload: {
              projects,
              current,
              startWacthProject: !needInstall
            }
          });

          yield put({
            type: 'layout/changeStatus',
            payload: {
              showPage: 2
            }
          });

          yield put({
            type: 'task/initAddCommands',
            payload: {
              project: current,
            }
          });


          if (!needInstall) {
            Message.success(i18n('msg.importSuccess'));
            storeProjects.push({
              name: projectName,
              path: filePath,
              port: projectInfo.port
            });

            setLocalProjects(storeProjects);
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    * remove({ payload: { project } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      const filter = projects.filter(item => item.path !== project.path);

      yield put({
        type: 'task/initRemoveCommand',
        payload: {
          project
        }
      });

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
          if (item.path === old.path) {
            item.name = project.name;
            item.port = project.port;
          }
          return item;
        });

        const payload = { projects };

        payload.current = current.path === old.path ? { ...current, ...project } : current;

        yield put({
          type: 'changeStatus',
          payload
        });

        Message.success(i18n('msg.updateSuccess'), 1.5);
      }
    },
    * refresh(o, { put, select }) {
      // const storeProjects = getProjects();
      const storeProjects = getLocalProjects();
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

      const storeProjects = getLocalProjects();

      setLocalProjects(storeProjects.map((item) => {
        if (item.path === current.path) {
          item.current = true;
        }
        return item;
      }));
    },
    * finishedInstallDependencies({ payload: { filePath } }, { put, select }) {
      const { current, projects } = yield select(state => state.project);
      if (current.path === filePath) {
        current.loading = false;
      }

      projects.map((item) => {
        if (item.path === filePath) {
          item.loading = false;
        }
        return item;
      });

      const storeProjects = getLocalProjects();

      const filter = projects.filter(item => item.path === filePath);

      storeProjects.push({
        name: filter[0].name,
        path: filter[0].path,
        port: filter[0].port
      });

      setLocalProjects(storeProjects);

      Message.success(i18n('msg.importSuccess'));

      yield put({
        type: 'changeStatus',
        payload: {
          current: { ...current },
          projects: [...projects],
          startWacthProject: true
        }
      });
    },
    * startedProject({ payload: { filePath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);

      projects.map((item) => {
        if (item.path === filePath) {
          item.start = true;
        }
        return item;
      });

      yield put({
        type: 'changeStatus',
        payload: {
          projects,
          current: {
            ...current,
            start: true
          }
        }
      });
    },
    * stoppedProject({ payload: { filePath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);

      projects.map((item) => {
        if (item.path === filePath) {
          item.start = false;
        }
        return item;
      });

      yield put({
        type: 'changeStatus',
        payload: {
          projects,
          current: {
            ...current,
            start: false
          }
        }
      });
    }
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};

