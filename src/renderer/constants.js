
export const LOCAL_PROJECTS = 'LOCAL_PROJECTS';
export const LANGUAGE = 'LANGUAGE';
export const EDITOR = 'EDITOR';
export const UPDATE_TIP = 'UPDATE_FLAG';
export const SUBLIME_PATH = 'SUBLIME_PATH';
export const VSCODE_PATH = 'VSCODE_PATH';
export const WEBSTORM_PATH = 'WEBSTORM_PATH';
export const SUBLIME = 'Sublime';
export const VSCODE = 'VScode';
export const WEBSTORM = 'WebStorm';
export const IS_WIN = process.platform === 'win32';
export const IS_MAC = process.platform === 'darwin';

export const REGISTRY_MAP = {
  npm: 'http://registry.npmjs.org',
  cnpm: 'http://registry.npm.taobao.org',
  tnpm: 'http://registry.npm.alibaba-inc.com',
};

export const NPM_MAP = {
  'http://registry.npmjs.org': 'npm',
  'http://registry.npm.taobao.org': 'cnpm',
  'http://registry.npm.alibaba-inc.com': 'tnpm',
};

export const EXTENSION_MAP = {
  win32: 'exe',
  darwin: 'dmg',
  linux: 'deb',
};

export const VSCODE_BASE_PATH = IS_WIN
  ? 'C:/Program Files (x86)/Microsoft VS Code'
  : '/Applications/Visual Studio Code.app';

export const SUBLIME_BASE_PATH = IS_WIN
  ? 'C:/Program Files/Sublime Text 3'
  : '/Applications/Sublime Text.app';

export const WEBSTORM_BASE_PATH = IS_WIN
  ? 'C:/Program Files (x86)/JetBrains/WebStorm 2017.1/bin/webstorm.exe'
  : '/Applications/WebStorm.app';

export const UPGRADE_URL = IS_WIN
  ? 'https://alixux.org/downloads/nowa-gui.exe'
  : IS_MAC
    ? 'https://alixux.org/downloads/nowa-gui.dmg'
    : 'https://alixux.org/downloads/nowa-gui.deb';
  // ? 'http://lab.onbing.com/nowa-gui.exe'
  // : 'http://lab.onbing.com/nowa-gui.dmg';

const inner_url = [
  'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/nowa-test/nowa-gui.dmg',
  'http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/nowa-test/nowa-gui.exe'
];

export const LOCAL_TEMP_PATHS = 'LOCAL_TEMP_PATHS';
export const REMOTE_TEMP_URLS = 'REMOTE_TEMP_URLS';

export const DINGDING_TOKEN = 'be77cc501c1d5a466f91690266495a28b1a0e0cb654cc578cfd5a00dbd1b7850';
// export const DINGDING_TOKEN = '399b920a41af24d5c4d0e12f302a496a37e816bf7eaad10aa59fb93f8330cc78';


export const URL_MATCH = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;

export const VERSION_MATCH = /^\d+\.\d+\.\d+([\.\-\w])*$/;

// export const NAME_MATCH = /^([A-Za-z0-9]|[._@\/\-])+$/;
export const NAME_MATCH = /^(@\w+\/)?[\w\-]+$/;

export const PORT_MATCH = /^([1-9]|[1-9]\d{1,3}|[1-6][0-5][0-5][0-3][0-5])$/;
