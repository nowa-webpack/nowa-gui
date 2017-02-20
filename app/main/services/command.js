const { spawn, spawnSync } = require('child_process');
const path = require('path');
const log = require('electron-log');
const npmRunPath = require('npm-run-path');
const isDev = require('electron-is-dev');
// const fs = require('fs-extra');

const { getWin } = require('./window');
const { APP_PATH, NOWA, TEMPLATES_DIR, NPM } = require('../constants');

const platform = process.platform;

// const NODE_EXEC = platform === 'win32' ? 'win/node.exe' : platform === 'darwin' ? 'mac/node' : 'linux/node';
const NODE_PATH = path.join(APP_PATH, 'nodes', 'node');


module.exports = {

  build(projectPath) {
    return spawn(NODE_PATH, [NOWA, 'build'], {
    // return spawn('node', [NOWA, 'build'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  start(projectPath) {
    return spawn(NODE_PATH, [NOWA, 'server', '-o'], {
    // return spawn('node', [NOWA, 'server', '-o'], {
    // return spawn(NOWA, ['server', '-o'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  lib(projectPath) {
    // return spawn(NOWA, ['lib'], {
    // return spawn('node', [NOWA, 'lib'], {
    return spawn(NODE_PATH, [NOWA, 'lib'], {
      cwd: projectPath,
      env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
    });
  },

  nodeInstall(options) {
    const targetPath = path.join(APP_PATH, 'task', 'install.js');
    try {
      // return spawn('node', [targetPath], {
      return spawn(NODE_PATH, [targetPath], {
        cwd: APP_PATH,
        execArgv: ['--harmony'],
        env: Object.assign(npmRunPath.env(), { params: JSON.stringify(options), FORCE_COLOR: 1 }),
      });
    } catch (err) {
      log.error(err);
      return null;
    }
  },

  installTemplate(name) {
    // const win = getWin();
    // const term = spawn(NODE_PATH, [NPM, 'install', name,
    return spawnSync(NODE_PATH, [NPM, 'install', name,
      '--prefix', TEMPLATES_DIR,
      '--registry=https://registry.npm.taobao.org',
      '-S',
      '--scripts-prepend-node-path=auto'], {
        cwd: APP_PATH,
        shell: true,
        env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
      });
    // console.log(term)
    // term.stdout.on('data', data => console.log(`${data}`))
    // term.stderr.on('data', data => {
    //   console.log(`${data}`)
    //   win.webContents.send('MAIN_ERR', `${data}`)
    // })
    // return term;
  }
};

