const { spawn, exec, fork } = require('child_process');
const { join, delimiter } = require('path');
const npmRunPath = require('npm-run-path');
// const fs = require('fs-extra');
// const uuid = require('uuid');
const pubsub = require('electron-pubsub');

const { constants, isWin } = require('../is');
const { getWin } = require('../windowManager');
const { getPercent, getMockPercent, newLog } = require('../utils');
const config = require('../../config');

const { APP_PATH, NPM_PATH, BIN_PATH, NODE_PATH } = constants;

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

const targetPath = join(APP_PATH, 'task', 'install.js');

const installTerm = (options) => fork(targetPath, {
  cwd: APP_PATH,
  silent: true,
  // execArgv: ['--harmony'],
  env: Object.assign(npmEnv, { params: JSON.stringify(options), FORCE_COLOR: 1, }),
});

const progressInstall = ({ options = {} , sender, isTruthPercent = true, endCb }) => {
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

const notProgressInstall = ({ options = {} , sender, endCb }) => {
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

  /*installNowa(options) {
    const win = getWin();
    const term = installTerm(options);
    console.time('nowa install');
    let percent = 0;
    let log = '';

    term.stdout.on('data', (data) => {
      const str = data.toString();
      console.log(str);
      if (str.indexOf('INSTALL_PROGRESS') !== -1) {
        percent = getMockPercent(str, percent);
      } else {
        log = newLog(log, str);
      }
      win.webContents.send('nowa-installing', {
      // pubsub.publish('nowa-installing', {
        percent,
        log,
      });
    });

    term.stderr.on('data', (data) => {
      log = newLog(log, data.toString());
      console.log(data.toString());
      // pubsub.publish('nowa-installing', {
      win.webContents.send('nowa-installing', {
        percent,
        log,
      });
    });

    term.on('exit', (code) => {
      console.log('exit install', code);
      if (!code) {
        endCb();
        config.nowaNeedInstalled(false);
        console.log('nowaNeedInstalled', config.nowaNeedInstalled());
        console.timeEnd('nowa install');
        // pubsub.publish('nowa-installed');
        win.webContents.send('nowa-installed');
      }
    });
  },*/

  /*installModules(options) {
    const win = getWin();
    console.log('install modules');

    let term = fork(targetPath, {
      cwd: APP_PATH,
      silent: true,
      // execArgv: ['--harmony'],
      env: Object.assign(npmEnv, { params: JSON.stringify(options), FORCE_COLOR: 1, }),
    });

    let percent = 0;
    let log = '';

    term.stdout.on('data', (data) => {
      const str = data.toString();
      console.log(str);
      if (str.indexOf('INSTALL_PROGRESS') !== -1) {
        percent = getPercent(str);
      } else {
        log = newLog(log, str);
      }
      pubsub.publish('install-modules', {
      // win.webContents.send('install-modules', {
        project: options.root,
        percent,
        log,
      });
    });

    term.stderr.on('data', (data) => {
      log = newLog(log, data.toString());
      console.log(data.toString());
      pubsub.publish('install-modules', {
      // win.webContents.send('install-modules', {
        project: options.root,
        percent,
        log,
      });
    });

    term.on('exit', (code) => {
      console.log('exit install code', code);
      pubsub.publish('install-modules-finished', {
      // win.webContents.send('install-modules-finished', {
        project: options.root,
        err: code !== 0,
        pkgs: options.pkgs
      });
      term = null;
    });
  },

  importModulesInstall(options, isNowaInstall) {
    const win = getWin();
    const targetPath = join(APP_PATH, 'task', 'install.js');
    const term = fork(targetPath, {
      cwd: APP_PATH,
      silent: true,
      env: Object.assign(npmEnv, { params: JSON.stringify(options), FORCE_COLOR: 1, }),
    });
    if (!isNowaInstall) {
      term.on('exit', (code) => {
        console.log('exit importModulesInstall code', code);
        // pubsub.publish('import-install-finished', {
        win.webContents.send('import-install-finished', {
          filePath: options.root,
          success: code === 0
        });
      });
    }

    return term;
  },*/

  uninstallModules({ pkg, filePath, type }) {
    const win = getWin();
    // const str = pkgs.join(' ');
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

  /*nodeUpdateModules({ pkgs, filePath, type }) {
    const win = getWin();
    const str = pkgs.join(' ');
    const args = ['install', str];

    args.push(type === 'dependencies' ? '-S' : '-D');
    args.push(`--registry=${config.registry()}`);
    args.push('--scripts-prepend-node-path=auto');

    fork(NPM_PATH, args, {
      silent: true,
      cwd: filePath,
      env,
      // detached: true
    }).on('exit', (code) => {
      console.log('exit nodeUpdateModules code', code);
      win.webContents.send('install-modules-finished', {
        project: filePath,
        err: code !== 0,
      });
    });
  }*/

}