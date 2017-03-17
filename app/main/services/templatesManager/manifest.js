const fs = require('fs-extra');
const { join } = require('path');
const mkdirp = require('mkdirp');

const { constants: { TEMPLATES_DIR } } = require('../is');
const manifestPath = join(TEMPLATES_DIR, 'manifest.json');


const getMainifest = () => {
  let manifest = {};

  try {
    manifest = fs.readJsonSync(manifestPath);
  } catch (e) {
    console.log(e);
  }

  return manifest;
};

const setMainifest = (newManifest) => {
  fs.writeJsonSync(manifestPath, newManifest);
};

const createManifest = () => {
  mkdirp.sync(TEMPLATES_DIR);
  fs.writeJsonSync(manifestPath, {});
};

if (!fs.existsSync(TEMPLATES_DIR)) {
  createManifest();
} else {
  const manifest = getMainifest();
  if (!manifest.offical) {
    fs.removeSync(TEMPLATES_DIR);
    createManifest();
  }
}

module.exports = {
  getMainifest,
  setMainifest
}