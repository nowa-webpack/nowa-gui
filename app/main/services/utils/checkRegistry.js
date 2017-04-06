const co = require('co');
const any = require('co-any');
const request = require('./request');
const config = require('../../config');

// const aliRegistry = 'http://registry.npm.alibaba-inc.com';
const urls = [
  'https://registry.npm.taobao.org',
  'https://registry.npmjs.org'
];

module.exports = function () {
  return co(function* () {
    
    console.time('registry');
    const { _key } = yield any(urls.map(url => request(`${url}/nowa/latest`)));
    const registry = urls[_key];
    console.timeEnd('registry');
    
    config.registry(registry);
    console.log('registry', registry);
    return registry;
  });
};
