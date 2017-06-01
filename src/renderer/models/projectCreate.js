import glob from 'glob';
import mkdirp from 'mkdirp';
import { remote } from 'electron';
import gitConfig from 'git-config';
import { join, dirname, basename } from 'path';
import { existsSync } from 'fs-extra';

import i18n from 'i18n-renderer-nowa';
import { request } from 'shared-nowa';
import { IMPORT_STEP1_PAGE, IMPORT_STEP2_PAGE } from 'const-renderer-nowa';
import {
  msgError, msgSuccess, msgInfo, writeToFile, getMergedDependencies, readPkgJson
} from 'util-renderer-nowa';

const { commands } = remote.getGlobal('services');

export default {

  namespace: 'projectCreate',

  state: {
    processStep: 0,  // 新建项目步骤
    selectBoilerplate: {},  // 选中的模板
    selectExtendsProj: {},  // 选中的模板中的proj.js 内容，作为提问模板,

    initSetting: {}, // 初始化项目的配置

    overwriteFiles: [], // 需要覆盖的文件
    showOverwriteModal: false, // 显示覆盖说明模态框

  },

  effects: {
    * folderImport({ payload }, { put, select }) {
      try {
        let projPath = payload.projPath;

        if (!projPath) {
          const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
          projPath = importPath[0];
        }

        const { projects } = yield select(state => state.project);

        const isExisted = projects.some(n => n.path === projPath || n.name === basename(projPath));

        if (isExisted) {
          msgError(i18n('msg.existed'));
          return false;
        }

        if (!existsSync(join(projPath, 'package.json'))) {
          msgError(i18n('msg.invalidProject'));
          return false;
        }

        let needInstall = false;

        if (!existsSync(join(projPath, 'node_modules'))) {
          needInstall = true;
        } else {
          const pkgs = getMergedDependencies(readPkgJson(projPath));
          const pkgsFilter = pkgs.some(item => !existsSync(join(projPath, 'node_modules', item.name)));
          if (pkgsFilter) {
            needInstall = true;
          }
        }

        console.log('needInstall', needInstall);
        if (needInstall) {
          yield put({
            type: 'changeStatus',
            payload: {
              initSetting: { projPath }
            }
          });
          yield put({
            type: 'layout/showPage',
            payload: { toPage: IMPORT_STEP1_PAGE }
          });
        } else {
          yield put({
            type: 'project/add',
            payload: { projPath }
          });
        }
      } catch (e) {
        console.log(e);
      }
      return true;
    },
    * checkRegistry({ payload: { registry } }, { put, select }) {
      const { initSetting } = yield select(state => state.projectCreate);
      const { registryList } = yield select(state => state.setting);

      if (!registryList.includes(registry)) {
        const { err } = yield request(registry);
        if (err) {
          msgError(i18n('msg.invalidRegistry'));
          return false;
        }
      }

      initSetting.registry = registry;

      yield put({
        type: 'changeStatus',
        payload: {
          initSetting: { ...initSetting }
        }
      });

      yield put({
        type: 'startInstallModules',
        payload: {
          isRetry: false
        }
      });
    },
    * selectBoilerplate({ payload: { item, type } }, { put }) {
      const projPath = join(item.path, 'proj.js');
      let proj = {};

      if (existsSync(projPath)) {
        proj = remote.require(projPath);
      }
      console.log('select', type, item, proj);
      yield put({
        type: 'changeStatus',
        payload: {
          selectBoilerplate: item,
          selectExtendsProj: proj,
          processStep: 1,
        }
      });
    },
    * checkSetting({ payload }, { put, select }) {
      const { online } = yield select(state => state.layout);

      if (!online) {
        console.log(i18n('project.new.networkTip'));
        msgError(i18n('project.new.networkTip'), 0);
        return false;
      }

      const { projects } = yield select(state => state.project);
      const filter = projects.some(n => n.path === payload.projPath || n.name === payload.name);

      if (filter) {
        msgError(i18n('msg.existed'));
        return false;
      }

      const { registryList } = yield select(state => state.setting);

      if (!registryList.includes(payload.registry)) {
        const { err } = yield request(payload.registry);
        if (err) {
          msgError(i18n('msg.invalidRegistry'));
          return false;
        }
      }

      const { selectExtendsProj, selectBoilerplate } = yield select(state => state.projectCreate);

      payload.npm = payload.registry;
      payload.template = selectBoilerplate.path.replace(/\\/g, '\\\\');

      const gitPath = join(payload.projPath, '.git', 'config');

      if (existsSync(gitPath)) {
        const config = gitConfig.sync(gitPath) || {};
        console.log('config', config);
        payload.repository = (config['remote "origin"'] || {}).url || '';
      }

      if (selectExtendsProj.answers) {
        payload = selectExtendsProj.answers(payload, {});
      }

      yield put({
        type: 'changeStatus',
        payload: {
          initSetting: payload
        }
      });

      console.log('initSetting', payload);

      if (existsSync(payload.projPath)) {
        yield put({
          type: 'checkOverwiteFiles',
        });
      } else {
        yield put({
          type: 'copyFilesToTarget',
        });
      }

      return;
    },
    * checkOverwiteFiles(o, { put, select }) {
      console.log('checkOverwiteFiles');
      const { selectBoilerplate, initSetting } = yield select(state => state.projectCreate);
      const sourceDir = join(selectBoilerplate.path, 'proj');

      const overwriteFiles = [];

      yield glob.sync('**', {
        cwd: sourceDir,
        nodir: true,
        dot: true
      }).forEach((source) => {
        const subDir = source.replace(/__(\w+)__/g, (match, offset) => initSetting[offset]);
        const target = join(initSetting.projPath, subDir);
        if (existsSync(target)) {
          overwriteFiles.push(source);
        }
      });

      if (overwriteFiles.length > 0) {
        yield put({
          type: 'changeStatus',
          payload: {
            overwriteFiles,
            showOverwriteModal: true,
          }
        });
      } else {
        yield put({
          type: 'copyFilesToTarget',
        });
      }
    },
    * copyFilesToTarget(o, { put, select }) {
      console.log('copyFilesToTarget');

      yield put({
        type: 'changeStatus',
        payload: { showOverwriteModal: false }
      });

      const {
        selectBoilerplate, initSetting, selectExtendsProj
      } = yield select(state => state.projectCreate);
      const sourceDir = join(selectBoilerplate.path, 'proj');

      glob.sync('**', {
        cwd: sourceDir,
        nodir: true,
        dot: true
      }).forEach((source) => {
        if (selectExtendsProj.filter && selectExtendsProj.filter(source, initSetting) === false) {
          return false;
        }
        const subDir = source.replace(/__(\w+)__/g, (match, offset) => initSetting[offset]);

        const target = join(initSetting.projPath, subDir);

        mkdirp.sync(dirname(target));

        source = join(sourceDir, source);

        writeToFile(source, target, initSetting);
      });

      yield put({
        type: 'startInstallModules',
        payload: { isRetry: false },
      });
    },
    * startInstallModules({ payload: { isRetry } }, { put, select }) {
      console.log('startInstallModules');
      const { initSetting } = yield select(state => state.projectCreate);

      const pkgs = getMergedDependencies(readPkgJson(initSetting.projPath));

      const opt = {
        root: initSetting.projPath,
        registry: initSetting.registry,
        pkgs,
      };

      // 防止修改backpage
      if (!isRetry) {
        yield put({
          type: 'layout/showPage',
          payload: { toPage: IMPORT_STEP2_PAGE }
        });
      }
      const { err } = yield commands.install({
        opt,
        fake: false,
        sender: 'import',
      });

      if (!err) {
        yield put({
          type: 'project/add',
          payload: initSetting
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
