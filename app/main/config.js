const mkdirp = require('mkdirp');
const { existsSync, writeJsonSync, readJsonSync } = require('fs-extra');
const { constants: { USER_CONFIG_PATH, DOT_NOWA_PATH } } = require('./services/is');

let userConfig = {};

const getConfig = () => readJsonSync(USER_CONFIG_PATH);
const writeConfig = json => writeJsonSync(USER_CONFIG_PATH, json);
const setConfig = (key, value) => {
  userConfig[key] = value;
  writeConfig(userConfig);
};

if (existsSync(USER_CONFIG_PATH)) {
  userConfig = getConfig();
} else {
  mkdirp.sync(DOT_NOWA_PATH);
  writeConfig({});
}

module.exports = {
  online() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      setConfig('ONLINE', args[0]);
      // config.set('online', args[0]);
    } else {
      return userConfig.ONLINE;
      // return config.get('online');
    }
  },
  encode() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      setConfig('ENCODE', args[0]);
      // config.set('encode', args[0]);
    } else {
      // return config.get('encode');
      return userConfig.ENCODE;
    }
  },
  registry() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      setConfig('REGISTRY', args[0]);
      // config.set('registry', args[0]);
    } else {
      // return config.get('registry');
      return userConfig.REGISTRY;
    }
  },
  registryList() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      // config.set('registryList', args[0]);
      setConfig('REGISTRY_LIST', args[0]);
    } else {
      // return config.get('registryList');
      return userConfig.REGISTRY_LIST;
    }
  },
  getConfig,
  writeConfig,
  setConfig,

  // nowaNeedInstalled() {
  //   const args = [].slice.call(arguments);
  //   if (args.length > 0) {
  //     config.set('nowaNeedInstalled', args[0]);
  //   } else {
  //     return config.get('nowaNeedInstalled');
  //   }
  // },
  // setTemplateVersion(type, version) {
  //   config.set(type, version);
  // },
  // getTemplateVersion(type) {
  //   return config.get(type);
  // },
  // clear() {
  //   config.clear();
  // },
};
