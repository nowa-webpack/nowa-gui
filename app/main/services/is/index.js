const is = require('electron-is');
const { app } = require('electron');
const os = require('os');
const { join } = require('path');
const npmRunPath = require('npm-run-path');

const isMac = is.macOS();
const isWin = is.windows();
const isLinux = is.linux();
const isProd = is.production();
const isDev = is.dev();

const APP_PATH = isDev ? join(process.cwd(), 'app') : app.getAppPath();
const DOT_NOWA_PATH = join(os.homedir(), '.nowa-gui');
const TEMPLATES_DIR = join(DOT_NOWA_PATH, 'template');
const NOWA_INSTALL_DIR = join(DOT_NOWA_PATH, 'installation');

const NOWA_INSTALL_JSON_FILE = join(NOWA_INSTALL_DIR, 'nowa-version.json');
// const NOWA_PATH = join(NOWA_INSTALL_DIR, 'node_modules', 'nowa');
const NOWA_BIN_PATH = join(NOWA_INSTALL_DIR, 'node_modules', '.bin');
const NOWA_PATH = join(NOWA_INSTALL_DIR, 'node_modules');

// const YARN_PATH = join(APP_PATH, 'node_modules', 'yarn', 'bin', 'yarn.js')
// const NPM_PATH = join(APP_PATH, 'node_modules', 'npm');
const NPM_PATH = join(APP_PATH, 'node_modules', 'npm', 'bin', 'npm-cli.js');

const NODE_PATH = join(APP_PATH, 'nodes');

module.exports = {
  isMac,
  isWin,
  isLinux,
  isProd,
  isDev,

  constants: {
    APP_PATH,
    NOWA_PATH,
    NOWA_BIN_PATH,
    NPM_PATH,
    TEMPLATES_DIR,
    NOWA_INSTALL_DIR,
    NOWA_INSTALL_JSON_FILE,
    NODE_PATH
  },
};
