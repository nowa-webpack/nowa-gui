const co = require('co');
const any = require('co-any');
const request = require('./request');
const config = require('../../config');

const aliRegistry = 'http://registry.npm.alibaba-inc.com';
const urls = [
  'https://registry.npm.taobao.org',
  'https://registry.npmjs.org'
];

module.exports = function () {
  return co(function* () {
    let registry = aliRegistry;
    const { err } = yield request(`${aliRegistry}/nowa/latest`, { timeout: 5000 });
    if (err) {
      const { _key } = yield any(urls.map(url => request(`${url}/nowa/latest`)));
      registry = urls[_key];
    }
    config.registry(registry);
    console.log('registry', registry);
    return registry;
  });
};
