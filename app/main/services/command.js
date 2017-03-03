const { spawn, exec } = require('child_process');
const path = require('path');
const log = require('electron-log');
const npmRunPath = require('npm-run-path');
const isDev = require('electron-is-dev');

const { getWin } = require('./window');
const { APP_PATH, NOWA, TEMPLATES_DIR, NPM } = require('../constants');

const NODE_PATH = process.platform === 'win32' 
  ? path.join(APP_PATH, 'nodes', 'node.exe')
  : path.join(APP_PATH, 'nodes', 'node');

const isWin = process.platform === 'win32';

module.exports = {

  build(projectPath) {
    return spawn(NODE_PATH, [NOWA, 'build'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  start(projectPath) {
    return spawn(NODE_PATH, [NOWA, 'server', '-o'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  lib(projectPath) {
    return spawn(NODE_PATH, [NOWA, 'lib'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  openSublime(projectPath, editor, basePath) {
    let editorPath = '';

    if (editor === 'Sublime') {
      editorPath = path.join(basePath, isWin ? 'subl.exe' : '/Contents/SharedSupport/bin/subl')
    }

    if (editor === 'VScode') {
      editorPath = path.join(basePath, isWin ? 'bin/cmd.exe' : '/Contents/Resources/app/bin/code')
    }

    return spawn(editorPath,
      ['./'], {
        cwd: projectPath,
      });
  },

  nodeInstall(options) {
    const targetPath = path.join(APP_PATH, 'task', 'install.js');
    // try {
      return spawn(NODE_PATH, [targetPath], {
        cwd: APP_PATH,
        execArgv: ['--harmony'],
        env: Object.assign(npmRunPath.env(), { params: JSON.stringify(options), FORCE_COLOR: 1 }),
      });
    // } catch (err) {
    //   log.error(err);
    //   console.log(err)
    //   return null;
    // }
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

