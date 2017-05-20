import { remote, ipcRenderer } from 'electron';
// import Message from 'antd/lib/message';
import { join } from 'path';

import i18n from 'i18n-renderer-nowa';
import { delay } from 'shared-nowa';
import {
  readABCJson, writeABCJson,
  readPkgJson, writePkgJson,
  isNowaProject, isAliProject, getPkgDependencies,
  msgError, msgSuccess,
} from 'util-renderer-nowa';
import { getLocalProjects, setLocalProjects } from 'store-renderer-nowa';
import { REGISTRY_MAP, NPM_MAP, URL_MATCH, PROJECT_PAGE, SETTING_PAGE } from 'const-renderer-nowa';

const { commands, tray } = remote.getGlobal('services');
// const config = remote.getGlobal('config');

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
      loadingStep: 0,
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

      // dispatch({
      //   type: 'task/initCommands',
      //   payload: {
      //     projects,
      //   }
      // });
    },
  },

  effects: {
    * add({ payload: { projPath } }, { select, put }) {
      console.log('add project');
      // yield put({
      //   type: 'layout/showPage',
      //   payload: { toPage: PROJECT_PAGE }
      // });
    }
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
