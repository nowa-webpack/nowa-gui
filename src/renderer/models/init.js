import { ipcRenderer, remote } from 'electron';
import osHomedir from 'os-homedir';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import glob from 'glob';
import Message from 'antd/lib/message';
import { join, dirname } from 'path';

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

const delay = n => new Promise(resolve => setTimeout(resolve, n));


export default {

  namespace: 'init',

  state: {
    templates: [],
    loading: true,
    sltTemp: '',
    sltTag: '',
    basePath: join(osHomedir(), 'NowaProject'),
    extendsProj: {},
    term: null,
    projPath: '',
    installOptions: {}
  },

  subscriptions: {
    setup({ dispatch }) {
      ipcRenderer.on('loadingTemplates', (event, data) => {
        dispatch({
          type: 'changeStatus',
          payload: {
            templates: data,
            loading: false
          }
        });
      });

      const templates = application.getTemplates();

      if (templates.length) {
        dispatch({
          type: 'changeStatus',
          payload: {
            templates,
            loading: false
          }
        });
      } else {
        application.fetchTemplates(console);
      }
    },
  },

  effects: {
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
      const filePath = join(TEMPLATES_DIR, name, 'package');
      
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
        Message.error('Template Files haven\'t been downloaded. Please try later.', 3);
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
    * updateTemplate({ payload: { sltTemp, tag } }, { put, select }) {
      yield put({
        type: 'changeStatus',
        payload: {
          loading: true
        }
      });

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
    },
    * retryInstall({}, { put, select }) {
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
    * testTemplate({ payload }, { }) {
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
