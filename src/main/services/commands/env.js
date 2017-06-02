import fixPath from 'fix-path';
import { homedir } from 'os';
import { exec } from 'child_process';
import npmRunPath from 'npm-run-path';
import { delimiter, join } from 'path';

import { isWin } from 'shared-nowa';
import { BIN_PATH, NODE_PATH, APP_PATH, NOWA_INSTALL_DIR } from '../paths';
import { writeFileSync, existsSync, readFileSync } from 'fs';

fixPath();

const npmEnv = npmRunPath.env();
// const pathEnv = [process.env.Path, npmEnv.PATH, BIN_PATH, NODE_PATH]
//   .filter(p => !!p)
//   .join(delimiter);
const pathEnv = [process.env.Path, npmEnv.PATH, BIN_PATH, NODE_PATH]
  .filter(p => !!p)
  .join(delimiter);
const env = { ...npmEnv, FORCE_COLOR: 1 };

if (isWin) {
  env.Path = pathEnv;
} else {
  env.PATH = `${pathEnv}:/usr/local/bin`;
}

try {
  if (isWin) {
    const term = exec('echo %Path%');
    term.stdout.on('data', (data) => {
      const prestr = data.toString();
      const bat = join(APP_PATH, 'task', 'env.bat');

      if (prestr.indexOf(BIN_PATH) === -1) {
        exec(`${bat} ${BIN_PATH}`);
      }

      if (prestr.indexOf(NODE_PATH) === -1) {
        exec(`${bat} ${NODE_PATH}`);
      }
    });
  } else {
    const bashPath = join(homedir(), '.bash_profile');
    const str = `export PATH=$PATH:${NODE_PATH}:${BIN_PATH}`;

    if (existsSync(bashPath)) {
      let prestr = readFileSync(bashPath);

      // 文件里不含有 PATH 文本
      if (prestr.indexOf('export PATH=') === -1) {
        prestr += `\n${str}`;
        writeFileSync(bashPath, prestr, { flag: 'a' });
      } else {
        // 文件里含有 PATH 文本
        prestr = prestr.toString()
          .split('\n')
          .map((item) => {
            // 找到有 PATH 的那一行
            if (item.indexOf('export PATH=') !== -1) {
              if (item.indexOf(BIN_PATH) === -1) {
                item += `:${BIN_PATH}`;
              }

              if (item.indexOf(NODE_PATH) === -1) {
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

// writeFileSync(join(APP_PATH, 'env.json'), process.execPath);

export default env;
