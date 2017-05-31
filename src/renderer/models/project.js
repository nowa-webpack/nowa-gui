import { remote, ipcRenderer } from 'electron';
<<<<<<< HEAD
import { join, basename } from 'path';
import { existsSync } from 'fs-extra';

import i18n from 'i18n-renderer-nowa';
import { delay } from 'shared-nowa';
import { getLocalProjects, setLocalProjects } from 'store-renderer-nowa';
import {
  readABCJson, writeABCJson,
  readPkgJson, writePkgJson,
  isNowaProject, isAliProject,
  msgError, msgSuccess,
} from 'util-renderer-nowa';

import {
  REGISTRY_MAP, NPM_MAP, URL_MATCH,
  PROJECT_PAGE, SETTING_PAGE, WELCOME_PAGE
} from 'const-renderer-nowa';

const { commands, tray, tasklog } = remote.getGlobal('services');

=======
import fs from 'fs-extra';
import { join } from 'path';

import Message from 'antd/lib/message';
import i18n from 'i18n';

import { getLocalProjects, setLocalProjects } from 'gui-local';
import { REGISTRY_MAP, NPM_MAP } from 'gui-const';
import { readABCJson, writeABCJson,
  readPkgJson, writePkgJson,
  isNowaProject, getPkgDependencies, delay, isAliProject
} from 'gui-util';

const taskStart = remote.getGlobal('start') || {};
const { command, tray } = remote.getGlobal('services');
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

const getProjectInfoByPath = (filePath) => {
  let abc = {};
  const pkg = readPkgJson(filePath);
  const isNowa = isNowaProject(filePath);
  if (isNowa) {
    abc = readABCJson(filePath);
  }

  const obj = {
    name: pkg.name,
    isNowa,
    abc,
    pkg,
<<<<<<< HEAD
    path: filePath
  };

  if (isNowa) {
    if (abc.npm) {
      if (URL_MATCH.test(abc.npm)) {
        obj.registry = abc.npm;
      } else {
        obj.registry = REGISTRY_MAP[abc.npm] || '';
        abc.npm = obj.registry;
        writeABCJson(filePath, abc);
        obj.abc = abc;
      }
    }
  } else if (isAliProject(pkg)) {
    obj.registry = REGISTRY_MAP.tnpm;
  }
=======
    hasMod: false,
    // hasPage: false,
  };

  if (isNowa) {
    if (Object.keys(REGISTRY_MAP).includes(abc.npm)) {
      obj.registry = REGISTRY_MAP[abc.npm];
    } else {
      obj.registry = abc.npm;
      abc.npm = NPM_MAP[abc.npm];
      writeABCJson(filePath, abc);
      obj.abc = abc;
    }

    // if (abc.template) {
      // console.log(join(abc.template, 'mod'));
      // obj.hasMod = fs.readdirSync(abc.template).filter(dir => dir !== 'proj').length > 0;
      // obj.hasPage = fs.existsSync(join(abc.template, 'page'));
    // }
  } else if (isAliProject(pkg)) {
    obj.registry = REGISTRY_MAP.tnpm;
  }


  // if (isAliProject(pkg)) {
  //   obj.registry = REGISTRY_MAP.tnpm;
  // } else if (isNowa) {
  //   obj.registry = REGISTRY_MAP[abc.npm];
  // }

>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  return obj;
};

