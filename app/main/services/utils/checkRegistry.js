const co = require('co');
const any = require('co-any');
const request = require('./request');
const config = require('../../config');

const urls = [
  'https://registry.npm.taobao.org',
  'http://registry.npm.alibaba-inc.com',
  'https://registry.npmjs.org'
];


module.exports = () => co(function* () {
  const { _key } = yield any([
    request('https://registry.npm.taobao.org/nowa/latest'),
    request('http://registry.npm.alibaba-inc.com/nowa/latest'),
    request('https://registry.npmjs.org/nowa/latest'),
  ]);
  console.log('registry', urls[_key]);
  config.registry(urls[_key]);
});