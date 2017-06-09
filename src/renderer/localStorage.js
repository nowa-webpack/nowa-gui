import { join } from 'path';
import { remote } from 'electron';
import { existsSync } from 'fs-extra';
import {
  LOCAL_PROJECTS,
  LANGUAGE,
  UPDATE_TIP,
  GLOBAL_COMMANDS,
  EDITOR,
  SUBLIME,
  VSCODE,
  WEBSTORM,
  SUBLIME_PATH,
  VSCODE_PATH,
  WEBSTORM_PATH,
  APPLYED_PLUGINS,
} from './constants';

const config = remote.getGlobal('config');
const { paths } = remote.getGlobal('services');

export const getStoreProjects = () => config.getItem(LOCAL_PROJECTS) || [];

export const setLocalProjects = projects =>
  config.setItem(LOCAL_PROJECTS, projects);

export const getLocalProjects = () => {
  const projects = getStoreProjects();
  // 检查项目是否存在
  const filter = projects.filter(project =>
    existsSync(join(project.path, 'package.json'))
  );

  setLocalProjects(filter);

  return filter;
};

export const getLocalLanguage = () => config.getItem(LANGUAGE);
export const setLocalLanguage = language => config.setItem(LANGUAGE, language);

export const getLocalEditor = () => config.getItem(EDITOR);
export const setLocalEditor = editor => config.setItem(EDITOR, editor);

export const getLocalEditorPath = (editor) => {
  if (editor === SUBLIME) {
    return config.getItem(SUBLIME_PATH);
  }
  if (editor === VSCODE) {
    return config.getItem(VSCODE_PATH);
  }
  if (editor === WEBSTORM) {
    return config.getItem(WEBSTORM_PATH);
  }
  return '';
};

export const setLocalEditorPath = (editor, editorPath) => {
  let defaultPath = SUBLIME_PATH;
  if (editor === VSCODE) {
    defaultPath = VSCODE_PATH;
  }
  if (editor === WEBSTORM) {
    defaultPath = WEBSTORM_PATH;
  }

  config.setItem(defaultPath, editorPath);
};

export const getLocalUpdateFlag = () => {
  const str = config.getItem(UPDATE_TIP);
  if (str) return str.split('|')[1];
  return 0;
};

export const setLocalUpdateFlag = version => config.setItem(UPDATE_TIP, `${version}|1`);

export const getLocalCommands = () => config.getItem(GLOBAL_COMMANDS) || [];

export const setLocalCommands = cmds => config.setItem(GLOBAL_COMMANDS, cmds);

export const setLocalPlugins = plugins => config.setItem(APPLYED_PLUGINS, plugins);

export const getLocalPlugins = () => {
  const plugins = config.getItem(APPLYED_PLUGINS) || [];
  // 检查项目是否存在
  const filter = plugins.filter(plugin =>
    existsSync(join(paths.BIN_PATH, plugin.cli))
  );

  setLocalPlugins(filter);
  return filter;
};
