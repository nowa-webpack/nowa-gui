const { fork } = require('child_process');
const { join } = require('path');
// const iconv = require('iconv-lite');


const env = require('./env');
const config = require('../../config');
const task = require('../task');

const { getWin } = require('../windowManager');
const { getPercent, getMockPercent, newLog } = require('../utils');
const { constants: { APP_PATH, NPM_PATH } } = require('../is');

const targetPath = join(APP_PATH, 'task', 'install.js');

const installTerm = options => fork(targetPath, {
  cwd: APP_PATH,
  silent: true,
  env: Object.assign(env, { params: JSON.stringify(options) }),
  // execArgv: ['--harmony'],
});

const progressInstall = ({ options = {}, sender, isTruthPercent = true, endCb }) => {
  const win = getWin();
  const term = installTerm(options);
  const senderInstalling = `${sender}-installing`;
  const senderInstalled = `${sender}-installed`;
  let percent = 0;
  let log = '';

  if (sender === 'import') {
    task.setTask('IMPORT_PROJECT', options.root, {
      term,
    });
  }

  console.time(senderInstalling);
  term.stdout.on('data', (data) => {
    const project = options.root;
    const str = data.toString();
    // const str = iconv.decode(data, 'gb2312');
    console.log(str);
    if (str.indexOf('INSTALL_PROGRESS') !== -1) {
      percent = isTruthPercent ? getPercent(str) : getMockPercent(str, percent);
    } else {
      // log = newLog(log, str);
      if (sender === 'import') {
        log = task.writeLog('IMPORT_PROJECT',  project, data);
      } else {
        log = newLog(log, str);
      }
    }

    win.webContents.send(senderInstalling, {
      project,
      percent,
      log,
    });
  });

  term.stderr.on('data', (data) => {
    // log = newLog(log, iconv.decode(data, 'gb2312'));
    // log = newLog(log, data.toString());
    console.log(data.toString());
    if (sender === 'import') {
      log = task.writeLog('IMPORT_PROJECT',  options.root, data);
    } else {
      log = newLog(log, data.toString());
    }
    win.webContents.send(senderInstalling, {
      project: options.root,
      percent,
      log,
    });
  });

  term.on('exit', (code) => {
    console.log(senderInstalled, 'exit', code);
    console.timeEnd(senderInstalling);
    if (endCb) endCb();
    win.webContents.send(senderInstalled, {
      project: options.root,
      err: code !== 0,
      pkgs: options.pkgs
    });
  });
};

const notProgressInstall = ({ options = {}, sender, endCb }) => {
  const win = getWin();
  const term = installTerm(options);
  const senderInstalled = `${sender}-installed`;

  console.time(senderInstalled);
  term.on('exit', (code) => {
    console.log(senderInstalled, 'exit', code);
    console.timeEnd(senderInstalled);
    if (endCb) endCb();
    win.webContents.send(senderInstalled, {
      project: options.root,
      err: code !== 0,
      pkgs: options.pkgs
    });
  });
};

module.exports = {

  progressInstall,
  notProgressInstall,
  uninstallModules({ pkg, filePath }) {
    const args = ['uninstall', pkg];
    // args.push(type === 'dependencies' ? '-S' : '-D');
    args.push(`--registry=${config.registry()}`);
    args.push('--scripts-prepend-node-path=auto');
    
    fork(NPM_PATH, args, {
      silent: true,
      cwd: filePath,
      env,
    });
  }

}