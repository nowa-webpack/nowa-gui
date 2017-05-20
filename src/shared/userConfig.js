import mkdirp from 'mkdirp';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, writeJsonSync, readJsonSync } from 'fs-extra';
// import { USER_CONFIG_PATH, DOT_NOWA_PATH } from './services/paths';
const DOT_NOWA_PATH = join(homedir(), '.nowa-gui');
const USER_CONFIG_PATH = join(DOT_NOWA_PATH, 'user_config.json');

const registryList = [
  'http://registry.npm.taobao.org',
  'http://registry.npmjs.org',
  'http://registry.npm.alibaba-inc.com',
];

class UserConfig {
  constructor() {
    this.config = {};
    
    // this.init();
  }

  init () {
    if (existsSync(USER_CONFIG_PATH)) {
      console.log(1);
      this.config = this.getConfig();
      console.log(2);
      if (!this.config.REGISTRY_LIST) {
        console.log(3)
        this.config.REGISTRY_LIST = registryList;
      }
    } else {
      mkdirp.sync(DOT_NOWA_PATH);
      this.config.REGISTRY_LIST = registryList;
    }
    console.log(this.config);
    this.writeConfig(this.config);
  }

  getConfig() {
    return readJsonSync(USER_CONFIG_PATH);
  }

  writeConfig(json) {
    return writeJsonSync(USER_CONFIG_PATH, json, { spaces: 2 });
  }

  setItem(key, value) {
    console.log(key);
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
