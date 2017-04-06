import { ipcRenderer, remote } from 'electron';
// import osHomedir from 'os-homedir';
import { join, dirname } from 'path';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import glob from 'glob';
import gitConfig from 'git-config';
import Message from 'antd/lib/message';


import i18n from 'i18n';
import { delay, getPkgDependencies, readPkgJson } from 'gui-util';
import { NPM_MAP } from 'gui-const';
const { utils, command, templatesManager } = remote.getGlobal('services');

const writeFile = (source, target, data) => {
  try {
    const tpl = fs.readFileSync(source);
    let content;
    try {
      content = utils.ejsRender(tpl.toString(), data);
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
    officialTemplates: [],
    localTemplates: [],
    remoteTemplates: [],
    
    extendsProj: {},
    sltItem: {},
    overrideFiles: [],
    isGitEmptyFolder: false,

    showTemplateModal: false,
    showFormModal: false,
    editTemplate: {},
    templateModalTabType: 1,
    // term: null,
    // projPath: '',
    userAnswers: {},
    installOptions: {},
  },

  subscriptions: {
    setup({ dispatch }) {
      ipcRenderer.on('load-official-templates', (event, officialTemplates) => {
        dispatch({
          type: 'changeStatus',
          payload: {
            officialTemplates,
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
      // const { online } = yield select(state => state.layout);
      const manifest = templatesManager.getMainifest();

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

      templatesManager.setMainifest(manifest);

      yield put({
        type: 'changeStatus',
        payload: {
          officialTemplates: manifest.official || [],
          localTemplates: manifest.local,
          remoteTemplates: manifest.remote,
        }
      });

      // if (online) {
      //   yield put({
      //     type: 'fetchOnlineTemplates',
      //   });
      // }
    },
    fetchOnlineTemplates() {
      templatesManager.official.get();
      // application.getOfficalTemplates();
    },
    * addCustomRemoteTemplate({ payload: { item } }, { put, select }) {
      const { remoteTemplates } = yield select(state => state.init);

      remoteTemplates.push(item);
      console.log('new remoteTemplates', remoteTemplates);

      yield put({
        type: 'changeStatus',
        payload: {
          remoteTemplates: [...remoteTemplates],
        }
      });

      templatesManager.custom.add({ type: remote, item });

      // application.addCustomTemplates({
      //   type: 'remote',
      //   item,
      // });
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

      templatesManager.custom.update(item);


      // application.updateCustomTemplates(item);
    },
    * updateOfficialTemplate({ payload: { tempName, tag } }, { put, select }) {
      const { online } = yield select(state => state.layout);

      if (online) {
        console.time('fetch templates');
        // const officalTemplates = yield application.updateOfficalTemplate(tempName, tag);
        const officialTemplates = yield templatesManager.official.update(tempName, tag);
        console.timeEnd('fetch templates');
        console.log('update', officialTemplates );
        yield put({
          type: 'changeStatus',
          payload: {
            officialTemplates,
          }
        });
      } else {
        Message.info(i18n('OFFLINE!'));
      }
    },
    * selectTemplate({ payload: { type, item } }, { put }) {
      // const proj = application.loadConfig(join(item.path, 'proj.js'));
      const proj = utils.loadConfig(join(item.path, 'proj.js'));
      yield put({
        type: 'changeStatus',
        payload: {
          sltItem: item,
          extendsProj: proj
        }
      });
    },
    * setUserAnswers({ payload }, { put, select }) {
      const { extendsProj } = yield select(state => state.init);

      let answers = { ...payload };

      answers.npm = NPM_MAP[answers.registry];
      answers.template = '';

      const config = gitConfig.sync(join(answers.projPath, '.git', 'config')) || {};

      answers.repository = (config['remote "origin"'] || {}).url || '';

      if (extendsProj.answers) {
        answers = extendsProj.answers(answers, {});
      }

      yield put({
        type: 'changeStatus',
        payload: {
          userAnswers: answers,
        }
      });
    },
    * checkOverrideFiles(o, { put, select }) {
      const { sltItem, userAnswers } = yield select(state => state.init);
      const sourceDir = join(sltItem.path, 'proj');

      const overrideFiles = [];

      yield glob.sync('**', {
        cwd: sourceDir,
        nodir: true,
        dot: true
      }).forEach((source) => {
        const target = join(userAnswers.projPath, source.replace(/__(\w+)__/g, (match, offset) => userAnswers[offset]));
        // console.log(source, target)
        if (fs.existsSync(target)) {
          overrideFiles.push(source);
        }
      });

      if (overrideFiles.length > 0) {
        yield put({
          type: 'changeStatus',
          payload: {
            overrideFiles,
            showFormModal: true,
          }
        });
      // } else if (fs.existsSync(join(sltItem.path, '.git'))) {
      //   yield put({
      //     type: 'changeStatus',
      //     payload: { isGitEmptyFolder: true }
      //   });
      //   yield put({
      //     type: 'copyTemplateToTarget',
      //   });
      } else {
        if (fs.existsSync(join(userAnswers.projPath, '.git'))) {
          yield put({
            type: 'changeStatus',
            payload: { isGitEmptyFolder: true }
          });
        }
        yield put({
          type: 'copyTemplateToTarget',
        });
      }
    },
    * copyTemplateToTarget(o, { put, select }) {
      const { extendsProj, sltItem, userAnswers } = yield select(state => state.init);
      const sourceDir = join(sltItem.path, 'proj');

      glob.sync('**', {
        cwd: sourceDir,
        nodir: true,
        dot: true
      }).forEach((source) => {
        if (extendsProj.filter && extendsProj.filter(source, userAnswers) === false) {
          return false;
        }

        const target = join(userAnswers.projPath, source.replace(/__(\w+)__/g, (match, offset) => userAnswers[offset]));

        mkdirp.sync(dirname(target));

        source = join(sourceDir, source);
        // console.log(source, target)

        writeFile(source, target, userAnswers);
      });

      // const pkgJson = fs.readJsonSync(join(userAnswers.projPath, 'package.json'));

      const pkgs = getPkgDependencies(readPkgJson(userAnswers.projPath));
      

      const installOptions = {
        root: userAnswers.projPath,
        registry: userAnswers.registry,
        // targetDir: userAnswers.projPath,
        // storeDir: join(userAnswers.projPath, '.npminstall'),
        // cacheDir: null,
        // timeout: 5 * 60000,
        pkgs,
      };

      yield put({
        type: 'changeStatus',
        payload: {
          installOptions,
        }
      });

      yield put({
        type: 'retryInstall',
      });
    },
    * finishedInstall({ payload }, { put, select }) {
      const { installOptions } = yield select(state => state.init);
      
      const filePath = installOptions.root;

      yield delay(1500);

      yield put({
        type: 'project/importProj',
        payload: {
          filePath,
          needInstall: false,
          projectRegistry: installOptions.registry
        }
      });

      yield put({
        type: 'changeStatus',
        payload: {
          installOptions: {}
        }
      });
      
    },
    * retryInstall(o, { put, select }) {
      const { installOptions } = yield select(state => state.init);
      console.log('installing', installOptions);
      command.progressInstall({
        options: installOptions,
        sender: 'init',
        isTruthPercent: true,
        endCb: null,
      });
    },

   
  },

  reducers: {
    changeStatus(state, action) {
      return { ...state, ...action.payload };
    },
  },
};



