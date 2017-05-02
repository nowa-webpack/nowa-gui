const fs = require('fs-extra');
const os = require('os');
const { join } = require('path');

const target = '/usr/local/bin/nowa';
const srcNowa = join(os.homedir(), '.nowa-gui', 'installation', 'node_modules', '.bin', 'nowa');
if (fs.existsSync(target)) {
  console.log('exists nowa link');
  fs.removeSync(target);
}
fs.symlinkSync(srcNowa, target);
