import { join } from 'path';
import { homedir } from 'os';
import { isDev, isWin } from 'shared-nowa';
import { readJsonSync } from 'fs-extra';

export const APP_PATH = isDev ? join(process.cwd(), 'app') : join(process.resourcesPath, 'app');
// export const APP_PATH = isDev ? join(process.cwd(), 'app') : join(process.resourcesPath, 'app.asar');
export const NODE_PATH = join(APP_PATH, 'nodes');
export const LINK_NOWA_PATH = isWin ? join(process.env.APPDATA, 'npm', 'nowa') : '/usr/local/bin/nowa';

export const DOT_NOWA_PATH = join(homedir(), '.nowa-gui');
export const TEMPLATES_DIR = join(DOT_NOWA_PATH, 'template');
export const NOWA_INSTALL_DIR = join(DOT_NOWA_PATH, 'installation');
export const USER_CONFIG_PATH = join(DOT_NOWA_PATH, 'user_config.json');
export const NOWA_INSTALL_JSON_FILE = join(NOWA_INSTALL_DIR, 'nowa-version.json');

export const BIN_PATH = join(NOWA_INSTALL_DIR, 'node_modules', '.bin');
export const NODE_MODULES_PATH = join(NOWA_INSTALL_DIR, 'node_modules');
export const NPM_PATH = join(NODE_MODULES_PATH, 'npm', 'bin', 'npm-cli.js');

const appJson = readJsonSync(join(APP_PATH, 'package.json'));
export const APP_VERSION = appJson.version;
