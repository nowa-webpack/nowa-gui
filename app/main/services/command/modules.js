const { fork } = require('child_process');
const { join } = require('path');

const env = require('./env');
const config = require('../../config');

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

  console.time(senderInstalling);
  term.stdout.on('data', (data) => {
    const str = data.toString();
    console.log(str);
    if (str.indexOf('INSTALL_PROGRESS') !== -1) {
      percent = isTruthPercent ? getPercent(str) : getMockPercent(str, percent);
    } else {
      log = newLog(log, str);
    }

    win.webContents.send(senderInstalling, {
      project: options.root,
      percent,
      log,
    });
  });

  term.stderr.on('data', (data) => {
    log = newLog(log, data.toString());
    console.log(data.toString());
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