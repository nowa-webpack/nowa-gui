const { spawn, fork } = require('child_process');
const { join } = require('path');
const fs = require('fs-extra');
const uuid = require('uuid');
const { tmpdir } = require('os');

const task = require('../task');
const kill = require('./kill');
const modules = require('./modules');
const env = require('./env');
const { getWin } = require('../windowManager');
const { constants: { NPM_PATH }, isWin } = require('../is');


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
      win.webContents.send('task-ouput', {
        name,
        log,
        type,
      });
    });

    term.stderr.on('data', (data) => {
      const log = task.writeLog(type, name, data.toString());
      win.webContents.send('task-ouput', {
        name,
        log,
        type,
      });
    });

    term.on('exit', (code) => {
      task.clearTerm(type, name);
      console.log('exit', type, code);

      win.webContents.send('task-end', {
        name,
        type,
        finished: code === 0
      });
      

      /*if ((!code && typeof code !== 'undefined' && code !== 0) || type === 'start') {
        win.webContents.send('task-stopped', {
          name,
          type,
        });
      } else {
        win.webContents.send('task-finished', {
          name,
          type,
          success: code === 0
        });
      }*/
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

