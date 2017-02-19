const { app } = require('electron');
const isDev = require('electron-is-dev');
const { join } = require('path');
const os = require('os');
const npmRunPath = require('npm-run-path');


const APP_PATH = isDev ? join(process.cwd(), 'app') : app.getAppPath();

const NOWA = join(APP_PATH, 'node_modules', 'nowa');
// const NPM = join(APP_PATH, 'node_modules', 'npm', 'bin', 'npm-cli.js');

module.exports = {
  APP_PATH,
  NOWA,
  TEMPLATES_DIR: join(os.homedir(), '.nowa', 'templates'),
  // NPM,
  NPM_CACHE_DIR: npmRunPath.env().npm_config_cache
};

