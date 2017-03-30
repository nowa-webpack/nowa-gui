const { spawn, fork } = require('child_process');
const { join, delimiter } = require('path');
const npmRunPath = require('npm-run-path');
const fs = require('fs-extra');
const uuid = require('uuid');
const fixPath = require('fix-path');
const { tmpdir } = require('os');

const { constants, isWin } = require('../is');
const { getWin } = require('../windowManager');
const task = require('../task');
const kill = require('./kill');
const modules = require('./modules');

const { APP_PATH, NPM_PATH, BIN_PATH, NODE_PATH } = constants; 

fixPath();

const npmEnv = npmRunPath.env();
const pathEnv = [process.env.Path, npmEnv.PATH, BIN_PATH, NODE_PATH]
  .filter(p => !!p)
  .join(delimiter);
const env = Object.assign(npmEnv, {
  FORCE_COLOR: 1,
});

if (isWin) {
  env.Path = pathEnv;
} else {
  env.PATH = pathEnv;
}

// fs.writeJsonSync(join(APP_PATH, 'env.text'), { prv: process.env, env, npmEnv});
const exportFunc = {

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

  exec({ name, type }) {
    const win = getWin();
    const uid = uuid.v4();
    console.log('exec', type, name);
    const term = fork(NPM_PATH, ['run', type, '--scripts-prepend-node-path=auto'], {
      silent: true,
      cwd: name,
      env: Object.assign(env, { NOWA_UID: uid }),
      // detached: true
    });
    task.setTask(type, name, {
      term,
      uid
    });

    term.stdout.on('data', (data) => {
      const log = task.writeLog(type, name, data.toString());
      // pubsub.publish('task-ouput', {
      win.webContents.send('task-ouput', {
        name,
        log,
        type,
      });
    });

    term.stderr.on('data', (data) => {
      const log = task.writeLog(type, name, data.toString());
      // pubsub.publish('task-ouput', {
      win.webContents.send('task-ouput', {
        name,
        log,
        type,
      });
    });

    term.on('exit', (code) => {
      // global.cmd[type][name].term = null;
      task.clearTerm(type, name);
      console.log('exit', code);
      if ((!code && typeof code !== 'undefined' && code !== 0) || type === 'start') {
        // pubsub.publish('task-stopped', {
        win.webContents.send('task-stopped', {
          name,
          type,
        });
      } else {
        // pubsub.publish('task-finished', {
        win.webContents.send('task-finished', {
          name,
          type,
          success: code === 0
        });
      }
    });
  },

  stop({ name, type }) {
    const t = task.getTask(type, name);
    if (t.term) {
      // t.term.kill();
      if (isWin) {
        kill(t.term.pid);
      } else {
        t.term.kill();
      }
      if (type === 'start') {
        const uidPath = join(tmpdir(), `.nowa-server-${t.uid}.json`);
        fs.removeSync(uidPath);
      }
    }
  },

  clearLog({ name, type }) {
    task.clearLog(type, name);
  },
  
};

module.exports = Object.assign(modules, exportFunc);

