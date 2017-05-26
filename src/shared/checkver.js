import { lt } from 'semver';
import semverDiff from 'semver-diff';
import { readJsonSync } from 'fs-extra';
import { join } from 'path';

import request from './request';

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
    item.updateType = semverDiff(item.installedVersion, data.version);
    item.needUpdate = lt(item.installedVersion, data.version);
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

    return item;
  }
};

export default { checkNpmLatest, checkLocalVerison };

