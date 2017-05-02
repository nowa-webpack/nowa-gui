const fs = require('fs');
const os = require('os');
const { join } = require('path');

const target = '/usr/local/bin/nowa';
const srcNowa = join(os.homedir(), '.nowa-gui', 'node_modules', '.bin', 'nowa');
if (fs.existsSync(target)) {
  fs.removeSync(target);
}
fs.symlinkSync(srcNowa, target);