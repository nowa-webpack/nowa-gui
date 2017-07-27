/*
  用户项目 model
*/
import { remote, ipcRenderer } from 'electron';
import { join, basename } from 'path';
import { existsSync } from 'fs-extra';

import i18n from 'i18n-renderer-nowa';
import { request } from 'shared-nowa';
import { getLocalProjects, setLocalProjects } from 'store-renderer-nowa';
import {
  readABCJson, writeABCJson,
  readPkgJson, writePkgJson,
  readPluginConfig, writePluginConfig,
  isNowaProject, isAliProject,
  msgError, msgSuccess,
} from 'util-renderer-nowa';

import {
  REGISTRY_MAP, URL_MATCH,
  PROJECT_PAGE, WELCOME_PAGE
} from 'const-renderer-nowa';

const { commands, tray, tasklog } = remote.getGlobal('services');

/*
  用户配置文件中的项目列表
  "LOCAL_PROJECTS": [
    {
      "name": "dd1",
      "path": "C:\\Users\\wb-xyl259837\\NowaProject\\dd1",
      "registry": "http://registry.npm.taobao.org"
    },{。。。}]
*/

// 加载项目的基本信息
const getProjectInfoByPath = (filePath) => {
  let abc = {};
  const pkg = readPkgJson(filePath);
  const config = readPluginConfig(filePath);
  const isNowa = isNowaProject(filePath);
  if (isNowa) {
    abc = readABCJson(filePath);
  }

  const obj = {
    name: pkg.name,
    isNowa,
    abc,
    pkg,
    config,
    path: filePath,
    reload: 0,
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
  } else if (config.registry) {
    obj.registry = config.registry;
  }
  return obj;
};

// 获取项目列表
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
    projects: [], // 项目列表
    current: {},  //当前项目
    startWacthProject: false, // 监控刷新项目标记
  },

  subscriptions: {
    setup({ dispatch }) {
      const projects = getProjects();
      const taskStart = tasklog.getCmd('start');

      // 如果一开始有任务是启动的，那么要在初始化的时候同样启动任务
      // 常见场景：start项目后，设置页面更换语言，刷新renderer端
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

      // 设置任务托盘列表
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

      // 初始化命令集任务
      dispatch({
        type: 'task/initCommands',
      });
    },
  },

  effects: {
    // 增加项目
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
        payload: current
      });

      yield put({
        type: 'layout/showPage',
        payload: { toPage: PROJECT_PAGE }
      });
    },
    // 移除项目
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
    // 启动项目后
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
    // 停止项目后
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
    // 更新项目的 package.json 文件
    * updatePackageJson({ payload: { project, data } }, { put, select }) {
      const { registry, repo, ...others } = data;
      const nameDiff = project.name !== data.name;
      const registryDiff = project.registry !== registry;

      if (nameDiff || registryDiff) {
        // 如果用户修改了项目的源地址，需要判断源是否可访问
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
        // name 和 regsitry 是需要保存到用户配置文件里面的，所以要更新该文件信息
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
    // 更新abc.json
    * updateABCJson({ payload: { project, abc } }, { put }) {
      project.abc = abc;
      writeABCJson(project.path, abc);
      msgSuccess(i18n('msg.updateSuccess'));
      yield put({
        type: 'changeProjects',
        payload: project
      });
    },
    // 修改项目列表
    * changeProjects({ payload }, { put, select }) {
      const { projects } = yield select(state => state.project);
      const newProjects = projects.map((item) => {
        if (item.path === payload.path) {
          return payload;
        }
        return item;
      });
      // 更新任务托盘
      tray.setInitTrayMenu(newProjects);
      yield put({
        type: 'changeStatus',
        payload: {
          current: { ...payload },
          projects: [...newProjects],
        }
      });
    },
    // 卸载依赖
    * uninstallPackage({ payload: { data, type } }, { put, select }) {
      console.log('uninstallPackage', data.name);
      const { current } = yield select(state => state.project);
      const { pkg } = current;
      delete pkg[type][data.name];
      current.pkg = pkg;

      // yield put({
      //   type: 'changeProjects',
      //   payload: current
      // });

      // writePkgJson(current.path, pkg);

      const opt = {
        root: current.path,
        pkg: data.name,
        type
        // pkgs: [data]
      };

      yield commands.uninstall(opt);
    },
    // 更新依赖，单纯更新依赖引用
    * updateDepencies({ payload: { data, type } }, { put, select }) {
      const { current } = yield select(state => state.project);

      // yield put({
      //   type: 'reload',
      //   payload: current
      // })
      // npm会去修改package.json文件， 所以这里不需要重复写
      data.forEach(({ name, version }) => {
        if (!current.pkg[type]) {  
          current.pkg[type] = {};
        }
        current.pkg[type][name] = version;
      });

      // yield put({
      //   type: 'changeProjects',
      //   payload: current
      // });

      // writePkgJson(current.path, current.pkg);
    },
    // 刷新项目列表，如果中间用户删除了项目，会自动移出项目列表
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
    // 重载项目
    * reload({ payload }, { put, select }) {
      Object.keys(payload.pkg.scripts || {})
        .forEach(command => commands.stopCmd({ projPath: payload.path, command }));
      // const { projects } = yield select(state => state.project);
      const reload = payload.reload + 1;
      const info = getProjectInfoByPath(payload.path);
      const project = { ...payload, ...info, start: false, reload };

      yield put({
        type: 'changeProjects',
        payload: project
      });

      yield put({
        type: 'task/initAddCommands',
        payload: project
      });
    },
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};