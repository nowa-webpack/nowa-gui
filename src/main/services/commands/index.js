import { join } from 'path';
import { homedir } from 'os';
import { exec, spawn, execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';

import { isMac, isWin } from 'shared-nowa';

import { APP_PATH, BIN_PATH, NODE_PATH, DOT_NOWA_PATH } from '../paths';
// import encode from './encode';
import * as tasks from './tasks';
import mainWin from '../windowManager';
// import { getRegKey } from './reg';


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
  openEditor,
  openTerminal,
  ...tasks,
};
