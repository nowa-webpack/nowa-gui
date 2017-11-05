/*
  执行命令服务 1.9.*
*/
import co from 'co';
import { join } from 'path';
import { tmpdir } from 'os';
import uuidV4 from 'uuid/v4';
import { exec, fork, spawn } from 'child_process';
import { removeSync, existsSync } from 'fs-extra';
import npminstall from 'npminstall';
import npmuninstall from 'npmuninstall';
// import npmuninstall from 'npminstall/lib/uninstall';

import env from '../env';
import kill from './kill';
import log from '../applog';
import Logger from './logger';
import tasklog from '../tasklog';
import mainWin from '../windowManager';
import { APP_PATH, NPM_PATH } from '../paths';
import { getFakePercent } from './utils';

export const installPkgsWithLog = ({
  opt,
  fakeProgress = false,
  sender,
  // sendProgress = () => {},
}) => {
  const options = {
    targetDir: opt.root,
    storeDir: join(opt.root, 'node_modules', '.npminstall'),
    timeout: 5 * 60000,
    ignoreScripts: true,
    cacheDir: null,
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
      percent = getFakePercent(progresses, percent, opt.pkgs.length);

      // percent = fake
      //   ? getFakePercent(progresses, percent, opt.pkgs.length)
      //   : getTruePercent(progresses);
      console.log('percent', percent);

      if (percent >= 100) {
        clearInterval(timer);
      }
      // if (sender) {
        mainWin.send(`${sender}-progress`, percent);
      // } else {
      //   sendProgress(percent);
      // }
    }, 1000);

    yield npminstall(options);

    console.log('end install');
    mainWin.send(`${sender}-finished`);

    return { err: false };
  }).catch((err) => {
    log.error(err);
    clearInterval(timer);
    if (sender) mainWin.send(`${sender}-failed`, err.message);
    return { err: err.message };
  });
};

// 安装依赖，不提供日志, 只安装具体的依赖
export const noLoggingInstall = ({
  root, // 安装的路径
  registry, //源地址
  pkgs, // 依赖数组
  sender = '', // renderer端监听的安装的名字
  type = 'dependencies', // 安装类型
  noSave = false,
}) => {

  // 兼容旧版本，删除npminstall 遗留物
  if (existsSync(join(root, 'node_modules', '.npminstall')) && sender !== 'nowa-install') {
    removeSync(join(root, 'node_modules'));
    const filePath = join(root, 'package-lock.json');
    if (existsSync(filePath)) {
      removeSync(filePath);
    }
    const res = loggingInstall({ root, registry, sender });
    if (res.err) {
      return res;
    }
  }

  const name = pkgs.map(({ name, version }) => version ? `${name}@${version}` : name );

  console.log('install proj packages', name.join(' '))

  return new Promise((resolve) => {
    try {
      const term = fork(NPM_PATH, [
        'install', name.join(' '),
        `${noSave ? '--no-save' : (type === 'dependencies' ? '-S' : '-D')}`,
        '--no-optional',
        `--registry=${registry}`,
        '--loglevel=warn',
        '--scripts-prepend-node-path=auto'
        ], {
          silent: true,
          cwd: root,
          env: env,
          detached: true
        });
      
      term.stderr.on('data', data => {
        console.log(data.toString());
        mainWin.send(`${sender}-failed`, data.toString());
      });

      term.on('exit', (code) => {
        console.log('npm install exit code', code);
        resolve({ err: code !== 0 });
      });
    } catch (e) {
      resolve({ err: true });
    }
  });
};

