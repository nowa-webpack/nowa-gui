import fs from 'fs-extra';
import { join } from 'path';
import { 
  LOCAL_PROJECTS, LANGUAGE, EDITOR, UPDATE_TIP,
  SUBLIME, VSCODE, WEBSTORM, SUBMIT_PATH, VSCODE_PATH, WEBSTORM_PATH
} from 'gui-const';

const storage = window.localStorage;

export const getStoreProjects = () => JSON.parse(storage.getItem(LOCAL_PROJECTS)) || [];

export const setLocalProjects = (projects) => {
  storage.setItem(LOCAL_PROJECTS, JSON.stringify(projects));
};

export const getLocalProjects = () => {
  const projects = getStoreProjects();
  // 检查项目是否存在
  const filter = projects.filter(project => fs.existsSync(join(project.path, 'package.json')));

  setLocalProjects(filter);

  return filter;
};

export const getLocalTemplateUpdate = type => storage.getItem(type);
export const setLocalTemplateUpdate = (type, date) => storage.setItem(type, date);

export const getLocalLanguage = () => storage.getItem(LANGUAGE);
export const setLocalLanguage = language => storage.setItem(LANGUAGE, language);

export const getLocalEditor = () => storage.getItem(EDITOR);
export const setLocalEditor = editor => storage.setItem(EDITOR, editor);


export const getLocalEditorPath = (editor) => {
  if (editor === SUBLIME) {
    return storage.getItem(SUBMIT_PATH);
  }
  if (editor === VSCODE) {
    return storage.getItem(VSCODE_PATH);
  }
  if (editor === WEBSTORM) {
    return storage.getItem(WEBSTORM_PATH);
  }
};

export const setLocalEditorPath = (editor, editorPath) => {
  if (editor === SUBLIME) {
    storage.setItem(SUBMIT_PATH, editorPath);
  }
  if (editor === VSCODE) {
    storage.setItem(VSCODE_PATH, editorPath);
  }
  if (editor === WEBSTORM) {
    storage.setItem(WEBSTORM_PATH, editorPath);
  }
};

// export const getLocalUpdateFlag = () => storage.getItem(UPDATE_TIP);
// export const setLocalUpdateFlag = () => storage.setItem(UPDATE_TIP, 1);

export const getLocalUpdateFlag = () => {
  const str = storage.getItem(UPDATE_TIP);
  if (str) return str.split('|')[1];
  return 0;
};

export const setLocalUpdateFlag = (version) => {
  // return storage.getItem(UPDATE_TIP).split('|')[1];
  storage.setItem(UPDATE_TIP, `${version}|1`);
};

