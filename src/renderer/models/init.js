import { ipcRenderer, remote } from 'electron';
import osHomedir from 'os-homedir';
import { join, dirname } from 'path';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import glob from 'glob';
import Message from 'antd/lib/message';

import i18n from 'i18n';
import { delay } from 'gui-util';

const { application, command } = remote.getGlobal('services');
const TEMPLATES_DIR = join(osHomedir(), '.nowa', 'templates');

const writeFile = (source, target, data) => {
  try {
    const tpl = fs.readFileSync(source);
    let content;
    try {
      content = application.ejsRender(tpl.toString(), data);
    } catch (e) {
      content = tpl;
    }
    fs.writeFileSync(target, content);
  } catch (e) {
    console.error(e);
  }
};


export default {

  namespace: 'init',

  state: {
    officalTemplates: [],
    localTemplates: [],
    remoteTemplates: [],
    // loading: true,
    // officalLoading: false,
    // sltTemp: '',
    // sltTag: '',
    // basePath: join(osHomedir(), 'NowaProject'),
    extendsProj: {},
    sltItem: {},

    showTemplateModal: false,
    editTemplate: {},
    templateModalTabType: 1,
    term: null,
    projPath: '',
    installOptions: {},
  },

  subscriptions: {
    setup({ dispatch }) {
      ipcRenderer.on('load-offical-templates', (event, officalTemplates) => {
        dispatch({
          type: 'changeStatus',
          payload: {
            officalTemplates,
            // officalLoading: false
          }
        });
      }).on('load-local-templates', (event, localTemplates) => {
        dispatch({
          type: 'changeStatus',
          payload: {
            localTemplates,
          }
        });
      }).on('load-remote-templates', (event, remoteTemplates) => {
        dispatch({
          type: 'changeStatus',
          payload: {
            remoteTemplates,
          }
        });
      });
    },
  },

  effects: {
    * fetchAllTemplates(o, { select, put }) {
      const { online } = yield select(state => state.layout);
      const manifest = application.getMainifest();

      if (manifest.local) {
        manifest.local.map((item) => {
          item.disable = !fs.existsSync(item.path);
          return item;
        });
      } else {
        manifest.local = [];
      }

      if (manifest.remote) {
        manifest.remote.map((item) => {
          item.disable = item.path ? !fs.existsSync(item.path) : true;
          return item;
        });
      } else {
        manifest.remote = [];
      }

      console.log('fetchAllTemplates', manifest);

      application.setMainifest(manifest);

      yield put({
        type: 'changeStatus',
        payload: {
          officalTemplates: manifest.offical || [],
          localTemplates: manifest.local,
          remoteTemplates: manifest.remote,
        }
      });

      if (online) {
        yield put({
          type: 'fetchOnlineTemplates',
        });
      }
    },
    fetchOnlineTemplates() {
      application.getOfficalTemplates();
    },
    * addCustomRemoteTemplate({ payload: { item } }, { put, select }) {
      const { remoteTemplates } = yield select(state => state.init);

      remoteTemplates.push(item);
      console.log(remoteTemplates);

      yield put({
        type: 'changeStatus',
        payload: {
          remoteTemplates: [...remoteTemplates],
        }
      });

      application.addCustomTemplates({
        type: 'remote',
        item,
      });
    },
    * updateCustomRemoteTemplates({ payload: { item } }, { put, select }) {
      const { remoteTemplates } = yield select(state => state.init);
      item.loading = true;
      remoteTemplates.map((_t) => _t.id === item.id ? item : _t);

      yield put({
        type: 'changeStatus',
        payload: {
          remoteTemplates: [...remoteTemplates]
        }
      });

      application.updateCustomTemplates(item);
    },
    * updateOfficalTemplate({ payload: { tempName, tag } }, { put, select }) {
      const { online } = yield select(state => state.layout);

      if (online) {
        console.time('fetch templates');
        const officalTemplates = yield application.updateOfficalTemplate(tempName, tag);
        console.timeEnd('fetch templates');
        yield put({
          type: 'changeStatus',
          payload: {
            officalTemplates,
          }
        });
      } else {
        Message.info(i18n('OFFLINE!'));
      }
    },
    * selectTemplate({ payload: { type, item } }, { put }) {
      const proj = application.loadConfig(join(item.path, 'proj.js'));
      yield put({
        type: 'changeStatus',
        payload: {
          sltItem: item,
          extendsProj: proj
        }
      });
    },
    * getAnswserArgs({ payload }, { put, select }) {
      const { extendsProj, sltItem } = yield select(state => state.init);

      let answers = { ...payload };

      answers.npm = 'npm';
      answers.template = '';

      if (extendsProj.answers) {
        answers = extendsProj.answers(answers, {});
      }

      const sourceDir = join(sltItem.path, 'proj');

      glob.sync('**', {
        cwd: sourceDir,
        nodir: true,
        dot: true
      }).forEach((source) => {
        if (extendsProj.filter && extendsProj.filter(source, answers) === false) {
          return false;
        }

        const target = join(answers.projPath, source.replace(/__(\w+)__/g, (match, offset) => answers[offset]));

        mkdirp.sync(dirname(target));

        source = join(sourceDir, source);

        writeFile(source, target, answers);
      });

      const pkgJson = fs.readJsonSync(join(answers.projPath, 'package.json'));

      const pkgs = [];

      for (let name in pkgJson.dependencies) {
        pkgs.push({
          name,
          version: pkgJson.dependencies[name]
        });
      }

      const installOptions = {
        root: answers.projPath,
        registry: answers.registry,
        targetDir: answers.projPath,
        storeDir: join(answers.projPath, '.npminstall'),
        cacheDir: null,
        timeout: 5 * 60000,
        pkgs,
      };

      yield put({
        type: 'changeStatus',
        payload: {
          installOptions,
          projPath: answers.projPath, 
        }
      });

      yield put({
        type: 'retryInstall',
        payload: {
          installOptions,
          projPath: answers.projPath, 
        }
      });
    },
    * finishedInstall({ payload }, { put, select }) {
      const { term, projPath } = yield select(state => state.init);
      if (term) {
        term.kill();
      }

      yield delay(1000);

      yield put({
        type: 'project/importProj',
        payload: {
          filePath: projPath
        }
      });

      yield delay(1000);

      yield put({
        type: 'changeStatus',
        payload: {
          term: null,
          installOptions: {}
        }
      });
    },
    * retryInstall(o, { put, select }) {
      const { installOptions } = yield select(state => state.init);
      const term = yield command.nodeInstall(installOptions);
      console.log('installing');
      yield put({
        type: 'changeStatus',
        payload: {
          term,
        }
      });
    },
   
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
