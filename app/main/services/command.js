const { spawn, exec } = require('child_process');
const { join } = require('path');
const npmRunPath = require('npm-run-path');
// const log = require('electron-log');
// const isDev = require('electron-is-dev');

const { APP_PATH, NOWA_PATH, IS_WIN, NODE_PATH } = require('../constants');


module.exports = {

  build(projectPath) {
    return spawn(NODE_PATH, [NOWA_PATH, 'build'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  start(projectPath) {
    return spawn(NODE_PATH, [NOWA_PATH, 'server', '-o'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  lib(projectPath) {
    return spawn(NODE_PATH, [NOWA_PATH, 'lib'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  openEditor(projectPath, editor, basePath) {
    let editorPath = '';

    if (editor === 'Sublime') {
      editorPath = join(basePath, IS_WIN ? 'subl.exe' : '/Contents/SharedSupport/bin/subl')
    }

    if (editor === 'VScode') {
      editorPath = join(basePath, IS_WIN ? 'bin/code.exe' : '/Contents/Resources/app/bin/code')
    }

    return spawn(editorPath,
      ['./'], {
        cwd: projectPath,
      });
  },

  nodeInstall(options) {
    const targetPath = join(APP_PATH, 'task', 'install.js');
    return spawn(NODE_PATH, [targetPath], {
      cwd: APP_PATH,
      execArgv: ['--harmony'],
      env: Object.assign(npmRunPath.env(), { params: JSON.stringify(options), FORCE_COLOR: 1 }),
    });
  },

  /*installTemplate(name) {
    return spawnSync(NODE_PATH, [NPM, 'install', name,
      '--prefix', TEMPLATES_DIR,
      '--registry=https://registry.npm.taobao.org',
      '-S',
      '--scripts-prepend-node-path=auto'], {
        cwd: APP_PATH,
        shell: true,
        env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
      });
  }*/
};

