/*
  基础任务-包含编码和全局路径
*/
import { execSync, exec } from 'child_process';
import { copySync, existsSync, readFileSync, removeSync, writeFileSync, createReadStream } from 'fs-extra';
import { join } from 'path';
// import { writeFileSync, createReadStream } from 'fs';
import { homedir } from 'os';
import { download } from './boilerplate/util';

import { isWin, isMac, isLinux } from 'shared-nowa';
import env from './env';
import log from './applog';
import config from 'config-main-nowa';
import mainWin from './windowManager';
import { getRegKey } from './commands/reg';
import { APP_PATH, BIN_PATH, NODE_PATH, DOT_NOWA_PATH, NPM_BIN_PATH, APP_NODE_VERSION } from './paths';

/*
  electron 打包 node_modules 后会丢失 .bin 目录
  所以必须手动复制一份到node_modules下并赋权
*/
// try {
//   if (!existsSync(NPM_BIN_PATH)) {
//     console.log('copy npm .bin folder');
//     copySync(join(APP_PATH, 'task', '.bin'), NPM_BIN_PATH);
//     if (!isWin) {
//       execSync(`chmod 755 *`, { cwd: NPM_BIN_PATH });
//     }
//   }

  
// } catch (e) {
//   console.log(e);
// }

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

const downloadNode = async(registry) => {
  try {
   
    const ext = isWin ? '.exe' : '';

    if (!execSync(join(NODE_PATH, `node${ext}`))) {

      let prefix = registry === 'http://registry.npmjs.org' 
        ? `https://nodejs.org/dist/${APP_NODE_VERSION}` 
        : `https://npm.taobao.org/mirrors/node/${APP_NODE_VERSION}`;
      let url;

      if (isWin) {
        url = `${prefix}/win-x64/node.exe`;
      }

      if (isMac) {
        url = `${prefix}/node-${APP_NODE_VERSION}-darwin-x64.tar.gz`;
      }

      if (isLinux) {
        url = `${prefix}/node-${APP_NODE_VERSION}-linux-x64.tar.gz`;
      }
      await download(url, NODE_PATH, !isWin);

      if (!isWin) {
        const fileName = isMac ? `node-${APP_NODE_VERSION}-darwin-x64` : `node-${APP_NODE_VERSION}-linux-x64`;
        const target = join(NODE_PATH, fileName);
        if (existsSync(target)) {
          const src = join(target, 'bin', 'node');
          copySync(src, join(NODE_PATH, 'node'));
          removeSync(target);
        }
      }
    }
  } catch (e) {
    log.error(e);
  }
};


export default {
  setEncode,
  setGlobalPath,
  downloadNode,
};

