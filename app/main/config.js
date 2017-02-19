const Config = require('electron-config');

const config = new Config();

module.exports = {
  setTemplateUpdate(type, time) {
    config.set(type, time);
  },
  getTemplateUpdate(type) {
    return config.get(type);
  },
  setTemplateVersion(type, version) {
    config.set(type, version);
  },
  getTemplateVersion(type) {
    return config.get(type);
  },
  clear() {
    config.clear();
  }
};
