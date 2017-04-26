const co = require('co');
const any = require('co-any');
const request = require('./request');
const config = require('../../config');

const aliRegistry = 'http://registry.npm.alibaba-inc.com';

const urls = [
  'http://registry.npm.taobao.org',
  'http://registry.npmjs.org',
  aliRegistry,
];

module.exports = function () {
  return co(function* () {
    if (!config.registryList()) {
      config.registryList(urls);
    }

    if (!config.registry()) {
      const rl = urls.filter(n => n !== aliRegistry);
      
      console.time('registry');
      const { _key } = yield any(rl.map(url => request(`${url}/nowa/latest`)));
      const registry = rl[_key];
      console.timeEnd('registry');
      
      config.registry(registry);
      console.log('registry', registry);
      return registry;

    } else {
      return config.registry();
    }
  });
};
