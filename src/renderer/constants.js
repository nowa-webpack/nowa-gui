import { isWin } from 'shared-nowa';

export const SHUTDOWN_PAGE = 'SHUTDOWN_PAGE'; // 退出页面
export const PREINIT_PAGE = 'PREINIT_PAGE'; // 工具初始化安装nowa页面
export const WELCOME_PAGE = 'WELCOME_PAGE'; // 欢迎页面
export const SETTING_PAGE = 'SETTING_PAGE'; // 工具设置页面
export const BOILERPLATE_PAGE = 'BOILERPLATE_PAGE'; // 新建项目页面
export const PROJECT_PAGE = 'PROJECT_PAGE'; // 项目详情页面
export const FEEDBACK_PAGE = 'FEEDBACK_PAGE'; // 反馈页面
export const IMPORT_STEP1_PAGE = 'IMPORT_STEP1_PAGE'; // 确认源页面
export const IMPORT_STEP2_PAGE = 'IMPORT_STEP2_PAGE'; // 安装项目依赖页面
// export const COMMAND_SETTING_PAGE = 'COMMAND_SETTING_PAGE'; // 设置全局命令页面

export const LOCAL_PROJECTS = 'LOCAL_PROJECTS';
export const LANGUAGE = 'LANGUAGE';
export const GLOBAL_COMMANDS = 'GLOBAL_COMMANDS';
export const UPDATE_TIP = 'UPDATE_FLAG';
export const APPLYED_PLUGINS = 'APPLYED_PLUGINS';

export const EXTENSION_MAP = {
  win32: 'exe',
  darwin: 'dmg',
  linux: 'deb',
};

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

export const EDITOR = 'EDITOR';
export const SUBLIME_PATH = 'SUBLIME_PATH';
export const VSCODE_PATH = 'VSCODE_PATH';
export const WEBSTORM_PATH = 'WEBSTORM_PATH';
export const SUBLIME = 'Sublime';
export const VSCODE = 'VScode';
export const WEBSTORM = 'WebStorm';

export const VSCODE_BASE_PATH = isWin
  ? 'C:/Program Files (x86)/Microsoft VS Code'
  : '/Applications/Visual Studio Code.app';

export const SUBLIME_BASE_PATH = isWin
  ? 'C:/Program Files/Sublime Text 3'
  : '/Applications/Sublime Text.app';

export const WEBSTORM_BASE_PATH = isWin
  ? 'C:/Program Files (x86)/JetBrains/WebStorm 2017.1/bin/webstorm.exe'
  : '/Applications/WebStorm.app';

// export const UPGRADE_URL = isWin
//   ? 'https://alixux.org/downloads/nowa-gui.exe'
//   : isMac
//     ? 'https://alixux.org/downloads/nowa-gui.dmg'
//     : 'https://alixux.org/downloads/nowa-gui.deb';

export const URL_MATCH = /^((ht|f)tps?):\/\/([\w-]+(\.[\w-]+)*\/)*[\w-]+(\.[\w-]+)*\/?(\?([\w-.,@?^=%&:/~+#]*)+)?/;

export const VERSION_MATCH = /^\d+.\d+.\d+([.-\w])*$/;

// export const NAME_MATCH = /^([A-Za-z0-9]|[._@\/\-])+$/;
export const NAME_MATCH = /^(@\w+\/)?[\w-]+$/;

export const PORT_MATCH = /^([1-9]|[1-9]\d{1,3}|[1-6][0-5][0-5][0-3][0-5])$/;
