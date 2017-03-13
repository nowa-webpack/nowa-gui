import { ipcRenderer, remote } from 'electron';
import osHomedir from 'os-homedir';
import { join, dirname } from 'path';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import glob from 'glob';
import Message from 'antd/lib/message';

import i18n from 'i18n';
import { delay } from 'gui-util';
import { getLocalCustomTemps, getRemoteTemps, setRemoteTemps } from 'gui-local';

const { application, command } = remote.getGlobal('services');
const { config } = remote.getGlobal('configs');
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
    loading: false,
    sltTemp: '',
    sltTag: '',
    basePath: join(osHomedir(), 'NowaProject'),
    extendsProj: {},
    term: null,
    projPath: '',
    installOptions: {},
    showTemplateModal: false,
  },

  subscriptions: {
    setup({ dispatch }) {
      ipcRenderer.on('load-offical-templates', (event, officalTemplates) => {
        dispatch({
          type: 'changeStatus',
          payload: {
            officalTemplates,
            loading: false
          }
        });
      }).on('load-local-templates', (event, localTemplates) => {
        dispatch({
          type: 'changeStatus',
          payload: {
            localTemplates,
            loading: false
          }
        });
      }).on('load-remote-templates', (event, remoteTemplates) => {
        /*const remoteTemps = getRemoteTemps();
        const filter = remoteTemps.filter((item) => {
          const _filter = remoteTemplates.filter(_item => _item.name === item.name);

          return _filter.length > 0;
        });
        setRemoteTemps(filter);*/
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
      console.log(manifest)
      yield put({
        type: 'changeStatus',
        payload: {
          officalTemplates: manifest.offical || [],
          localTemplates: manifest.local || [],
          remoteTemplates: manifest.remote || [],
        }
      });

      if (online) {
        yield put({
          type: 'fetchOnlineTemplates',
        });
      }
    },
    fetchOnlineTemplates() {
      // const remoteTemps = getRemoteTemps();
      application.getOfficalTemplates();
      // application.getCustomRemoteTemplates(remoteTemps);
    },


    fetchCustomRemoteTemplates({ payload: { remoteTemps } }) {
      application.getCustomRemoteTemplates(remoteTemps);
    },
    fetchCustomLocalTemplates({ payload: { localTemps } }) {
      application.getCustomLocalTemplates(localTemps);
    },
    * updateTemplate({ payload: { sltTemp, tag } }, { put, select }) {
      const { online } = yield select(state => state.layout);
      yield put({
        type: 'changeStatus',
        payload: {
          loading: true
        }
      });

      if (online) {
        console.time('fetch templates');
        const templates = yield application.updateTemplate(sltTemp.name, tag);
        console.timeEnd('fetch templates');
        yield put({
          type: 'changeStatus',
          payload: {
            templates,
            loading: false
          }
        });
      } else {
        i18n('OFFLINE!');
      }
    },
    * selectBaseProjectPath({ payload: { isInit } }, { put }) {
      try {
        let basePath = osHomedir();
        if (!isInit) {
          const importPath = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
          basePath = importPath[0];
        }

        yield put({
          type: 'changeStatus',
          payload: {
            basePath
          }
        });

      } catch (err) {
      }
    },
    * selectTemplate({ payload }, { put }) {
      const { sltTemp, sltTag } = payload;
      const name = `${sltTemp.name}-${sltTag}`;
      const filePath = join(TEMPLATES_DIR, name);
      
      if (fs.existsSync(filePath)) {
        const proj = application.loadConfig(join(filePath, 'proj.js'));
        yield put({
          type: 'changeStatus',
          payload: {
            ...payload,
            extendsProj: proj
          }
        });
      } else {
        Message.error(i18n('msg.templateErr'), 3);
      }
    },
    * getAnswserArgs({ payload }, { put, select }) {
      const { extendsProj, sltTemp, sltTag } = yield select(state => state.init);

      let answers = payload;

      answers.npm = 'npm';
      answers.template = '';

      if (extendsProj.answers) {
        answers = extendsProj.answers(answers, {});
      }

      const name = `${sltTemp.name}-${sltTag}`;

      const sourceDir = join(TEMPLATES_DIR, name, 'package', 'proj');

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

      /*const term = yield command.nodeInstall(installOptions);
      console.log('installing', term);

      yield put({
        type: 'changeStatus',
        payload: {
          term,
          projPath: answers.projPath,
          installOptions
        }
      });*/
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
    * testTemplate({ payload }) {
      // const { sltTemp } = payload;
      config.setTemplateVersion(payload.name, '0.0.1');
      // config.clear();
    }
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
