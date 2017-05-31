import { join, basename } from 'path';
import { tmpdir } from 'os';
import fs from 'fs-extra';

export const hidePathString = (filePath, num: 70) => {
  const base = basename(filePath);

  if (filePath.length > num) {
    const shlen = num - 3 - base.length;
    return filePath.slice(0, shlen) + '...' + base;
  }

  return filePath;
};

export const delay = n => new Promise(resolve => setTimeout(resolve, n));

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

export const getAddressByUID = (uid) => {
  const infoPath = join(tmpdir(), `.nowa-server-${uid}.json`);
  const info = fs.readJsonSync(infoPath);
  return info.address;
};

export const upperFirstCha = (word) => {
  return word.slice(0, 1).toUpperCase() + word.slice(1);
};

export const readABCJson = filePath => fs.readJsonSync(join(filePath, 'abc.json')).options;
export const writeABCJson = (filePath, abc) => {
  const abcPath = join(filePath, 'abc.json');
  const file = fs.readJsonSync(abcPath);
  file.options = abc;
  fs.writeJsonSync(abcPath, file);
};
export const readPkgJson = filePath => fs.readJsonSync(join(filePath, 'package.json'));
export const writePkgJson = (filePath, pkg) => fs.writeJsonSync(join(filePath, 'package.json'), pkg);
export const isNowaProject = filePath => fs.existsSync(join(filePath, 'abc.json'));

export const isAliProject = (pkgJson) => {
  const pkgs = getPkgDependencies(pkgJson);
  const filter = pkgs.filter(item => /^@ali(pay|fe)?\//.test(item.name));
  return filter.length > 0;
};
