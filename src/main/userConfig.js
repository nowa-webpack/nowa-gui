/*
  nowa-gui 用户配置
*/
import mkdirp from 'mkdirp';
import { existsSync, writeJsonSync, readJsonSync } from 'fs-extra';
import { USER_CONFIG_PATH, DOT_NOWA_PATH } from './services/paths';

const registryList = [
  'http://registry.npm.taobao.org',
  'http://registry.npmjs.org',
  'http://registry.npm.alibaba-inc.com',
];

class UserConfig {
  constructor() {
    this.config = {};
  }

  // 初始化配置文件
  init () {
    if (existsSync(USER_CONFIG_PATH)) {
      this.config = this.getConfig();
      if (!this.config.REGISTRY_LIST) {
        this.config.REGISTRY_LIST = registryList;
      }
    } else {
      mkdirp.sync(DOT_NOWA_PATH);
      this.config.REGISTRY_LIST = registryList;
    }
    this.writeConfig(this.config);
  }

  getConfig() {
    return readJsonSync(USER_CONFIG_PATH);
  }

  writeConfig(json) {
    return writeJsonSync(USER_CONFIG_PATH, json, { spaces: 2 });
  }

  setItem(key, value) {
    if (value) {
      this.config[key] = value;
      this.writeConfig(this.config);
    }
  }

  getItem(key) {
    return this.config[key];
  }

}

const userConfig = new UserConfig();
userConfig.init();

export default userConfig;
