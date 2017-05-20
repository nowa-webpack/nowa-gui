import co from 'co';
import { join } from 'path';
import npminstall from 'npminstall';


import config from 'config-main-nowa';
import tasklog from '../tasklog';
import mainWin from '../windowManager';
// import { APP_PATH, NPM_PATH } from '../paths';
import { getTruePercent, getFakePercent } from './utils';
import Logger from './logger';
import log from '../applog';


export default ({
  opt,
  fake = false,
  sender,
  sendProgress = () => {},
}) => {
  const options = {
    console: new Logger(sender),
    targetDir: opt.root,
    storeDir: join(opt.root, 'node_modules', '.npminstall'),
    timeout: 5 * 60000,
    cacheDir: null,
    ...opt
  };

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

    yield npminstall(options);

    console.log('end install');

    return { err: false };
  }).catch((err) => {
    log.error(err.message);
    clearInterval(timer);
    if (sender) mainWin.send(`${sender}-failed`, err.message);
    return { err: err.message };
  });
};

/*export const noLogInstall = ({
  opt,
  fake = false,
  // sender,
  sendProgress = () => {},
}) => {
  const options = {
    // console: new Logger(),
    targetDir: opt.root,
    storeDir: join(opt.root, 'node_modules', '.npminstall'),
    timeout: 5 * 60000,
    cacheDir: null,
    ...opt
  };

  // if (sender) {
  //   options.console = new Logger(sender);
  // }

  let timer;
  let percent = 0;

  return co(function* () {
    timer = setInterval(() => {
      const progresses = options.progresses;
      percent = fake 
        ? getFakePercent(progresses, percent, opt.pkgs.length) 
        : getTruePercent(progresses);
      // console.log('percent', percent);
      if (percent >= 100) {
        clearInterval(timer);
      }
      sendProgress(percent);
    }, 1000);
    yield npminstall(options);
    console.log('end install');

    return { err: false };
  }).catch((err) => {
    log.error(err.message);
    clearInterval(timer);
    return { err: err.message };
  });
};*/

