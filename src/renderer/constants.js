
export const LOCAL_PROJECTS = 'LOCAL_PROJECTS';
export const LANGUAGE = 'LANGUAGE';
export const EDITOR = 'EDITOR';
export const SUBMIT_PATH = 'SUBMIT_PATH';
export const VSCODE_PATH = 'VSCODE_PATH';
export const IS_WIN = process.platform === 'win32';

export const VSCODE_BASE_PATH = IS_WIN 
  ? 'C:/Program Files (x86)/Microsoft VS Code'
  : '/Applications/Visual Studio Code.app';

export const SUBLIME_BASE_PATH = IS_WIN 
  ? 'C:/Program Files/Sublime Text 3'
  : '/Applications/Sublime Text.app';

export const UPGRADE_URL = IS_WIN
  ? 'http://lab.onbing.com/nowa-gui.exe' 
  : 'http://lab.onbing.com/nowa-gui.dmg';

