import { execSync, exec } from 'child_process';
import { copySync, existsSync, readFileSync } from 'fs-extra';
import { join } from 'path';
import { writeFileSync } from 'fs';
import { homedir } from 'os';

import { isWin } from 'shared-nowa';
import config from 'config-main-nowa';
import log from './applog';
import env from './env';
import { getRegKey } from './commands/reg';
import { APP_PATH, BIN_PATH, NODE_PATH, DOT_NOWA_PATH, NPM_BIN_PATH } from './paths';


try {
  if (!existsSync(NPM_BIN_PATH)) {
    console.log('copy npm .bin folder');
    copySync(join(APP_PATH, 'task', '.bin'), NPM_BIN_PATH);
    execSync(`chmod 755 *`, { cwd: NPM_BIN_PATH });
  }
} catch (e) {
  console.log(e);
}

const setEncode = () => {
  const encodeMap = {
    437: 'UTF-8',
    950: 'GBK',
    936: 'GBK',
  };

  let encode = 'UTF-8';
  try {
    if (isWin) {
      const pageCode = execSync('chcp', { env }).toString().split(':')[1].trim();
      if (encodeMap[pageCode]) encode = encodeMap[pageCode];
      // config.setItem('ENCODE', encode);
    } else {
      // const locale = execFileSync('env', { env }).toString();
      // log.error(locale);
      // const lang = stdout.split('\n')[0].split('"')[1];
      // const t = lang.split('\n')[0].split('"')[1];
      // encode = lang.split('.')[1];
    }
  } catch (e) {
    log.error(e);
  }

  console.log('encode', encode);
  config.setItem('ENCODE', encode);
  return encode;
}

const templateStr = (buf) =>
`Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Environment]
"NOWA_PATH"="${NODE_PATH.replace(/\\/g, '\\\\')};${BIN_PATH.replace(/\\/g, '\\\\')};${NPM_BIN_PATH.replace(/\\/g, '\\\\')}"
"PATH"=hex(2):${buf},00,00,00`;

const setGlobalPath = () => {
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
        const hasReadReg = config.getItem('REG') || false ;
        // const hasReg = existsSync(file);

        if (!hasReadReg) {
          const temp = !hasNowa ? `${[...set].join(';')};%NOWA_PATH%` : [...set].join(';');

          const buf = new Buffer(temp, 'utf-8');
          const str = buf.toString('hex').match(/\w{2}/g).join(',00,');
          writeFileSync(file, templateStr(str));
          execSync(`REG IMPORT ${file}`);
          config.setItem('REG', true);
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
      const str = `export PATH=$PATH:${NODE_PATH}:${BIN_PATH}:${NPM_BIN_PATH}`;

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

                if (!~item.indexOf(NPM_BIN_PATH)) {
                  item += `:${NPM_BIN_PATH}`;
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
  setEncode,
  setGlobalPath,
};

