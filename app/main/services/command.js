const { spawn, exec, execFile } = require('child_process');
const { join } = require('path');
const npmRunPath = require('npm-run-path');
const fs = require('fs-extra');
// const log = require('electron-log');

const { APP_PATH, NOWA_PATH, NOWA_BIN_PATH, IS_WIN, NODE_PATH, NPM_PATH } = require('../constants');

const systemSep = IS_WIN ? ';' : ':';

const npmEnv = npmRunPath.env();
const pathEnv = [npmEnv.PATH, NOWA_BIN_PATH, NODE_PATH, NPM_PATH].filter(p => !!p).join(systemSep);
const env = Object.assign(npmEnv, {
  FORCE_COLOR: 1,
  PATH: pathEnv
});

// console.log(env)
// fs.writeJsonSync(join(APP_PATH, 'env.json'), env)

module.exports = {

  // test(){
  //   const term = exec('npm bin -g', {env})
  //   term.stdout.on('data', (data) => fs.writeFileSync(join(APP_PATH, 'env.text'), data.toString()));
  //   term.stderr.on('data', (data) => fs.writeFileSync(join(APP_PATH, 'env.text'), data.toString()));
  // },

  build(projectPath) {
    // return spawn(NODE_PATH, [NOWA_PATH, 'build'], {
    return spawn(NODE_PATH, [NPM_PATH, 'run', 'build', '--scripts-prepend-node-path=auto'], {
      cwd: projectPath,
      env,
    });
  },

  buildNowa(projectPath) {
    return spawn(NODE_PATH, [NOWA_PATH, 'build'], {
    // return spawn(NODE_PATH, [NPM_PATH, 'run', 'build', '--scripts-prepend-node-path=auto'], {
      cwd: projectPath,
      env,
    });
  },

  start(projectPath) {
    // return spawn(NODE_PATH, [NPM_PATH, 'start', '--scripts-prepend-node-path=auto'], {
    return spawn(NODE_PATH, [NOWA_PATH, 'server'], {
      cwd: projectPath,
      env,
      detached: true
    });
  },

  lib(projectPath) {
    return spawn(NODE_PATH, [NOWA_PATH, 'lib'], {
      cwd: projectPath,
      env,
    });
  },

  openEditor(projectPath, editor, basePath) {
    let editorPath = '';

    if (editor === 'Sublime') {
      editorPath = join(basePath, IS_WIN ? 'subl.exe' : '/Contents/SharedSupport/bin/subl');
    }

    if (editor === 'VScode') {
      editorPath = join(basePath, IS_WIN ? 'bin/code.cmd' : '/Contents/Resources/app/bin/code');
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
      env: Object.assign(env, { params: JSON.stringify(options) }),
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

