import { join } from 'path';
import { lt } from 'semver';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { readJsonSync, writeJsonSync, existsSync } from 'fs-extra';
import { checkver } from 'shared-nowa';
import config from 'config-main-nowa';

import { NOWA_INSTALL_JSON_FILE, NOWA_INSTALL_PACKAGE_JSON_FILE, NOWA_INSTALL_DIR, NODE_MODULES_PATH } from '../paths';
import log from '../applog';

export const readNowaVer = () => readJsonSync(NOWA_INSTALL_JSON_FILE);

export const writeNowaVer = json => writeJsonSync(NOWA_INSTALL_JSON_FILE, json, { spaces: 2 });

export const existsNowaPackageJSON = () => existsSync(NOWA_INSTALL_PACKAGE_JSON_FILE);
export const writeNowaPackageJSON = json => writeJsonSync(NOWA_INSTALL_PACKAGE_JSON_FILE, json, { spaces: 2 });

export const existsNowa = () => existsSync(NOWA_INSTALL_JSON_FILE);

// export const getLocalPkgsName = () => {
export const getLocalPkg = () => {
  if (!existsNowa()) return [];

  const pkgs = readNowaVer();
  return Object.keys(pkgs).map(name => ({ name, installedVersion: pkgs[name] }));
};

export const checkNpmVer = async function (pkgs) {
  const registry = config.getItem('REGISTRY');
  const latestPkgs = await Promise.all(pkgs.map(pkg => checkver.checkNpmLatest(pkg, registry)));

  return latestPkgs.filter(pkg => pkg.needUpdate).map(pkg => pkg.name);
};

export const getInstallOpt = pkgs =>
  ({
    root: NOWA_INSTALL_DIR,
    registry: config.getItem('REGISTRY'),
    // trace: false,
    // sender: 'nowa-install',
    pkgs,
  });

export const saveNewPkg = (pkgs) => {
  const json = readNowaVer();
  pkgs.forEach((name) => {
    const pkgPath = join(NODE_MODULES_PATH, name, 'package.json');
    const version = readJsonSync(pkgPath).version;
    json[name] = version;
  });

  writeNowaVer(json);
};

export const nowaDiff = () => {
  const curNowa = readNowaVer().nowa;
  const oldNowaPath = join(homedir(), '.nowa', 'latest-versions.json');
  const nowaCliPath = join(homedir(), '.nowa', 'install');
  try {
    if (!existsSync(nowaCliPath)) {
      return false;
    }

    const res = execSync('nowa -V');
    return lt(`${res}`, curNowa);
  } catch (e) {
    log.error(e);
    return false;
  }
};

