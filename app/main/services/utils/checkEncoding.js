const { execSync } = require('child_process');
const { isWin } = require('../is');
const config = require('../../config');

const encodeMap = {
  437: 'UTF-8',
  950: 'GBK',
  936: 'GBK',
};

module.exports = function () {
  let encode = 'UTF-8';
  if (isWin) {
    const pageCode = execSync('chcp').toString().split(':')[1].trim();
    if (encodeMap[pageCode]) encode = encodeMap[pageCode];
  } else {
    encode = process.env.LANG.split('.')[1];
  }

  console.log('encode', encode);
  config.encode(encode);
  return encode;
};
