import fs from 'fs-extra';
import { LOCAL_PROJECTS } from '../constants';

const storage = window.localStorage;

export const getStoreProjects = () => JSON.parse(storage.getItem(LOCAL_PROJECTS)) || [];

export const setLocalProjects = (projects) => {
  storage.setItem(LOCAL_PROJECTS, JSON.stringify(projects));
};

export const getLocalProjects = () => {
  const projects = getStoreProjects();
  // 检查项目是否存在
  const filter = projects.filter(project => fs.existsSync(project.path));

  setLocalProjects(filter);

  return filter;
};


export const getLocalTemplateUpdate = type => storage.getItem(type);

export const setLocalTemplateUpdate = (type, date) => storage.setItem(type, date);