// 安装依赖，提供日志， 安装所有依赖
export const loggingInstall = ({ root, registry, sender }) => {
  const filePath = join(root, 'package-lock.json');
  if (existsSync(filePath)) {
    removeSync(filePath);
  }

  return new Promise((resolve) => {
    try {
      let log = '';
      const term = fork(NPM_PATH, [
        'install', 
        // ...name,
        `-registry=${registry}`,
        '--no-optional',
        '-loglevel=info',
        '--scripts-prepend-node-path=auto'
        ], {
          silent: true,
          cwd: root,
          env,
          detached: true
        });

      term.stdout.on('data', data => {
        log += data.toString();
        mainWin.send(`${sender}-logging`, log);
      });
      term.stderr.on('data', data => {
        // console.log(data.toString());
        log += data.toString();
        mainWin.send(`${sender}-failed`, log);
      });

      term.on('exit', (code) => {
        console.log('npm install exit code', code);
        resolve({ err: code !== 0 });
      });
    } catch (e) {
      resolve({ err: true });
    }
  });
}

// 更新依赖，可能无用
export const update = ({
  root, registry, pkgs, type = 'dependencies'
}) => {
  const name = pkgs.map(({ name, version }) => name);
 
  return new Promise((resolve) => {
    try {
      const term = fork(NPM_PATH, [
        'update', ...name,
        `${type === 'dependencies' ? '-S' : '-D'}`,
        `-registry=${registry}`,
        '-loglevel=warn',
        '--scripts-prepend-node-path=auto'
        ], {
        silent: true,
        cwd: root,
        env: env,
        detached: true
      });

      term.stderr.on('data', data => {
        console.log(data.toString());
      });

      term.on('exit', (code) => {
        console.log('npm update exit code', code);
        resolve({ err: code !== 0 });
      });
    } catch (e) {
      resolve({ err: true });
    }
  });
};

// 卸载依赖，只能单个卸载
export const uninstall = ({ root, pkg, type }) => {
  return new Promise((resolve) => {
    try {
      let str = `npm uninstall ${pkg}`;
      if (type) {
        str += type === 'dependencies' ? ' -S' : ' -D'
      }
      const term = exec(str, { cwd: root, env });
      term.on('exit', (code) => {
        console.log('npm uninstall exit code', code);
        resolve({ err: code !== 0 });
      });
    } catch (e) {
      resolve({ err: true });
    }
  });
};

/* 1.9.0 之前的安装，仅参考
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

*/



// export const uninstall = (opt) => {

 /* const options = {
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
  });*/
// };

// export const execCmd = ({ command, projPath }) => {
//   // console.log(command, projPath);
//   const p = join(APP_PATH, 'task', 'install.js');
  
//   exec(`node ${p}`, { env }, (e, i, o) => {
//     console.log(i);
//     console.log(o);
//   });
// };

// 执行命令
export const execCmd = ({ command, projPath }) => {

  console.log(command, projPath);
  const uid = uuidV4();
  const term = exec(`npm run ${command} --scripts-prepend-node-path=auto`, {
    cwd: projPath,
    env: { ...env, NOWA_UID: uid },
    detached: true
  });

  // 保存该命令的状态到tasklog
  tasklog.setTask(command, projPath, {
    term,
    uid
  });
  const senderData = (data) => tasklog.writeLog(command, projPath, data);

  term.stdout.on('data', senderData);
  term.stderr.on('data', senderData);

  term.on('exit', (code) => {
    // 清理命令
    tasklog.clearTerm(command, projPath);
    log.error('exit', command, code);
    if (mainWin.getWin()) {
      // 通知 renderer 命令停止
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

// 停止命令
export const stopCmd = ({ command, projPath = '' }) => {
  console.log('stop', command, projPath);
  const task = tasklog.getTask(command, projPath);
  if (task.term) {
    kill(task.term.pid, 'SIGKILL');
    /*
      运行 nowa server 的时候，命令行会在tmp目录下生成一个json文件
      该文件包含了项目当前运行的端口号
      nowa server停止的时候，清理这个文件
    */
    if (command === 'start') {
      const uidPath = join(tmpdir(), `.nowa-server-${task.uid}.json`);
      removeSync(uidPath);
    }
  }
};

// 清理windows下的任务
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

// 清理非windows下的任务
export const clearMacTask = () => {
  console.log('clear clearMacTask');
  const taskStart = tasklog.getCmd('start');
  Object.keys(taskStart).forEach((item) => {
    if (taskStart[item].term) {
      taskStart[item].term.kill();
    }
  });
};
