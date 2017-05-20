/*!
 * thread-kill
 * Date: 2016/1/14
 * https://github.com/nuintun/command-manager
 *
 * Referer: https://github.com/pkrumins/node-tree-kill
 */

import { exec } from 'child_process';
import spawn from './spawn';

/**
 *
 * @param pid
 * @param signal
 * @param callback
 */

function killPid(pid, signal) {
  try {
    process.kill(parseInt(pid, 10), signal);
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

function killAll(tree, signal, callback) {
  const killed = {};

  try {
    Object.keys(tree).forEach((pid) => {
      tree[pid].forEach((pidpid) => {
        if (!killed[pidpid]) {
          killPid(pidpid, signal);

          killed[pidpid] = 1;
        }
      });

      if (!killed[pid]) {
        killPid(pid, signal);

        killed[pid] = 1;
      }
    });
  } catch (error) {
    if (callback) {
      return callback(error);
    } else {
      throw error;
    }
  }

  if (callback) {
    return callback();
  }
}


function buildProcessTree(parentPid, tree, pidsToProcess, spawnChildProcessesList, callback) {
  let allData = '';
  const ps = spawnChildProcessesList(parentPid);

  ps.stdout.on('data', (data) => {
    allData += data.toString('ascii');
  });

  const onClose = (code) => {
    delete pidsToProcess[parentPid];

    if (code !== 0) {
      // no more parent processes
      if (Object.keys(pidsToProcess).length === 0) {
        callback();
      }
      return;
    }

    allData.match(/\d+/g).forEach((pid) => {
      pid = parseInt(pid, 10);

      tree[parentPid].push(pid);

      tree[pid] = [];
      pidsToProcess[pid] = 1;

      buildProcessTree(pid, tree, pidsToProcess, spawnChildProcessesList, callback);
    });
  };

  ps.on('close', onClose);
}

export default function (pid, signal, callback) {
  const tree = {};
  const pidsToProcess = {};

  tree[pid] = [];
  pidsToProcess[pid] = 1;

  if (typeof signal === 'function') {
    signal = 'SIGKILL';
    callback = signal;
  }

  switch (process.platform) {
    // win32
    case 'win32':
      exec(`taskkill /pid ${pid} /T /F`, callback);
      break;
    // darwin
    case 'darwin':
      buildProcessTree(pid, tree, pidsToProcess,
        parentPid => spawn(`pgrep -P ${parentPid}`),
        () => killAll(tree, signal, callback));
      break;
    // linux
    default:
      buildProcessTree(pid, tree, pidsToProcess,
        parentPid => spawn(`ps -o pid --no-headers --ppid ${parentPid}`),
        () => killAll(tree, signal, callback));
      break;
  }
}
