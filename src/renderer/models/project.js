import { remote, ipcRenderer } from 'electron';
import { join, basename } from 'path';
import { existsSync } from 'fs-extra';

import i18n from 'i18n-renderer-nowa';
import { request } from 'shared-nowa';
import { getLocalProjects, setLocalProjects } from 'store-renderer-nowa';
import {
  readABCJson, writeABCJson,
  readPkgJson, writePkgJson,
  isNowaProject, isAliProject,
  msgError, msgSuccess,
} from 'util-renderer-nowa';

import {
  REGISTRY_MAP, URL_MATCH,
  PROJECT_PAGE, WELCOME_PAGE
} from 'const-renderer-nowa';

const { commands, tray, tasklog } = remote.getGlobal('services');


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
  return obj;
};

const getProjects = () => {
  const projects = getLocalProjects();

  return projects.map((project) => {
    const info = getProjectInfoByPath(project.path);

    return {
      start: false,
      // taskErr: false,
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
      });
    },
  },

  effects: {
    * add({ payload }, { select, put }) {
      console.log('add project');
      const projectInfo = getProjectInfoByPath(payload.projPath);

      if (payload.registry) {
        projectInfo.registry = payload.registry;
      }

      const projName = projectInfo.pkg.name || basename(payload.projPath);

      const current = {
        ...projectInfo,
        start: false,
        taskErr: false,
        name: projName,
        path: payload.projPath,
      };

      console.log(current);

      const storeProjects = getLocalProjects();

      storeProjects.push({
        name: current.name,
        path: current.path,
        registry: current.registry,
      });

      setLocalProjects(storeProjects);

      const { projects } = yield select(state => state.project);

      projects.push(current);

      tray.setInitTrayMenu(projects);

      yield put({
        type: 'changeStatus',
        payload: {
          projects,
          current,
        }
      });

      yield put({
        type: 'task/initAddCommands',
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
        payload: [payload]
      });

      if (payload.start) {
        yield put({
          type: 'task/stopExecCommand',
          payload: { projPath: payload.path, command: 'start' }
        });
      }

      const storeProjects = getLocalProjects();

      setLocalProjects(storeProjects.filter(item => item.path !== payload.path));

      tray.setInitTrayMenu(filter);

      if (filter.length) {
        yield put({
          type: 'changeStatus',
          payload: {
            projects: filter,
            current: payload.path === current.path ? filter[0] : current
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
            showPage: WELCOME_PAGE
          }
        });
      }
    },
    * startedProject({ payload: { projPath } }, { put, select }) {
      const { projects, current } = yield select(state => state.project);
      let project;

      const newProjects = projects.map((item) => {
        if (item.path === projPath) {
          item.start = true;
          project = item;
        }
        return item;
      });

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
    * updatePackageJson({ payload: { project, data } }, { put, select }) {
      const { registry, repo, ...others } = data;
      const nameDiff = project.name !== data.name;
      const registryDiff = project.registry !== registry;

      if (nameDiff || registryDiff) {
        const { registryList } = yield select(state => state.setting);
        if (!registryList.includes(registry)) {
          const { err } = yield request(registry, { timeout: 10000 });
          if (err) {
            msgError(i18n('msg.invalidRegistry'));
            return false;
          }
        }
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
            item.registry = registry;
          }
          return item;
        });
        setLocalProjects(storeProjects);
      }

      const pkg = { ...project.pkg, ...others };

      if (repo) {
        pkg.repository.url = repo;
      }

      project.pkg = pkg;
      writePkgJson(project.path, pkg);
      msgSuccess(i18n('msg.updateSuccess'));
      yield put({
        type: 'changeProjects',
        payload: project
      });
      return true;
    },
    * updateABCJson({ payload: { project, abc } }, { put }) {
      project.abc = abc;
      writeABCJson(project.path, abc);
      msgSuccess(i18n('msg.updateSuccess'));
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
      tray.setInitTrayMenu(newProjects);
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
          const delProjects = projects.filter(item => !existsSync(join(item.path, 'package.json')));

          delProjects.forEach(({ path, pkg }) => {
            Object.keys(pkg.scripts || {})
              .forEach(command => commands.stopCmd({ projPath: path, command }));
          });

          yield put({
            type: 'task/initRemoveCommands',
            payload: delProjects
          });

          const newProjects = projects.filter(item => existsSync(join(item.path, 'package.json')));
          const hasCur = newProjects.some(item => item.path === current.path);

          tray.setInitTrayMenu(newProjects);
          yield put({
            type: 'changeStatus',
            payload: {
              projects: [...newProjects],
              current: hasCur ? current : newProjects[0]
            }
          });
        }
      } else {
        yield put({
          type: 'layout/showPage',
          payload: {
            toPage: WELCOME_PAGE
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
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};