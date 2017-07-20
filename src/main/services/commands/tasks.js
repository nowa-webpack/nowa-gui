import co from 'co';
import { join } from 'path';
import { tmpdir } from 'os';
import uuidV4 from 'uuid/v4';
import { exec, fork, spawn } from 'child_process';
import { removeSync } from 'fs-extra';
import npmuninstall from 'npminstall/lib/uninstall';
import cnpm from 'npminstall/lib/local_install';
// import npm from 'npm';
// import pnpm from 'supi';

import env from './env';
import kill from './kill';
import log from '../applog';
import Logger from './logger';
import tasklog from '../tasklog';
import mainWin from '../windowManager';
import { APP_PATH, NPM_PATH } from '../paths';
import { getTruePercent, getFakePercent } from './utils';

// const npmin = require('npm')
// const { installPkgs } = pnpm;
  // console.log(npmin);

export const install = ({
  opt,
  fake = false,
  sender,
  sendProgress = () => {},
}) => {
  const options = {
    targetDir: opt.root,
    storeDir: join(opt.root, 'node_modules', '.npminstall'),
    timeout: 5 * 60000,
    ignoreScripts: true,
    cacheDir: null,
    // binDir: '/usr/local/bin',
    ...opt
  };

  console.log(options);

  if (sender) {
    options.console = new Logger(sender);
  }

  let timer;
  let percent = 0;

  return co(function* () {
    timer = setInterval(() => {
      const progresses = options.progresses;
      percent = fake
        ? getFakePercent(progresses, percent, opt.pkgs.length)
        : getTruePercent(progresses);
      console.log('percent', percent);

      if (percent >= 100) {
        clearInterval(timer);
      }
      if (sender) {
        mainWin.send(`${sender}-progress`, percent);
      } else {
        sendProgress(percent);
      }
    }, 1000);
    yield cnpm(options);

    console.log('end install');

    return { err: false };
  }).catch((err) => {
    log.error(err);
    clearInterval(timer);
    if (sender) mainWin.send(`${sender}-failed`, err.message);
    return { err: err.message };
  });
};

export const uninstall = (opt) => {
  const options = {
    targetDir: opt.root,
    storeDir: join(opt.root, 'node_modules', '.npminstall'),
    // timeout: 5 * 60000,
    ...opt,
    binDir: join(opt.root, 'node_modules', '.bin'),
  };

  return co(function* () {
    const data = yield npmuninstall(options);
    console.log(data);
    console.log('end uninstall');
    return { err: false };
  }).catch((err) => {
    log.error(err.message);
    return { err: err.message };
  });
};

// export const execCmd = ({ command, projPath }) => {
//   // console.log(command, projPath);
//   const p = join(APP_PATH, 'task', 'install.js');
  
//   exec(`node ${p}`, { env }, (e, i, o) => {
//     console.log(i);
//     console.log(o);
//   });
// };
export const execCmd = ({ command, projPath }) => {

  console.log(command, projPath);
  const uid = uuidV4();
  const term = exec(`npm run ${command} --scripts-prepend-node-path=auto`, {
    cwd: projPath,
    env: { ...env, NOWA_UID: uid },
    detached: true
  });

  tasklog.setTask(command, projPath, {
    term,
    uid
  });
  const senderData = (data) => tasklog.writeLog(command, projPath, data);

  term.stdout.on('data', senderData);
  term.stderr.on('data', senderData);

  term.on('exit', (code) => {
    tasklog.clearTerm(command, projPath);
    log.error('exit', command, code);
    if (mainWin.getWin()) {
      mainWin.send('task-end', {
        command,
        projPath,
        finished: code === 0
      });
    }
  });


  // const term = fork(NPM_PATH, ['run', type, '--scripts-prepend-node-path=auto'], {
    // silent: true,
    // cwd: name,
    // env: Object.assign(env, { NOWA_UID: uid }),
    // detached: true
  // });
};

export const stopCmd = ({ command, projPath = '' }) => {
  console.log('stop', command, projPath);
  const task = tasklog.getTask(command, projPath);
  if (task.term) {
    kill(task.term.pid, 'SIGKILL');
    if (command === 'start') {
      const uidPath = join(tmpdir(), `.nowa-server-${task.uid}.json`);
      removeSync(uidPath);
    }
  }
};

export const clearNotMacTask = (cb) => {
  console.log('clear clearNotMacTask');
  const taskStart = tasklog.getCmd('start');
  let a = 0;
  let b = 0;
  Object.keys(taskStart).forEach((item) => {
    if (taskStart[item].term) {
      a++;
      kill(taskStart[item].term.pid, 'SIGKILL', () => {
        b++;
        if (a === b) cb();
      });
    }
  });
  if (a === 0) cb();
};

export const clearMacTask = () => {
  console.log('clear clearMacTask');
  const taskStart = tasklog.getCmd('start');
  Object.keys(taskStart).forEach((item) => {
    if (taskStart[item].term) {
      taskStart[item].term.kill();
    }
  });
};
