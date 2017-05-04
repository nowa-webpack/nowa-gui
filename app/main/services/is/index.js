const is = require('electron-is');
const { app } = require('electron');
const os = require('os');
const { join } = require('path');
// const npmRunPath = require('npm-run-path');

const isMac = is.macOS();
const isWin = is.windows();
const isLinux = is.linux();
const isProd = is.production();
const isDev = is.dev();

const APP_PATH = isDev ? join(process.cwd(), 'app') : app.getAppPath();
const DOT_NOWA_PATH = join(os.homedir(), '.nowa-gui');
const TEMPLATES_DIR = join(DOT_NOWA_PATH, 'template');
const NOWA_INSTALL_DIR = join(DOT_NOWA_PATH, 'installation');
const USER_CONFIG_PATH = join(DOT_NOWA_PATH, 'user_config.json');

const NOWA_INSTALL_JSON_FILE = join(NOWA_INSTALL_DIR, 'nowa-version.json');
// const NOWA_BIN_PATH = join(NOWA_INSTALL_DIR, 'node_modules', '.bin');
const BIN_PATH = join(NOWA_INSTALL_DIR, 'node_modules', '.bin');
const NODE_MODULES_PATH = join(NOWA_INSTALL_DIR, 'node_modules');


// const NPM_PATH = join(APP_PATH, 'node_modules', 'npm', 'bin', 'npm-cli.js');
const NPM_PATH = join(NODE_MODULES_PATH, 'npm', 'bin', 'npm-cli.js');

const NODE_PATH = join(APP_PATH, 'nodes');

const LINK_NOWA_PATH = isWin ? join(process.env.APPDATA, 'npm', 'nowa') : '/usr/local/bin/nowa';

module.exports = {
  isMac,
  isWin,
  isLinux,
  isProd,
  isDev,

  constants: {
    APP_PATH,
    NODE_MODULES_PATH,
    BIN_PATH,
    NPM_PATH,
    TEMPLATES_DIR,
    NOWA_INSTALL_DIR,
    NOWA_INSTALL_JSON_FILE,
    NODE_PATH,
    LINK_NOWA_PATH,
    USER_CONFIG_PATH,
    DOT_NOWA_PATH,
  },
};
