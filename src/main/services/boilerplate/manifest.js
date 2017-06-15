import mkdirp from 'mkdirp';
import { join } from 'path';
import { existsSync, readJsonSync, writeJsonSync, removeSync } from 'fs-extra';

import { TEMPLATES_DIR } from '../paths';
import log from '../applog';

const manifestPath = join(TEMPLATES_DIR, 'manifest.json');

const getMainifest = () => {
  let manifest = {};

  try {
    manifest = readJsonSync(manifestPath);
  } catch (e) {
    console.log(e);
    log.error(e);
  }

  return manifest;
};

const setMainifest = (type, data) => {
  // console.log(newManifest)
  const manifest = getMainifest();
  manifest[type] = data;
  try {
    writeJsonSync(manifestPath, manifest, { spaces: 2 });
  } catch (e) {
    console.log(e);
    log.error(e);
  }
};

const createManifest = () => {
  try {
    mkdirp.sync(TEMPLATES_DIR);
    writeJsonSync(manifestPath, {
      official: [],
      ali: [],
      remote: [],
      local: [],
      ant: []
    });
  } catch (e) {
    console.log(e);
    log.error(e);
  }
};

if (!existsSync(TEMPLATES_DIR) || !existsSync(manifestPath)) {
  createManifest();
} else {
  const manifest = getMainifest();
  // 兼容旧版本
  if (!manifest.official) {
    removeSync(TEMPLATES_DIR);
    createManifest();
  }
}

export { getMainifest, setMainifest };
