import { remote, ipcRenderer } from 'electron';
import fs from 'fs-extra';
import { join } from 'path';

import Message from 'antd/lib/message';
import i18n from 'i18n';

import { getLocalProjects, setLocalProjects } from 'gui-local';
import { readABCJson, writeABCJson,
  readPkgJson, writePkgJson,
  isNowaProject, getPkgDependencies, delay
} from 'gui-util';

const taskStart = remote.getGlobal('start') || {};
const { registry } = remote.getGlobal('config');
const { command } = remote.getGlobal('services');

const getProjectInfoByPath = (filePath) => {
  let abc = {};
  const pkg = readPkgJson(filePath);
  const isNowa = isNowaProject(filePath);
  if (isNowa) {
    abc = readABCJson(filePath);
  }

  return {
    name: pkg.name,
    isNowa,
    abc,
    pkg,
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
      ipcRenderer.on('import-installed', (event, { project: filePath }) => {
        dispatch({
          type: 'finishedInstallDependencies',
          payload: {
            filePath,
          }
        });
      });
      window.onbeforeunload = () => {
        dispatch({
          type: 'saveCurrent'
        });
      };
    },
  },

  effects: {
    * importProj({ payload: { filePath, needInstall } }, { put, select }) {
      try {
        console.log('filePath', filePath);
        if (!filePath) {
          const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

          filePath = importPath[0];

          const pkgs = getPkgDependencies(readPkgJson(filePath));

          const options = {
            root: filePath,
            registry: registry(),
            targetDir: filePath,
            // storeDir: join(filePath, '.npminstall'),
            storeDir: join(filePath, 'node_modules', '.npminstall'),
            timeout: 5 * 60000,
            pkgs,
          };

          command.notProgressInstall({
            options,
            sender: 'import',
          });
        }

        const projectInfo = getProjectInfoByPath(filePath);

        // if (!projectInfo.isNowa) {
        //   Message.error(i18n('msg.invalidProject'));
        //   return false;
        // }

        const projectName = projectInfo.pkg.name || 'UNTITLED';

        const storeProjects = getLocalProjects();
        
        const filter = storeProjects.filter(item => item.path === filePath);

        if (filter.length) {
          Message.info(i18n('msg.existed'));
          return false;
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
              // port: projectInfo.port
            });

            setLocalProjects(storeProjects);
          }

          yield put({
            type: 'layout/changeStatus',
            payload: {
              showPage: 2
            }
          });
          
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
    * updateABC({ payload: { project, abc } }, { put, select }) {
      const { projects } = yield select(state => state.project);
      project.abc = abc;

      writeABCJson(project.path, abc);

      projects.map((item) => {
        if (item.path === project.path) {
          return project;
        }
        return item;
      });

      yield put({
        type: 'changeStatus',
        payload: {
          current: { ...project },
          projects: [...projects],
        }
      });
    },
    * updatePkg({ payload: { project, pkg } }, { put, select }) {
      const { projects } = yield select(state => state.project);
      project.pkg = pkg;

      if (project.name !== pkg.name) {
        project.name = pkg.name;
        const storeProjects = getLocalProjects();
        storeProjects.map((item) => {
          if (item.path === project.path) {
            item.name = pkg.name;
          }
          return item;
        });
        setLocalProjects(storeProjects);
      }

      writePkgJson(project.path, pkg);

      projects.map((item) => {
        if (item.path === project.path) {
          return project;
        }
        return item;
      });

      yield put({
        type: 'changeStatus',
        payload: {
          current: { ...project },
          projects: [...projects],
        }
      });
    },
    * updateServerConfig({ payload: { project, abc } }, { put, select }) {
      yield put({
        type: 'updateABC',
        payload: { project, abc }
      });

      if (project.start) {
        yield put({
          type: 'task/stop',
          payload: { project }
        });
        yield delay(1000);
        yield put({
          type: 'task/start',
          payload: { project }
        });
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
            // activeTab: '1'
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
    * saveCurrent(o, { select }) {
      const { current } = yield select(state => state.project);

      const storeProjects = getLocalProjects();

      setLocalProjects(storeProjects.map((item) => {
        item.current = item.path === current.path;
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
        // port: filter[0].port
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
          projects: [...projects],
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
    },
    * updatePkgModules({ payload: { pkgs, type } }, { select }) {
      const { current } = yield select(state => state.project);
      const dp = current.pkg[type];
      console.log(pkgs)
      pkgs.forEach((item) => {
        dp[item.name] = `^${item.version}`;
      });
      writePkgJson(current.path, current.pkg);
    },
    * deletePkgModules({ payload: { pkgName, type } }, { select }) {
      const { current } = yield select(state => state.project);
      const { pkg } = current;
      delete pkg[type][pkgName];
      writePkgJson(current.path, pkg);
    },
    * addPkgModules({ payload: { version, pkgName, type } }, { select }) {
      const { current } = yield select(state => state.project);
      if (!current.pkg[type]) {
        current.pkg[type] = {};
      }
      current.pkg[type][pkgName] = `^${version}`;
      writePkgJson(current.path, current.pkg);
    }
    // * taskErr({ payload: { type, filePath } }, { put, select }) {
    //   const { projects, current } = yield select(state => state.project);
    //   const { activeTab } = yield select(state => state.layout); 

    //   if (current.path !== filePath || 
    //     (current.path === filePath && activeTab !== '2')) {
    //     projects.map((item) => {
    //       if (item.path === filePath) {
    //         item.taskErr = true;
    //       }
    //       return item;
    //     });
    //     yield put({
    //       type: 'changeStatus',
    //       payload: { projects }
    //     });
    //   }
    // },
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};

