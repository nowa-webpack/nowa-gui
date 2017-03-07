const { app } = require('electron');
const isDev = require('electron-is-dev');
const { join } = require('path');
const os = require('os');
const npmRunPath = require('npm-run-path');

const IS_WIN = process.platform === 'win32';

const APP_PATH = isDev ? join(process.cwd(), 'app') : app.getAppPath();

const NOWA_PATH = join(APP_PATH, 'node_modules', 'nowa');
const NOWA_BIN_PATH = join(NOWA_PATH, 'bin');


const NODE_PATH = IS_WIN
  ? join(APP_PATH, 'nodes', 'node.exe')
  : join(APP_PATH, 'nodes', 'node');

// const NPM_PATH = join(APP_PATH, 'node_modules', 'npm', 'bin', IS_WIN ? 'npm.cmd' : 'npm');
const NPM_PATH = join(APP_PATH, 'node_modules', 'npm', 'bin', 'npm-cli.js');
// Microsoft VS Code/bin/code.cmd

module.exports = {
  NODE_PATH,
  APP_PATH,
  NOWA_PATH,
  NOWA_BIN_PATH,
  NPM_PATH,
  TEMPLATES_DIR: join(os.homedir(), '.nowa', 'templates'),
  NPM_CACHE_DIR: npmRunPath.env().npm_config_cache,
  IS_WIN,
};

