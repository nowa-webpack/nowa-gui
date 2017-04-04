const { delimiter } = require('path');
const npmRunPath = require('npm-run-path');
const fixPath = require('fix-path');

const { constants: { BIN_PATH, NODE_PATH }, isWin } = require('../is');


fixPath();

const npmEnv = npmRunPath.env();
const pathEnv = [process.env.Path, npmEnv.PATH, BIN_PATH, NODE_PATH]
  .filter(p => !!p)
  .join(delimiter);
const env = Object.assign(npmEnv, {
  FORCE_COLOR: 1,
});

if (isWin) {
  env.Path = pathEnv;
} else {
  env.PATH = pathEnv;
}

// fs.writeJsonSync(join(APP_PATH, 'env.text'), { prv: process.env, env, npmEnv});

module.exports = env;
