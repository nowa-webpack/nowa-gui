import { join, basename } from 'path';
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
  for (let name in pkgJson.dependencies) {
    pkgs.push({
      name,
      version: pkgJson.dependencies[name]
    });
  }

  for (let name in pkgJson.devDependencies) {
    pkgs.push({
      name,
      version: pkgJson.devDependencies[name]
    });
  }

  return pkgs;
};

export const readABCJson = filePath => fs.readJsonSync(join(filePath, 'abc.json'));
export const readPkgJson = filePath => fs.readJsonSync(join(filePath, 'package.json'));
export const isNowaProject = filePath => fs.existsSync(join(filePath, 'abc.json'));
