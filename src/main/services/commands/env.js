import fixPath from 'fix-path';
import { delimiter, join } from 'path';
import npmRunPath from 'npm-run-path';

import { isWin } from 'shared-nowa';
import { BIN_PATH, NODE_PATH, APP_PATH } from '../paths';
import { writeFileSync } from 'fs';

fixPath();

const npmEnv = npmRunPath.env();
const pathEnv = [process.env.Path, npmEnv.PATH, BIN_PATH, NODE_PATH]
  .filter(p => !!p)
  .join(delimiter);
const env = { ...npmEnv, FORCE_COLOR: 1 };

if (isWin) {
  env.Path = pathEnv;
} else {
  env.PATH = pathEnv;
}

// writeFileSync(join(APP_PATH, 'env.json'), process.execPath);

export default env;
