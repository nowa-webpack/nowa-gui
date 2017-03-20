const { spawn, exec, execFile, fork } = require('child_process');
const { join, delimiter } = require('path');
const npmRunPath = require('npm-run-path');
const fs = require('fs-extra');
// const uuid = require('uuid');
const fixPath = require('fix-path');

const { constants, isWin } = require('../is');

const { APP_PATH, NPM_PATH, NOWA_BIN_PATH, NODE_PATH } = constants; 

fixPath();

const npmEnv = npmRunPath.env();
const pathEnv = [process.env.Path, npmEnv.PATH, NOWA_BIN_PATH, NPM_PATH, NODE_PATH].filter(p => !!p).join(delimiter);
const env = Object.assign(npmEnv, {
  FORCE_COLOR: 1,
  // PATH: pathEnv, //mac
  // Path:  pathEnv, //win
});

if (isWin) {
  env.Path = pathEnv;
} else {
  env.PATH = pathEnv;
}

fs.writeJsonSync(join(APP_PATH, 'env.text'), { prv: process.env, env, npmEnv})
module.exports = {

  installModules(options) {
    const targetPath = join(APP_PATH, 'task', 'install.js');
    const term = fork(targetPath, {
      cwd: APP_PATH,
      silent: true,
      // execArgv: ['--harmony'],
      env: Object.assign(npmEnv, { params: JSON.stringify(options), FORCE_COLOR: 1, }),
    });
    return term;
  },

  openEditor(projectPath, editor, basePath) {
    let editorPath = '';

    if (editor === 'Sublime') {
      editorPath = join(basePath, isWin ? 'subl.exe' : '/Contents/SharedSupport/bin/subl');
    }

    if (editor === 'VScode') {
      editorPath = join(basePath, isWin ? 'bin/code.cmd' : '/Contents/Resources/app/bin/code');
    }

    return spawn(editorPath,
      ['./'], {
        cwd: projectPath,
      });
  },

  build(projectPath) {
    return fork(NPM_PATH, ['run', 'build', '--scripts-prepend-node-path=auto'], {
      silent: true,
      cwd: projectPath,
      env,
    });
  },

  start(projectPath) {
    return fork(NPM_PATH, ['run', 'start', '--scripts-prepend-node-path=auto'], {
      silent: true,
      cwd: projectPath,
      env,
    });
  },
 
};

