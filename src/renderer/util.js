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

export const getAddressByUID = (uid) => {
  const infoPath = join(tmpdir(), `.nowa-server-${uid}.json`);
  const info = fs.readJsonSync(infoPath);
  return info.address;
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
