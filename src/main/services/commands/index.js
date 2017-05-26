import env from './env';
import kill from './kill';
import encode from './encode';
import { install, uninstall } from './install';
import { fork, exec, spawn } from 'child_process';
import { APP_PATH } from '../paths';
import { join } from 'path';
import log from '../applog';

import { isMac, isWin } from 'shared-nowa';


// console.log('modules',modules)

// const testcmd = () => {
//   const term = execFile(join(APP_PATH, 'task', 'test'), {
//     silent: true,
//   });

//   term.stdout.on('data', (data) => {
//     log.error(data.toString());
//   });
// };

const openTerminal = (cwd) => {
  if (isWin) {
    const shell = process.env.comspec || 'cmd.exe';
    exec(`start ${shell}`, { cwd });
  } else if (isMac) {
    exec(join(APP_PATH, 'task', 'terminal'), { cwd });
  } else {
    exec('/usr/bin/x-terminal-emulator', { cwd });
  }
};

const openEditor = (cwd, editor, basePath) => {
  let editorPath = basePath;

  if (editor === 'Sublime') {
    if (isMac) {
      editorPath = join(basePath, '/Contents/SharedSupport/bin/subl');
    }

    if (isWin) {
      editorPath = basePath.indexOf('.exe') === -1 
        ? join(basePath, 'sublime_text.exe') : basePath;
    }
  }

  if (editor === 'VScode') {
    if (isMac) {
      editorPath = join(basePath, '/Contents/Resources/app/bin/code');
    }

    if (isWin) {
      editorPath = basePath.indexOf('.exe') === -1 ? join(basePath, 'Code.exe') : basePath;
    }
  }

  if (editor === 'WebStorm') {
    if (isMac) {
      editorPath = join(basePath, '/Contents/MacOS/webstorm');
    }
  }

  let term;

  return new Promise((resolve) => {
    try {
      if (editor === 'WebStorm') {
        term = exec(`${editorPath} ${cwd}`, { cwd });
      } else {
        term = spawn(editorPath, ['./'], { cwd });
      }
      term.on('exit', () => {
        console.log('exit ediotr');
        resolve({ success: true });
      });
    } catch (e) {
      resolve({ success: false });
    }
  });
};

export default {
  encode,
  install,
  uninstall,
  openEditor,
  openTerminal,
};
