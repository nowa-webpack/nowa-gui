const co = require('co');
const { join } = require('path');
const npminstall = require('npminstall');

const msg = JSON.parse(process.env.params);

const options = Object.assign({
  console,
  targetDir: msg.root,
  storeDir: join(msg.root, 'node_modules', '.npminstall'),
  timeout: 5 * 60000,
  cacheDir: null,
}, msg);

co(function* () {
  const timer = setInterval(() => {
    console.log('INSTALL_PROGRESS', options.progresses);
  }, 1000);
  yield npminstall(options);
  clearInterval(timer);
  console.log('INSTALL_PROGRESS', options.progresses);
  process.exit(0);
})
.catch(err => process.exit(1));

