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
const { constants: { NPM_PATH }, isWin, isMac } = require('../is');
const iconv = require('iconv-lite');

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

    const senderData = (data) => {
      // const log = task.writeLog(type, name, data.toString());
      const log = task.writeLog(type, name, iconv.decode(data, 'gb2312'));
      win.webContents.send('task-ouput', {
        name,
        log,
        type,
      });
    };

    term.stdout.on('data', senderData);
    term.stderr.on('data', senderData);

    // term.stderr.on('data', (data) => {
    //   const log = task.writeLog(type, name, data.toString());
    //   win.webContents.send('task-ouput', {
    //     name,
    //     log,
    //     type,
    //   });
    // });

    term.on('exit', (code) => {
      task.clearTerm(type, name);
      console.log('exit', type, code);
      if (getWin()) {
        getWin().webContents.send('task-end', {
          name,
          type,
          finished: code === 0
        });
      }
    });
  },

  stop({ name, type }) {
    const t = task.getTask(type, name);
    if (t.term) {
      kill(t.term.pid, 'SIGKILL');
      if (type === 'start') {
        const uidPath = join(tmpdir(), `.nowa-server-${t.uid}.json`);
        fs.removeSync(uidPath);
      }
    }
  },

  clearLog({ name, type }) {
    task.clearLog(type, name);
  },

  clearNotMacTask(cb) {
    console.log('clear task');
    const taskStart = task.getCmd('start');
    let a = 0, b = 0;
    Object.keys(taskStart).forEach((item) => {
      if (taskStart[item].term) {
        a++;
        // console.log(item, taskStart[item].term.pid, a, b);
        kill(taskStart[item].term.pid, 'SIGKILL', () => {
          b++;
          if (a ===b) cb();
        });
      }
    });
    if (a === 0) cb();
  },

  clearMacTask() {
    console.log('clear task');
    const taskStart = task.getCmd('start');
    Object.keys(taskStart).forEach((item) => {
      if (taskStart[item].term) {
        taskStart[item].term.kill();
      }
    });
  }

};

module.exports = Object.assign(modules, exportFunc);

