import { join } from 'path';
import { homedir } from 'os';
import { exec, spawn } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';

import { isMac, isWin } from 'shared-nowa';

import { APP_PATH, BIN_PATH, NODE_PATH } from '../paths';
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

const setPath = () => {
  try {
    if (isWin) {
      const term = exec('echo %Path%');
      term.stdout.on('data', (data) => {
        const prestr = data.toString();
        const bat = join(APP_PATH, 'task', 'env.bat');
        const existsNOWA = ~prestr.indexOf('NOWA_PATH');
        if (!existsNOWA) {
          const path = `${BIN_PATH};${NODE_PATH}`;
          exec(`${bat} ${path}`);
        }
      });
    } else {
      const bashPath = join(homedir(), '.bash_profile');
      const str = `export PATH=$PATH:${NODE_PATH}:${BIN_PATH}`;

      if (existsSync(bashPath)) {
        let prestr = readFileSync(bashPath);

        // 文件里不含有 PATH 文本
        if (!~prestr.indexOf('export PATH=')) {
          prestr += `\n${str}`;
          writeFileSync(bashPath, prestr, { flag: 'a' });
        } else {
          // 文件里含有 PATH 文本
          prestr = prestr.toString()
            .split('\n')
            .map((item) => {
              // 找到有 PATH 的那一行
              if (~item.indexOf('export PATH=')) {
                if (!~item.indexOf(BIN_PATH)) {
                  item += `:${BIN_PATH}`;
                }

                if (!~item.indexOf(NODE_PATH)) {
                  item += `:${NODE_PATH}`;
                }
              }

              return item;
            }).join('\n');

          writeFileSync(bashPath, prestr);
        }
        exec('source ~/.bash_profile');
      } else {
        // 不存在 .bash_profile 文件
        writeFileSync(bashPath, str, { flag: 'a' });
        exec('source ~/.bash_profile');
      }
    }
  } catch (e) {
    console.log(e);
  }
};


export default {
  encode,
  openEditor,
  openTerminal,
  setPath,
  ...tasks,
};
