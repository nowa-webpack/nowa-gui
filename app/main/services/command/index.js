const { spawn, exec, execFile, fork } = require('child_process');
const { join, delimiter } = require('path');
const npmRunPath = require('npm-run-path');
const fs = require('fs-extra');
const uuid = require('uuid');
const fixPath = require('fix-path');

const { constants, isWin } = require('../is');

const { APP_PATH, NOWA_INSTALL_DIR } = constants; 

fixPath();
// const { APP_PATH, NOWA_PATH, NOWA_BIN_PATH, IS_WIN, NODE_PATH, NPM_PATH } = require('../constants');

// const systemSep = isWin ? ';' : ':';

const npmEnv = npmRunPath.env();
/*const pathEnv = [npmEnv.PATH, NOWA_BIN_PATH, NODE_PATH, NPM_PATH].filter(p => !!p).join(delimiter);
const env = Object.assign(npmEnv, {
  FORCE_COLOR: 1,
  Path: pathEnv
});*/

// fs.writeJsonSync(join(APP_PATH, 'env.text'), process.env)
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

 

  /*build(projectPath) {
    // return spawn(NODE_PATH, [NOWA_PATH, 'build'], {
    return spawn(NODE_PATH, [NPM_PATH, 'run', 'build', '--scripts-prepend-node-path=auto'], {
      cwd: projectPath,
      env,
    });
  },

  buildNowa(projectPath) {
    // return execFile(NPM_PATH, ['run', 'build'], {
    // return spawn(NODE_PATH, [NOWA_PATH, 'build'], {
    return spawn(NODE_PATH, [NPM_PATH, 'run', 'build', '--scripts-prepend-node-path=auto'], {
      cwd: projectPath,
      env,
    });
  },

  link(projectPath){
    const bins = fs.readdirSync('/usr/local/bin');
    bins.forEach(item => {
      spawn(NODE_PATH, [NPM_PATH, 'link', item], {
        cwd: projectPath,
        env,
      });
    });
  },

  start(projectPath) {

    const term = spawn(NODE_PATH, [NOWA_PATH, 'server'], {
      cwd: projectPath,
      env,
      detached: true
    });

    return term;
  },*/

  

/*  openEditor(projectPath, editor, basePath) {
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
  },*/

  
 
};

