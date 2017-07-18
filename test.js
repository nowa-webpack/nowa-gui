const regedit = require('node-reg');
const { join } = require('path');
const { writeFileSync } = require('fs');
const { execSync } = require('child_process');

const APP_PATH = join(__dirname, 'app', 'task', 'env.reg');

const templateStr = (buf) =>
`Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Environment]
"PATH"=hex(2):${buf},00,00,00`;

// "NOWA_PATH"="${NODE_PATH.replace(/\\/g, '\\\\')};${BIN_PATH.replace(/\\/g, '\\\\')}"
regedit.getKey({
  target: 'HKEY_CURRENT_USER\\Environment',
  name: 'PATH'
}).then(res => {
	const prestr = res.split('\r\n')[2].split('    ')[3];
  const set = new Set(prestr.split(';').filter(n => !!n));
  const hasNowa = [...set].some(item => item.indexOf('NOWA_PATH') !== -1);
  if (!hasNowa) {


  const str = `${[...set].join(';')};%NOWA_PATH%`;

  // .replace(/\\/g, '\\\\'); 
  console.log(str);
  const buf = new Buffer(str, 'utf-8');
  const a = buf.toString('hex').match(/\w{2}/g).join(',00,');
  // console.log(a);
  // const a = Array.from().join(',00,');

  writeFileSync(APP_PATH, templateStr(a), {
    // flag: 'a'
  });

  execSync(`REG IMPORT ${APP_PATH}`);
  }
})

// const s = '67,00,58,00,92,00,92,00,80,00,114,00,111,00,103,00,114,00,97,00,109,00,68,00,97,00,116,00,97,00,92,00,92,00,79,00,114,00,97,00,99,00,108,00,101,00,92,00,92,00,74,00,97,00,118,00,97,00,92,00,92,00,106,00,97,00,118,00,97,00,112,00,97,00,116,00,104,00,59,00,37,00,78,00,79,00,87,00,65,00,95,00,80,00,65,00,84,00,72,00,37,00,00,00'

// // const s = '25,00,55,00,53,00,45,00,52,00,50,00,52,00,4f,00,46,00,49,00,4c,00,45,00,25,00,5c,00,41,00,70,00,70,00,44,00,61,00,74,00,61,00,5c,00,4c,00,6f,00,63,00,61,00,6c,00,5c,00,54,00,65,00,6d,00,70,00,00,00'

// const a = Buffer.from(s.split(',').join(''), 'hex')

// console.log(a.toString('utf-8'));