const getProjects = () => {
  const projects = getLocalProjects();

  return projects.map((project) => {
    const info = getProjectInfoByPath(project.path);

    return {
<<<<<<< HEAD
      start: false,
      // taskErr: false,
=======
      loadingStep: 0,
      start: false,
      taskErr: false,
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      ...info,
      ...project,
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
<<<<<<< HEAD
      const taskStart = tasklog.getCmd('start');

      if (taskStart) {
        const keys = Object.keys(taskStart);
        if (keys.length > 0) {
          projects.map((item) => {
            if (keys.some(n => n === item.path && taskStart[n].term)) {
              item.start = true;
            }
            return item;
          });
        }
=======

      if (Object.keys(taskStart).length > 0) {
        projects.map((item) => {
          const task = taskStart[item.path];
          if (task && task.term) {
            item.start = true;
          }
          return item;
        });
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      }

      tray.setInitTrayMenu(projects);

      window.onbeforeunload = () => {
        dispatch({
          type: 'saveCurrent'
        });
      };

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
<<<<<<< HEAD
      });
=======
        payload: {
          projects,
        }
      });
      ipcRenderer.on('import-installed', (event, { project: filePath, err }) => {
        if (err) {
          Message.error(i18n('msg.installFail'));
        } else {
          Message.success(i18n('msg.importSuccess'));
          dispatch({
            type: 'finishedInstallDependencies',
            payload: {
              filePath,
            }
          });
        }
      });

>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
    },
  },

  effects: {
<<<<<<< HEAD
    * add({ payload }, { select, put }) {
      console.log('add project');
      const projectInfo = getProjectInfoByPath(payload.projPath);

      if (payload.registry) {
        projectInfo.registry = payload.registry;
      }

      const projName = projectInfo.pkg.name || basename(payload.projPath);
=======
    * importProjectFromFolder({ payload }, { put, select }) {
      try {
        let filePath;
        const { registry: globalRegistry } = yield select(state => state.setting);
        const storeProjects = getLocalProjects();

        if (payload.filePath) {
          filePath = payload.filePath;
        } else {
          const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
          filePath = importPath[0];
        }

        if (storeProjects.find(item => item.path === filePath)) {
          Message.error(i18n('msg.existed'));
          return false;
        }

        if (!fs.existsSync(join(filePath, 'package.json'))) {
          Message.error(i18n('msg.invalidProject'));
          return false;
        }

        const projectInfo = getProjectInfoByPath(filePath);

        const dependencies = getPkgDependencies(projectInfo.pkg);
        const projectName = projectInfo.pkg.name || 'UNTITLED';

        let needInstall = false;

        if (!fs.existsSync(join(filePath, 'node_modules'))) {
          needInstall = true;
        } else {
          const filter = dependencies.filter(item => !fs.existsSync(join(filePath, 'node_modules', item.name)));
          if (filter.length) {
            needInstall = true;
          }
        }

        console.log(projectName, needInstall);

        if (!needInstall) {
          yield put({
            type: 'importProjectFromInit',
            payload: {
              filePath,
              projectRegistry: projectInfo.registry || globalRegistry,
            }
          });
        } else {
          const current = {
            ...projectInfo,
            start: false,
            taskErr: false,
            name: projectName,
            path: filePath,
            loadingStep: 1, // 0 no-op 1: showInfo 2: showLog
            registry: projectInfo.registry || globalRegistry,
          };

          yield put({
            type: 'addLocalStoreProject',
            payload: {
              current
            }
          });

          

          storeProjects.push({
            name: current.name,
            path: current.path,
            registry: current.registry,
            loadingStep: 1
          });

          setLocalProjects(storeProjects);
        }
      } catch (e) {
        console.log(e);
      }
    },
    * startInstallImportProject({ payload: { project, newRegistry } }, { put, select }) {
      const { projects } = yield select(state => state.project);

      project.registry = newRegistry;
      project.loadingStep = 2;

      const newProjs = projects.map((item) => {
        if (item.path === project.path) return project;
        return item;
      });

      yield put({
        type: 'changeStatus',
        payload: {
          projects: [...newProjs],
          current: { ...project },
        }
      });

      const dependencies = getPkgDependencies(project.pkg);

      const options = {
        root: project.path,
        registry: newRegistry,
        pkgs: dependencies,
      };
      
      command.progressInstall({
        options,
        sender: 'import',
      });
    },
    /** importProjectFromFolder({ payload: { filePath, needInstall, projectRegistry } }, { put, select }) {
      try {
        const { registry: defaultRegistry } = yield select(state => state.layout);
        let projectInfo = {};
        let userRegistry;
        console.log('filePath', filePath);

        
        if (!filePath) {
          const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });

          filePath = importPath[0];

          if (!fs.existsSync(join(filePath, 'package.json'))) {
            Message.error(i18n('msg.invalidProject'));
            return false;
          }
          
          projectInfo = getProjectInfoByPath(filePath);
          
        } else {
          projectInfo = getProjectInfoByPath(filePath);
        }

        if (needInstall) {
          const pkgs = getPkgDependencies(projectInfo.pkg);

          // if (isAliProject(projectInfo.pkg)) {
          //   userRegistry = REGISTRY_MAP.tnpm;
          // } else if (projectInfo.registry) {
          //   userRegistry = projectInfo.registry;
          // } else {
          //   userRegistry = defaultRegistry;
          // }

          if (projectInfo.registry) {
            userRegistry = projectInfo.registry;
          } else if (isAliProject(pkgs)) {
            userRegistry = REGISTRY_MAP.tnpm;
          } else {
            userRegistry = defaultRegistry;
          }

          const options = {
            root: filePath,
            registry: userRegistry,
            pkgs,
          };
          
          // command.notProgressInstall({
          command.progressInstall({
            options,
            sender: 'import',
          });
        }

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
        }

        const current = {
          ...projectInfo,
          start: false,
          taskErr: false,
          name: projectName,
          path: filePath,
          loading: needInstall
        };

        if (!userRegistry && !projectRegistry) {
          if (isAliProject(projectInfo.pkg)) {
            current.registry = REGISTRY_MAP.tnpm;
          } else if (!current.registry) {
            current.registry = defaultRegistry;
          }
        }

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

        yield put({
          type: 'layout/changeStatus',
          payload: {
            showPage: 2
          }
        });

        if (!needInstall) {
          Message.success(i18n('msg.importSuccess'));
          storeProjects.push({
            name: projectName,
            path: filePath,
            registry: current.registry
          });

          setLocalProjects(storeProjects);

          yield put({
            type: 'task/start',
            payload: {
              project: current
            }
          });
        }
        
      } catch (e) {
        console.log(e);
      }
    },*/
    * importProjectFromInit({ payload: { filePath, projectRegistry } }, { put }) {

      const projectInfo = getProjectInfoByPath(filePath);

      const projectName = projectInfo.pkg.name || 'UNTITLED';
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

      const current = {
        ...projectInfo,
        start: false,
        taskErr: false,
<<<<<<< HEAD
        name: projName,
        path: payload.projPath,
      };

      console.log(current);
=======
        name: projectName,
        path: filePath,
        loadingStep: 0,
      };

      if (projectRegistry) {
        current.registry = projectRegistry;
      }
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

      const storeProjects = getLocalProjects();

      storeProjects.push({
        name: current.name,
        path: current.path,
        registry: current.registry,
      });

      setLocalProjects(storeProjects);

<<<<<<< HEAD
      const { projects } = yield select(state => state.project);

=======
      yield put({
        type: 'addLocalStoreProject',
        payload: {
          current,
        }
      });

      Message.success(i18n('msg.importSuccess'));

      // yield put({
      //   type: 'task/start',
      //   payload: {
      //     project: current
      //   }
      // });
    },
    * addLocalStoreProject({ payload: { current } }, { put, select }) {
      const { projects } = yield select(state => state.project);
      
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
      projects.push(current);

      tray.setInitTrayMenu(projects);

      yield put({
        type: 'changeStatus',
        payload: {
          projects,
          current,
<<<<<<< HEAD
=======
          startWacthProject: true
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
        }
      });

      yield put({
        type: 'task/initAddCommands',
<<<<<<< HEAD
        // payload: {
        //   project: current,
        // }
      });

      yield put({
        type: 'layout/showPage',
        payload: { toPage: PROJECT_PAGE }
      });
    },
    * remove({ payload }, { select, put }) {
      console.log('remove project', payload.name);
      const { projects, current } = yield select(state => state.project);
      const filter = projects.filter(item => item.path !== payload.path);


      yield put({
        type: 'task/initRemoveCommands',
        payload: { project: payload }
      });

      if (payload.start) {
        yield put({
          type: 'task/execCommand',
          payload: { project: payload, command: 'stop' }
=======
        payload: {
          project: current,
        }
      });

      yield put({
        type: 'layout/changeStatus',
        payload: {
          showPage: 2
        }
      });
    },
    * finishedInstallDependencies({ payload: { filePath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);

      projects.map((item) => {
        if (filePath === item.path && 'loadingStep' in item) {
          delete item.loadingStep;
        }
        return item;
      });

      if (current.path === filePath && 'loadingStep' in current) {
        delete current.loadingStep;
      }

      const storeProjects = getLocalProjects();

      const sp = storeProjects.map((item) => {
        if (item.path === filePath && 'loadingStep' in item) {
          return { name: item.name, path: item.path, registry: item.registry };
        }
        return { ...item };
      });

      setLocalProjects(sp);

      yield put({
        type: 'changeStatus',
        payload: {
          projects: [...projects],
          current: { ...current }
        }
      });
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
        yield put({
          type: 'task/stop',
          payload: {
            project,
          }
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
        });
      }

      const storeProjects = getLocalProjects();

<<<<<<< HEAD
      setLocalProjects(storeProjects.filter(item => item.path !== payload.path));
=======
      setLocalProjects(storeProjects.filter(item => item.path !== project.path));
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9

      tray.setInitTrayMenu(filter);

      if (filter.length) {
        yield put({
          type: 'changeStatus',
          payload: {
            projects: filter,
<<<<<<< HEAD
            current: payload.path === current.path ? filter[0] : current
=======
            current: project.path === current.path ? filter[0] : current
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
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
<<<<<<< HEAD
            showPage: WELCOME_PAGE
=======
            showPage: 0
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
          }
        });
      }
    },
<<<<<<< HEAD
    * startedProject({ payload: { projPath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      let project;

      const newProjects = projects.map((item) => {
        if (item.path === projPath) {
          item.start = true;
          project = item;
=======
    * updateABC({ payload: { project, abc } }, { put, select }) {
      const { projects } = yield select(state => state.project);
      project.abc = abc;

      writeABCJson(project.path, abc);

      projects.map((item) => {
        if (item.path === project.path) {
          return project;
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
        }
        return item;
      });

<<<<<<< HEAD
      if (current.path === projPath) {
        current.start = true;
      }

      ipcRenderer.send('tray-change-status', {
        project,
        status: 'start',
        fromRenderer: true,
      });

      yield put({
        type: 'changeStatus',
        payload: {
          projects: [...newProjects],
          current: {
            ...current,
          }
        }
      });
    },
    * stoppedProject({ payload: { projPath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      let project;

      const newProjects = projects.map((item) => {
        if (item.path === projPath) {
          item.start = false;
          project = item;
        }
        return item;
      });

      if (current.path === projPath) {
        current.start = false;
      }

      ipcRenderer.send('tray-change-status', {
        project,
        status: 'stop',
        fromRenderer: true
      });

      yield put({
        type: 'changeStatus',
        payload: {
          projects: [...newProjects],
          current: {
            ...current,
          }
        }
      });
    },
    * updatePackageJson({ payload: { project, data } }, { put }) {
      const { registry, repo, ...others } = data;
      const nameDiff = project.name !== data.name;
      const registryDiff = project.registry !== registry;

      if (nameDiff || registryDiff) {
        if (project.isNowa && registryDiff) {
          project.abc.npm = registry;
          writeABCJson(project.path, project.abc);
        }

        project.name = data.name;
        project.registry = registry;

        const storeProjects = getLocalProjects();

        storeProjects.map((item) => {
          if (item.path === project.path) {
            item.name = data.name;
=======
      yield put({
        type: 'changeStatus',
        payload: {
          current: { ...project },
          projects: [...projects],
        }
      });
    },
    * updatePkg({ payload: { project, pkg, registry } }, { put, select }) {
      const { projects } = yield select(state => state.project);
      project.pkg = pkg;
      // project.registry = registry;

      if (project.name !== pkg.name || project.registry !== registry) {

        if (project.isNowa && project.registry !== registry) {
          project.abc.npm = NPM_MAP[registry];
          writeABCJson(project.path, project.abc);
        }

        project.name = pkg.name;
        project.registry = registry;

        const storeProjects = getLocalProjects();
        storeProjects.map((item) => {
          if (item.path === project.path) {
            item.name = pkg.name;
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
            item.registry = registry;
          }
          return item;
        });
        setLocalProjects(storeProjects);
      }

<<<<<<< HEAD
      const pkg = { ...project.pkg, ...others };

      if (repo) {
        pkg.repository.url = repo;
      }

      project.pkg = pkg;
      writePkgJson(project.path, pkg);
      yield put({
        type: 'changeProjects',
        payload: project
      });
    },
    * updateABCJson({ payload: { project, abc } }, { put }) {
      project.abc = abc;
      writeABCJson(project.path, abc);
      yield put({
        type: 'changeProjects',
        payload: project
      });
    },
    * changeProjects({ payload }, { put, select }) {
      const { projects } = yield select(state => state.project);
      const newProjects = projects.map((item) => {
        if (item.path === payload.path) {
          return payload;
        }
        return item;
      });
      yield put({
        type: 'changeStatus',
        payload: {
          current: { ...payload },
          projects: [...newProjects],
        }
      });
    },
    * uninstallPackage({ payload: { data, type } }, { put, select }) {
      console.log('uninstallPackage', data.name);
      const { current } = yield select(state => state.project);
      const { pkg } = current;
      delete pkg[type][data.name];
      current.pkg = pkg;

      yield put({
        type: 'changeProjects',
        payload: current
      });

      writePkgJson(current.path, pkg);

      const opt = {
        root: current.path,
        pkgs: [data]
      };

      yield commands.uninstall(opt);
    },
    * updateDepencies({ payload: { data, type } }, { put, select }) {
      const { current } = yield select(state => state.project);

      data.forEach(({ name, version }) => {
        if (!current.pkg[type]) {
          current.pkg[type] = {};
        }
        current.pkg[type][name] = version;
      });

      yield put({
        type: 'changeProjects',
        payload: current
      });

      writePkgJson(current.path, current.pkg);
    },
    * refresh(o, { put, select }) {
      console.log('refresh project');
      const storeProjects = getLocalProjects();
      const { projects, current } = yield select(state => state.project);

      if (storeProjects.length) {
        if (storeProjects.length < projects.length) {
          // const newProjects = storeProjects.forEach(item =>
          //   projects.filter(_item => _item.path === item.path)[0]
          // );
          const newProjects = projects.filter(item => existsSync(join(item.path, 'package.json')));
          const hasCur = newProjects.some(item => item.path === current.path);
          yield put({
            type: 'changeStatus',
            payload: {
              projects: [...newProjects],
              current: hasCur ? current : newProjects[0]
=======
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
    * updateServerConfig({ payload: { project, abc } }, { put }) {
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
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
            }
          });
        }
      } else {
        yield put({
<<<<<<< HEAD
          type: 'layout/showPage',
          payload: {
            toPage: WELCOME_PAGE
=======
          type: 'layout/changeStatus',
          payload: {
            showPage: showPage === 1 ? 1 : 0,
            // activeTab: '1'
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
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
<<<<<<< HEAD
=======
    * saveCurrent(o, { select, put }) {
      const { current } = yield select(state => state.project);

      yield put({
        type: 'changeStatus',
        payload: { startWacthProject: false }
      });

      const storeProjects = getLocalProjects();

      setLocalProjects(storeProjects.map((item) => {
        item.current = item.path === current.path;
        return { ...item };
      }));
    },
    * startedProject({ payload: { filePath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      let project;

      projects.map((item) => {
        if (item.path === filePath) {
          item.start = true;
          project = item;
        }
        return item;
      });

      if (current.path === filePath) {
        current.start = true;
      }

      ipcRenderer.send('tray-change-status', {
        project,
        status: 'start',
        fromRenderer: true,
      });

      yield put({
        type: 'changeStatus',
        payload: {
          projects: [...projects],
          current: {
            ...current,
          }
        }
      });
    },
    * stoppedProject({ payload: { filePath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      let project;

      projects.map((item) => {
        if (item.path === filePath) {
          item.start = false;
          project = item;
        }
        return item;
      });

      if (current.path === filePath) {
        current.start = false;
      }

      ipcRenderer.send('tray-change-status', {
        project,
        status: 'stop',
        fromRenderer: true
      });

      yield put({
        type: 'changeStatus',
        payload: {
          projects,
          current: {
            ...current,
          }
        }
      });
    },
    * updatePkgModules({ payload: { pkgs, type } }, { select }) {
      const { current } = yield select(state => state.project);
      const dp = current.pkg[type];
      pkgs.forEach((item) => {
        if (!item.safe) {
          dp[item.name] = `^${item.version}`;
        }
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
>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
<<<<<<< HEAD
=======

>>>>>>> 2dc4f9f8980517544d60bdf919e64c1148fbf5e9
