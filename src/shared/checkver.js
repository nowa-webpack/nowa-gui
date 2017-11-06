import { lt, satisfies, validRange, diff } from 'semver';
import semverDiff from 'semver-diff';
import { readJsonSync } from 'fs-extra';
import { join } from 'path';

import request from './request';

const checkDiff = (latesetVersion, localVersion) => {
  return !satisfies(latesetVersion, `^${localVersion}`);
  // return diff(latesetVersion, `${localVersion}`);
};

/*
* 获取源上最新版本
* item = {
    name: string,
    installedVersion: string
  }
* registry: url
*/
const checkNpmLatest = async function (item, registry) {

  const { err, data } = await request(`${registry}/${item.name}/latest`);

  if (!err) {
    item.latestVersion = data.version;
    if (item.installedVersion !== 'null') {
      item.updateType = checkDiff(data.version, item.installedVersion);
      // item.updateType = diff(item.installedVersion, data.version);
      item.needUpdate = lt(item.installedVersion, data.version);
    } else {
      item.updateType = false;
      // item.updateType = 'patch';
      item.needUpdate = true;
    }
  } else {
    item.needUpdate = false;
    item.latestVersion = item.installedVersion;
  }

  return item;
};

/*
* 获取本地安装版本
* item = {
  name: string,
  version: string
}
*/
const checkLocalVerison = (item, folder) => {

  const pkgPath = join(folder, 'node_modules', item.name, 'package.json');

  try {
    const pkg = readJsonSync(pkgPath);

    return { ...item, installedVersion: pkg.version };

    // return Object.assign(item, { installedVersion: pkg.version });

  } catch (e) {

    console.log(e.message);

    return {...item, installedVersion: 'null'};
  }
};

export default { checkNpmLatest, checkLocalVerison, checkDiff };

