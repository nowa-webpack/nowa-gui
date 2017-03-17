const co = require('co');
const any = require('co-any');
const request = require('./request');
const config = require('../../config');

const urls = ['http://registry.npm.alibaba-inc.com',
  'https://registry.npm.taobao.org',
  'https://registry.npmjs.org'
];


module.exports = () => co(function* () {
  const { _key } = yield any([
    request('http://registry.npm.alibaba-inc.com/nowa/latest'),
    request('https://registry.npm.taobao.org/nowa/latest'),
    request('https://registry.npmjs.org/nowa/latest'),
  ]);
  console.log('_key', _key);
  config.registry(urls[_key]);
});