import { join } from 'path';
import { homedir } from 'os';
import { exec, spawn, execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';

import { isMac, isWin } from 'shared-nowa';

import { APP_PATH, BIN_PATH, NODE_PATH, DOT_NOWA_PATH } from '../paths';
import encode from './encode';
import * as tasks from './tasks';
import mainWin from '../windowManager';
import { getRegKey } from './reg';


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

const templateStr = (buf) =>
`Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Environment]
"NOWA_PATH"="${NODE_PATH.replace(/\\/g, '\\\\')};${BIN_PATH.replace(/\\/g, '\\\\')}"
"PATH"=hex(2):${buf},00,00,00`;

const setPath = () => {
  try {
    if (isWin) {
      getRegKey({
        target: 'HKEY_CURRENT_USER\\Environment',
        name: 'PATH'
      }).then(res => {
        const file = join(DOT_NOWA_PATH, 'env.reg');
        const prestr = res.split('\r\n')[2].split('    ')[3];
        const set = new Set(prestr.split(';').filter(n => !!n));
        const hasNowa = [...set].some(item => item.indexOf('NOWA_PATH') !== -1);
        const hasReg = existsSync(file);

        if (!hasNowa || !hasReg) {
          const temp = !hasNowa ? `${[...set].join(';')};%NOWA_PATH%` : [...set].join(';');

          const buf = new Buffer(temp, 'utf-8');
          const str = buf.toString('hex').match(/\w{2}/g).join(',00,');
          writeFileSync(file, templateStr(str));
          execSync(`REG IMPORT ${file}`);

          if (!hasNowa) {
            mainWin.send('show-restart-tip');
          }
        }
      });
      // const term = exec('echo %PATH%');
      // term.stdout.on('data', (data) => {
      //   const prestr = data.toString();
      //   console.log(prestr);
      //   console.log(process.env);
        // const bat = join(APP_PATH, 'task', 'env.bat');
        // const existsNOWA = ~prestr.indexOf('NOWA_PATH');
        // if (!existsNOWA) {
        //   const path = `${BIN_PATH};${NODE_PATH}`;
        //   exec(`${bat} ${path}`);
        // }
      // });
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
