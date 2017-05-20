import { join, basename } from 'path';
import { shell, remote } from 'electron';
import { tmpdir } from 'os';
import { readJsonSync, writeJsonSync, existsSync, readFileSync, writeFileSync } from 'fs-extra';
import notification from 'antd/lib/notification';

const { ejsRender } = remote.getGlobal('services');


export const hidePathString = (filePath, num: 70) => {

  if (!filePath) return '';
  const base = basename(filePath);

  if (filePath.length > num) {
    const shlen = num - 3 - base.length;
    return filePath.slice(0, shlen) + '...' + base;
  }

  return filePath;
};

export const hideBoilerplateDesp = (str) => {
  const size = str.length;
  if (size <= 45) return str;
  return str.slice(0, 42) + '...';
};


export const upperFirstCha = word => word.slice(0, 1).toUpperCase() + word.slice(1);

export const removeLoading = () => {
  const loading = document.getElementById('loading');

  if (loading) document.body.removeChild(loading);
};

export const openUrl = url => shell.openExternal(url);

export const getAddressByUID = (uid) => {
  const infoPath = join(tmpdir(), `.nowa-server-${uid}.json`);
  const info = readJsonSync(infoPath);
  return info.address;
};

export const writeToFile = (source, target, data) => {
  try {
    const tpl = readFileSync(source);
    let content;
    try {
      content = ejsRender(tpl.toString(), data);
    } catch (e) {
      content = tpl;
    }
    writeFileSync(target, content);
  } catch (e) {
    console.error(e);
  }
};

export const readABCJson = filePath => readJsonSync(join(filePath, 'abc.json')).options;
export const writeABCJson = (filePath, abc) => {
  const abcPath = join(filePath, 'abc.json');
  const file = readJsonSync(abcPath);
  file.options = abc;
  writeJsonSync(abcPath, file);
};

export const readPkgJson = filePath => readJsonSync(join(filePath, 'package.json'));
export const writePkgJson = (filePath, pkg) => writeJsonSync(join(filePath, 'package.json'), pkg, { spaces: 2 });
export const isNowaProject = filePath => existsSync(join(filePath, 'abc.json'));

export const getPkgDependencies = (pkgJson) => {
  const pkgs = [];
  const { dependencies, devDependencies } = pkgJson;

  if (dependencies) {
    Object.keys(dependencies).forEach((name) => {
      pkgs.push({
        name,
        version: dependencies[name]
      });
    });
  }

  if (devDependencies) {
    Object.keys(devDependencies).forEach((name) => {
      pkgs.push({
        name,
        version: devDependencies[name]
      });
    });
  }

  return pkgs;
};

export const isAliProject = (pkgJson) => {
  const pkgs = getPkgDependencies(pkgJson);
  const filter = pkgs.filter(item => /^@ali(pay|fe)?\//.test(item.name));
  return filter.length > 0;
};

export const msgError = (message, duration = 3) => {
  notification.error({
    className: 'ui-notification',
    message,
    // description, 
    duration,
  });
};

export const msgInfo = (message, duration = 3) => {
  notification.open({
    className: 'ui-notification',
    message, 
    duration,
  });
};

export const msgSuccess = (message, duration = 3) => {
  notification.success({
    className: 'ui-notification',
    message, 
    duration
  });
};
