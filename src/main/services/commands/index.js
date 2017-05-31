import { join } from 'path';
import { exec, spawn } from 'child_process';
import { isMac, isWin } from 'shared-nowa';
import { APP_PATH } from '../paths';
import encode from './encode';
import * as tasks from './tasks';


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
  openEditor,
  openTerminal,
  ...tasks,
};
