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
    /*const token = 'be77cc501c1d5a466f91690266495a28b1a0e0cb654cc578cfd5a00dbd1b7850';
    const d = yield request(`https://oapi.dingtalk.com/robot/send?access_token=${token}`, {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',  
      },
      // body: form,
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: {
          title: '来自用户的反馈',
          text: '### 名字\n' +
                '10\n' +
                '### 联系方式\n' +
                '13900000000\n' +
                '### 反馈内容\n' +
                '测试消息：\n' +
                'testing\n',
        }
      })
    });*/


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
