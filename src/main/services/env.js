/*
	环境变量
*/
import fixPath from 'fix-path';
import { exec } from 'child_process';
import npmRunPath from 'npm-run-path';
import { delimiter, join } from 'path';

import { isWin } from 'shared-nowa';
import { BIN_PATH, NODE_PATH, APP_PATH, NOWA_INSTALL_DIR, NPM_BIN_PATH } from './paths';

// 修复electron的process.env.PATH 缺失路径的文静
fixPath();

const npmEnv = npmRunPath.env();
const pathEnv = [process.env.Path, npmEnv.PATH, BIN_PATH, NODE_PATH, NPM_BIN_PATH]
  .filter(p => !!p)
  .join(delimiter);
const env = { ...npmEnv, FORCE_COLOR: 1 };

if (isWin) {
  env.Path = pathEnv;
} else {
  env.PATH = `${pathEnv}:/usr/local/bin`;
}


export default env;