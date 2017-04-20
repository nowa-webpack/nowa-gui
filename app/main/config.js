const Config = require('electron-config');

const config = new Config();

module.exports = {
  // setTemplateUpdate(type, time) {
  //   config.set(type, time);
  // },
  // getTemplateUpdate(type) {
  //   return config.get(type);
  // },
  setTemplateVersion(type, version) {
    config.set(type, version);
  },
  getTemplateVersion(type) {
    return config.get(type);
  },
  clear() {
    config.clear();
  },

  online() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      config.set('online', args[0]);
    } else {
      return config.get('online');
    }
  },

  encode() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      config.set('encode', args[0]);
    } else {
      return config.get('encode');
    }
  },


  registry() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      config.set('registry', args[0]);
    } else {
      return config.get('registry');
    }
  },

  registryList() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      config.set('registryList', args[0]);
    } else {
      return config.get('registryList');
    }
  },

  nowaNeedInstalled() {
    const args = [].slice.call(arguments);
    if (args.length > 0) {
      config.set('nowaNeedInstalled', args[0]);
    } else {
      return config.get('nowaNeedInstalled');
    }
  },
  
};
