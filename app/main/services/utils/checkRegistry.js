const co = require('co');
const any = require('co-any');
const request = require('./request');
const config = require('../../config');

// const aliRegistry = 'https://registry.npm.alibaba-inc.com';
const urls = [
  'http://registry.npm.taobao.org',
  'http://registry.npmjs.org'
];




module.exports = function () {
  return co(function* () {
    if (!config.registryList()) {
      config.registryList(urls.join(','));
    }
    const registryList = config.registryList().split(',');
    
    console.time('registry');
    const { _key } = yield any(registryList.map(url => request(`${url}/nowa/latest`)));
    const registry = registryList[_key];
    console.timeEnd('registry');
    
    config.registry(registry);
    console.log('registry', registry);
    return registry;
  });
};
